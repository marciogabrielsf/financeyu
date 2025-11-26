import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";

const cardSchema = z.object({
    name: z.string().min(1),
    color: z.string(),
    dueDay: z.number().min(1).max(31),
    lastDigits: z.string().length(4),
    expiryDate: z.string(),
});

export const getCards = async (req: Request, res: Response) => {
    try {
        // @ts-expect-error - req.user is added by auth middleware
        const userId = req.user.userId;
        const cards = await prisma.card.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        res.json(cards);
    } catch (_error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const createCard = async (req: Request, res: Response) => {
    try {
        // @ts-expect-error - req.user is added by auth middleware
        const userId = req.user.userId;
        const data = cardSchema.parse(req.body);

        const card = await prisma.card.create({
            data: {
                ...data,
                userId,
            },
        });

        res.status(201).json(card);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateCard = async (req: Request, res: Response) => {
    try {
        // @ts-expect-error - req.user is added by auth middleware
        const userId = req.user.userId;
        const { id } = req.params;
        const data = cardSchema.parse(req.body);

        const card = await prisma.card.findUnique({ where: { id } });

        if (!card || card.userId !== userId) {
            return res.status(404).json({ message: "Card not found" });
        }

        const updatedCard = await prisma.card.update({
            where: { id },
            data,
        });

        res.json(updatedCard);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteCard = async (req: Request, res: Response) => {
    try {
        // @ts-expect-error - req.user is added by auth middleware
        const userId = req.user.userId;
        const { id } = req.params;

        const card = await prisma.card.findUnique({ where: { id } });

        if (!card || card.userId !== userId) {
            return res.status(404).json({ message: "Card not found" });
        }

        await prisma.card.delete({ where: { id } });

        res.status(204).send();
    } catch (_error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
