import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";

const debtSchema = z.object({
    description: z.string().min(1),
    amount: z.number().positive(),
    date: z.string().datetime(), // ISO Date string
    month: z.string().regex(/^\d{4}-\d{2}$/), // YYYY-MM
    paid: z.boolean().optional(),
    currentInstallment: z.number().int().positive().optional(),
    totalInstallments: z.number().int().positive().optional(),
    cardId: z.string().uuid().optional(),
    debtorId: z.string().uuid().optional(),
});

export const getDebts = async (req: Request, res: Response) => {
    try {
        // @ts-expect-error - req.user is added by auth middleware
        const userId = req.user.userId;
        const debts = await prisma.debt.findMany({
            where: { userId },
            include: {
                card: true,
                debtor: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        res.json(debts);
    } catch (_error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const createDebt = async (req: Request, res: Response) => {
    try {
        // @ts-expect-error - req.user is added by auth middleware
        const userId = req.user.userId;
        const data = debtSchema.parse(req.body);

        let month = data.month;

        if (data.cardId) {
            const card = await prisma.card.findUnique({ where: { id: data.cardId } });
            if (card) {
                const debtDate = new Date(data.date);

                // Logic to determine the correct month based on billing cycle
                // Assuming closing date is 10 days before due date
                const closingGap = 10;

                // 1. Determine candidate due date (same month as debt)
                const candidateDueDate = new Date(
                    debtDate.getFullYear(),
                    debtDate.getMonth(),
                    card.dueDay
                );

                // If debt is already past this month's due date, start checking from next month
                if (debtDate > candidateDueDate) {
                    candidateDueDate.setMonth(candidateDueDate.getMonth() + 1);
                }

                // 2. Calculate closing date for this candidate
                const closingDate = new Date(candidateDueDate);
                closingDate.setDate(closingDate.getDate() - closingGap);

                // 3. Compare
                const finalDueDate = new Date(candidateDueDate);
                if (debtDate > closingDate) {
                    // Missed the cycle, goes to next month
                    finalDueDate.setMonth(finalDueDate.getMonth() + 1);
                }

                month = finalDueDate.toISOString().slice(0, 7); // YYYY-MM
            }
        } else {
            // If no card, ensure month matches the date
            const debtDate = new Date(data.date);
            month = debtDate.toISOString().slice(0, 7);
        }

        const debt = await prisma.debt.create({
            data: {
                ...data,
                month,
                userId,
            },
        });

        res.status(201).json(debt);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateDebt = async (req: Request, res: Response) => {
    try {
        // @ts-expect-error - req.user is added by auth middleware
        const userId = req.user.userId;
        const { id } = req.params;
        const data = debtSchema.partial().parse(req.body);

        const existingDebt = await prisma.debt.findUnique({
            where: { id },
            include: { card: true },
        });

        if (!existingDebt || existingDebt.userId !== userId) {
            return res.status(404).json({ message: "Debt not found" });
        }

        // Recalculate month if date or card changes
        let month = data.month || existingDebt.month;

        const targetCardId = data.cardId || existingDebt.cardId;
        const targetDateStr = data.date || existingDebt.date.toISOString();

        if (targetCardId) {
            // Fetch card if it changed, otherwise use existing if available
            let card = existingDebt.card;
            if (data.cardId && data.cardId !== existingDebt.cardId) {
                card = await prisma.card.findUnique({ where: { id: data.cardId } });
            }

            if (card) {
                const debtDate = new Date(targetDateStr);
                const closingGap = 10;

                const candidateDueDate = new Date(
                    debtDate.getFullYear(),
                    debtDate.getMonth(),
                    card.dueDay
                );

                if (debtDate > candidateDueDate) {
                    candidateDueDate.setMonth(candidateDueDate.getMonth() + 1);
                }

                const closingDate = new Date(candidateDueDate);
                closingDate.setDate(closingDate.getDate() - closingGap);

                const finalDueDate = new Date(candidateDueDate);
                if (debtDate > closingDate) {
                    finalDueDate.setMonth(finalDueDate.getMonth() + 1);
                }

                month = finalDueDate.toISOString().slice(0, 7);
            }
        } else if (data.date) {
            // If no card but date changed, update month to match date
            const debtDate = new Date(data.date);
            month = debtDate.toISOString().slice(0, 7);
        }

        const updatedDebt = await prisma.debt.update({
            where: { id },
            data: {
                ...data,
                month,
            },
        });

        res.json(updatedDebt);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteDebt = async (req: Request, res: Response) => {
    try {
        // @ts-expect-error - req.user is added by auth middleware
        const userId = req.user.userId;
        const { id } = req.params;

        const debt = await prisma.debt.findUnique({ where: { id } });

        if (!debt || debt.userId !== userId) {
            return res.status(404).json({ message: "Debt not found" });
        }

        await prisma.debt.delete({ where: { id } });

        res.status(204).send();
    } catch (_error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
