export interface Card {
  id: string;
  name: string;
  color: string;
  dueDay: number; // Day of the month (e.g., 6)
  lastDigits: string;
  expiryDate: string; // MM/YY
}

export interface Debt {
  id: string;
  description: string;
  amount: number;
  date: string; // ISO Date string
  cardId: string;
  debtorId?: string;
  month: string; // e.g., "2023-01" for grouping
  paid: boolean;
  installments?: {
    current: number;
    total: number;
  };
}

export interface Debtor {
  id: string;
  name: string;
  avatar?: string;
  debts: Debt[];
}

export interface DashboardSummary {
  totalReceivable: number;
  totalByMonth: Record<string, number>;
  upcomingPayments: Debt[];
}

export interface DashboardStats {
  totalReceivable: number;
  totalPaid: number;
  activeDebtors: number;
  activeCards: number;
  monthlyGrowth: number;
  prevTotalReceivable: number;
}
