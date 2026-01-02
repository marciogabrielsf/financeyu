import { Request, Response } from "express";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, tool } from "ai";
import { z } from "zod";
import prisma from "../lib/prisma";
import { format } from "date-fns";

interface JwtUser {
    userId: string;
}

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const chat = async (req: Request, res: Response) => {
    try {
        const user = req.user as JwtUser;
        const userId = user.userId;
        const { messages } = req.body;

        // Fetch context
        const cards = await prisma.card.findMany({ where: { userId } });
        const debtors = await prisma.debtor.findMany({ where: { userId } });

        const context = `
      Current User Context:
      Cards: ${JSON.stringify(cards.map((c) => ({ id: c.id, name: c.name })))}
      Debtors: ${JSON.stringify(debtors.map((d) => ({ id: d.id, name: d.name })))}
      Current Date: ${new Date().toISOString()}
    `;

        const result = await streamText({
            model: google("gemini-2.5-flash"),
            system: `You are a helpful financial assistant called FinanceYu AI. You help the user manage their debts and cards.
      Use the provided tools to perform actions.
      When adding a debt, try to match the card and debtor names from the context.
      If a card or debtor is not found, ask the user for clarification.
      When searching for debts, default to showing unpaid debts unless the user explicitly asks for history or paid debts.
      Always confirm the action taken to the user.
      Respond in Portuguese (Brazil).
      Use Markdown to format your responses (bold, lists, tables) when appropriate to make it easier to read.
      ${context}`,
            messages,
            tools: {
                addDebt: tool({
                    description: "Add a new debt",
                    parameters: z.object({
                        amount: z.number().describe("The amount of the debt"),
                        description: z
                            .string()
                            .describe(
                                "A short description of the debt, e.g., 'Uber', 'Conta de luz'"
                            ),
                        date: z.string().describe("ISO date string YYYY-MM-DD"),
                        cardId: z.string().describe("The ID of the card"),
                        debtorId: z.string().describe("The ID of the debtor"),
                        installments: z
                            .number()
                            .optional()
                            .default(1)
                            .describe("Number of installments"),
                    }),
                    execute: async (params: {
                        amount: number;
                        description: string;
                        date: string;
                        cardId: string;
                        debtorId: string;
                        installments: number;
                    }) => {
                        try {
                            console.log("Executing addDebt with params:", params);
                            const { amount, description, date, cardId, debtorId, installments } =
                                params;
                            let finalCardId = cardId;
                            let finalDebtorId = debtorId;

                            // Validate IDs format (basic check)
                            if (!finalCardId.match(/^[0-9a-fA-F-]{36}$/)) {
                                const card = await prisma.card.findFirst({
                                    where: {
                                        userId,
                                        name: { contains: finalCardId, mode: "insensitive" },
                                    },
                                });
                                if (!card)
                                    throw new Error(
                                        `Card not found with ID or name: ${finalCardId}`
                                    );
                                finalCardId = card.id;
                            }

                            if (!finalDebtorId.match(/^[0-9a-fA-F-]{36}$/)) {
                                const debtor = await prisma.debtor.findFirst({
                                    where: {
                                        userId,
                                        name: { contains: finalDebtorId, mode: "insensitive" },
                                    },
                                });
                                if (!debtor)
                                    throw new Error(
                                        `Debtor not found with ID or name: ${finalDebtorId}`
                                    );
                                finalDebtorId = debtor.id;
                            }

                            const debtDate = new Date(date);
                            const debt = await prisma.debt.create({
                                data: {
                                    amount,
                                    description,
                                    date: debtDate,
                                    month: format(debtDate, "yyyy-MM"),
                                    cardId: finalCardId,
                                    debtorId: finalDebtorId,
                                    userId,
                                    currentInstallment: 1,
                                    totalInstallments: installments,
                                },
                            });
                            return { success: true, debt };
                        } catch (error: any) {
                            console.error("Error in addDebt:", error);
                            return { success: false, error: error.message };
                        }
                    },
                }),
                getDebts: tool({
                    description:
                        "Get list of debts. Use this to find debts for a specific debtor or generally. Always prefer to filter by status 'unpaid' unless the user asks for history.",
                    parameters: z.object({
                        limit: z
                            .number()
                            .optional()
                            .default(10)
                            .describe("Number of debts to return. Max 50."),
                        debtorName: z.string().optional().describe("Filter by debtor name"),
                        status: z
                            .enum(["paid", "unpaid", "all"])
                            .optional()
                            .default("unpaid")
                            .describe("Filter by payment status. Defaults to 'unpaid'."),
                    }),
                    execute: async (params: {
                        limit: number;
                        debtorName?: string;
                        status?: "paid" | "unpaid" | "all";
                    }) => {
                        const { limit, debtorName, status } = params;
                        const where: any = { userId };

                        if (debtorName) {
                            where.debtor = {
                                name: { contains: debtorName, mode: "insensitive" },
                            };
                        }

                        if (status && status !== "all") {
                            where.paid = status === "paid";
                        }

                        // Enforce a hard limit to prevent token overflow
                        const safeLimit = Math.min(limit, 50);

                        const debts = await prisma.debt.findMany({
                            where,
                            take: safeLimit,
                            orderBy: { date: "desc" },
                            include: { card: true, debtor: true },
                        });
                        return { debts };
                    },
                }),
                markDebtAsPaid: tool({
                    description: "Mark a debt as paid",
                    parameters: z.object({
                        debtId: z.string().describe("The ID of the debt to mark as paid"),
                    }),
                    execute: async (params: { debtId: string }) => {
                        const { debtId } = params;
                        // Check if debt belongs to user
                        const debt = await prisma.debt.findUnique({
                            where: { id: debtId },
                        });
                        if (!debt || debt.userId !== userId) {
                            throw new Error("Debt not found or access denied");
                        }
                        const updated = await prisma.debt.update({
                            where: { id: debtId },
                            data: { paid: true },
                        });
                        return { success: true, debt: updated };
                    },
                }),
            },
            maxToolRoundtrips: 5,
        });

        result.pipeDataStreamToResponse(res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
