import { createContext } from "react";
import type { Debtor, Card, Debt } from "../types";
import { 
  useCards, useCreateCard, useUpdateCard, useDeleteCard,
  useDebtors, useCreateDebtor, useDeleteDebtor,
  useCreateDebt, useUpdateDebt, useDeleteDebt
} from "../hooks/queries";

interface FinanceContextType {
  debtors: Debtor[];
  cards: Card[];
  isLoading: boolean;
  addDebtor: (name: string) => void;
  addDebt: (debtorId: string, debt: Omit<Debt, "id" | "paid"> & { installmentsCount?: number }) => void;
  updateDebt: (debtorId: string, debtId: string, updates: Partial<Debt>) => void;
  addCard: (card: Omit<Card, "id">) => void;
  updateCard: (id: string, card: Partial<Card>) => void;
  removeCard: (id: string) => void;
  removeDebtor: (id: string) => void;
  toggleDebtPaid: (debtorId: string, debtId: string) => void;
  deleteDebt: (debtorId: string, debtId: string) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Queries
  const { data: cards = [], isLoading: isLoadingCards } = useCards();
  const { data: debtors = [], isLoading: isLoadingDebtors } = useDebtors();

  // Mutations
  const createCardMutation = useCreateCard();
  const updateCardMutation = useUpdateCard();
  const deleteCardMutation = useDeleteCard();

  const createDebtorMutation = useCreateDebtor();
  const deleteDebtorMutation = useDeleteDebtor();

  const createDebtMutation = useCreateDebt();
  const updateDebtMutation = useUpdateDebt();
  const deleteDebtMutation = useDeleteDebt();

  const isLoading = isLoadingCards || isLoadingDebtors;

  const addDebtor = (name: string) => {
    createDebtorMutation.mutate({ name });
  };

  const addDebt = (debtorId: string, debt: Omit<Debt, "id" | "paid"> & { installmentsCount?: number }) => {
    createDebtMutation.mutate({ ...debt, debtorId, paid: false });
  };

  const updateDebt = (_debtorId: string, debtId: string, updates: Partial<Debt>) => {
    updateDebtMutation.mutate({ id: debtId, ...updates });
  };

  const toggleDebtPaid = (debtorId: string, debtId: string) => {
    const debtor = debtors.find(d => d.id === debtorId);
    const debt = debtor?.debts.find(d => d.id === debtId);
    if (debt) {
      updateDebtMutation.mutate({ id: debtId, paid: !debt.paid });
    }
  };

  const addCard = (card: Omit<Card, "id">) => {
    createCardMutation.mutate(card);
  };

  const updateCard = (id: string, card: Partial<Card>) => {
    updateCardMutation.mutate({ id, ...card });
  };

  const removeCard = (id: string) => {
    deleteCardMutation.mutate(id);
  };

  const removeDebtor = (id: string) => {
    deleteDebtorMutation.mutate(id);
  };

  const deleteDebt = (_debtorId: string, debtId: string) => {
    deleteDebtMutation.mutate(debtId);
  };

  return (
    <FinanceContext.Provider
      value={{
        debtors,
        cards,
        isLoading,
        addDebtor,
        addDebt,
        updateDebt,
        addCard,
        updateCard,
        removeCard,
        removeDebtor,
        toggleDebtPaid,
        deleteDebt,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export { FinanceContext };
