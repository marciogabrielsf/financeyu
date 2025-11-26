import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { subMonths, format } from "date-fns";

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        // @ts-expect-error - req.user is added by auth middleware
        const userId = req.user.userId;
        const monthQuery = req.query.month as string;

        // Validate or default month
        let currentMonthDate = new Date();
        if (monthQuery && /^\d{4}-\d{2}$/.test(monthQuery)) {
            currentMonthDate = new Date(`${monthQuery}-02`); // Avoid timezone issues by picking 2nd day
        }

        const currentMonthStr = format(currentMonthDate, "yyyy-MM");
        const prevMonthDate = subMonths(currentMonthDate, 1);
        const prevMonthStr = format(prevMonthDate, "yyyy-MM");

        // Fetch debts for current and previous month
        const debts = await prisma.debt.findMany({
            where: {
                userId,
                month: { in: [currentMonthStr, prevMonthStr] },
            },
            select: {
                amount: true,
                month: true,
                debtorId: true,
                cardId: true,
                paid: true,
            },
        });

        // Calculate Current Month Stats
        const currentMonthDebts = debts.filter((d) => d.month === currentMonthStr);
        const totalReceivable = currentMonthDebts.reduce((acc, d) => acc + d.amount, 0);
        const totalPaid = currentMonthDebts
            .filter((d) => d.paid)
            .reduce((acc, d) => acc + d.amount, 0);

        const activeDebtors = new Set(currentMonthDebts.map((d) => d.debtorId).filter(Boolean))
            .size;
        const activeCards = new Set(currentMonthDebts.map((d) => d.cardId).filter(Boolean)).size;

        // Calculate Previous Month Stats for Growth
        const prevMonthDebts = debts.filter((d) => d.month === prevMonthStr);
        const prevTotalReceivable = prevMonthDebts.reduce((acc, d) => acc + d.amount, 0);

        // Calculate Growth
        let monthlyGrowth = 0;
        if (prevTotalReceivable > 0) {
            monthlyGrowth = ((totalReceivable - prevTotalReceivable) / prevTotalReceivable) * 100;
        } else if (totalReceivable > 0) {
            monthlyGrowth = 100; // 100% growth if previous was 0 and current is > 0
        }

        res.json({
            totalReceivable,
            totalPaid,
            activeDebtors,
            activeCards,
            monthlyGrowth,
            prevTotalReceivable,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
