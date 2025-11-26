
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";
import type { Card, Debtor, Debt, DashboardStats } from "../types";

// Cards
export const useCards = () => {
  return useQuery({
    queryKey: ["cards"],
    queryFn: async () => {
      const { data } = await api.get<Card[]>("/cards");
      return data;
    },
  });
};

export const useCreateCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newCard: Omit<Card, "id">) => {
      const { data } = await api.post<Card>("/cards", newCard);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
  });
};

export const useUpdateCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Card> & { id: string }) => {
      const { data } = await api.put<Card>(`/cards/${id}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
  });
};

export const useDeleteCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/cards/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
  });
};

// Debtors
export const useDebtors = () => {
  return useQuery({
    queryKey: ["debtors"],
    queryFn: async () => {
      const { data } = await api.get<Debtor[]>("/debtors");
      return data;
    },
  });
};

export const useCreateDebtor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newDebtor: Omit<Debtor, "id" | "debts">) => {
      const { data } = await api.post<Debtor>("/debtors", newDebtor);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debtors"] });
    },
  });
};

export const useUpdateDebtor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Debtor> & { id: string }) => {
      const { data } = await api.put<Debtor>(`/debtors/${id}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debtors"] });
    },
  });
};

export const useDeleteDebtor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/debtors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debtors"] });
    },
  });
};

// Debts
export const useDebts = () => {
  return useQuery({
    queryKey: ["debts"],
    queryFn: async () => {
      const { data } = await api.get<Debt[]>("/debts");
      return data;
    },
  });
};

export const useCreateDebt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newDebt: Omit<Debt, "id"> & { installmentsCount?: number }) => {
      const { data } = await api.post<Debt>("/debts", newDebt);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["debtors"] }); // Debts are often nested in debtors
    },
  });
};

export const useUpdateDebt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Debt> & { id: string }) => {
      const { data } = await api.put<Debt>(`/debts/${id}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["debtors"] });
    },
  });
};

export const useDeleteDebt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/debts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["debtors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
};

export const useDashboardStats = (month: string) => {
  return useQuery({
    queryKey: ["dashboard-stats", month],
    queryFn: async () => {
      const { data } = await api.get<DashboardStats>(`/dashboard/stats?month=${month}`);
      return data;
    },
  });
};
