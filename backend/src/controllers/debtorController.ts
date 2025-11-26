import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";

const debtorSchema = z.object({
    name: z.string().min(1),
    avatar: z.string().optional(),
});

export const getDebtors = async (req: Request, res: Response) => {
    try {
        // @ts-expect-error - req.user is added by auth middleware
        const userId = req.user.userId;
        const debtors = await prisma.debtor.findMany({
            where: { userId },
            include: {
                debts: {
                    orderBy: { createdAt: "desc" },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        res.json(debtors);
    } catch (_error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const createDebtor = async (req: Request, res: Response) => {
    try {
        // @ts-expect-error - req.user is added by auth middleware
        const userId = req.user.userId;
        const data = debtorSchema.parse(req.body);

        const debtor = await prisma.debtor.create({
            data: {
                ...data,
                userId,
            },
        });

        res.status(201).json(debtor);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateDebtor = async (req: Request, res: Response) => {
    try {
        // @ts-expect-error - req.user is added by auth middleware
        const userId = req.user.userId;
        const { id } = req.params;
        const data = debtorSchema.parse(req.body);

        const debtor = await prisma.debtor.findUnique({ where: { id } });

        if (!debtor || debtor.userId !== userId) {
            return res.status(404).json({ message: "Debtor not found" });
        }

        const updatedDebtor = await prisma.debtor.update({
            where: { id },
            data,
        });

        res.json(updatedDebtor);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteDebtor = async (req: Request, res: Response) => {
    try {
        // @ts-expect-error - req.user is added by auth middleware
        const userId = req.user.userId;
        const { id } = req.params;

        const debtor = await prisma.debtor.findUnique({ where: { id } });

        if (!debtor || debtor.userId !== userId) {
            return res.status(404).json({ message: "Debtor not found" });
        }

        await prisma.debtor.delete({ where: { id } });

        res.status(204).send();
    } catch (_error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
