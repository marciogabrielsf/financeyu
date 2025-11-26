import type { Card, Debtor } from "../types";

export const initialCards: Card[] = [
  { id: "1", name: "Nubank", color: "#8B5CF6", dueDay: 6, lastDigits: "1234", expiryDate: "12/28" },
  { id: "2", name: "Inter", color: "#F59E0B", dueDay: 10, lastDigits: "5678", expiryDate: "05/27" },
  { id: "3", name: "XP", color: "#18181B", dueDay: 15, lastDigits: "9012", expiryDate: "09/29" },
];

export const initialDebtors: Debtor[] = [
  {
    id: "1",
    name: "João Silva",
    debts: [
      {
        id: "d1",
        description: "Almoço",
        amount: 50.0,
        date: "2023-10-15",
        cardId: "1",
        month: "2023-11",
        paid: false,
      },
    ],
  },
  {
    id: "2",
    name: "Maria Oliveira",
    debts: [
      {
        id: "d2",
        description: "Uber",
        amount: 25.5,
        date: "2023-10-20",
        cardId: "1",
        month: "2023-11",
        paid: true,
      },
    ],
  },
];
