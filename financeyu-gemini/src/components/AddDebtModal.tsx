import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useFinance } from "../hooks/useFinance";
import type { Debt } from "../types";

interface AddDebtModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialDebtorId?: string;
    initialDebt?: Debt;
    isEditing?: boolean;
}

const getInitialDebtState = (initialDebt?: Debt, isEditing?: boolean) => {
    if (isEditing && initialDebt) {
        return {
            description: initialDebt.description,
            amount: initialDebt.amount.toFixed(2),
            date: initialDebt.date.split("T")[0],
            cardId: initialDebt.cardId || "",
            installmentsCount: initialDebt.installments
                ? String(initialDebt.installments.total)
                : "1",
        };
    }
    return {
        description: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        cardId: "",
        installmentsCount: "1",
    };
};

// Componente interno do formulário que será remontado quando o modal abrir
const AddDebtForm = ({
    onClose,
    initialDebtorId,
    initialDebt,
    isEditing,
}: Omit<AddDebtModalProps, "isOpen">) => {
    const { debtors, cards, addDebt, updateDebt } = useFinance();

    const [selectedDebtorId, setSelectedDebtorId] = useState(initialDebtorId || "");
    const [newDebt, setNewDebt] = useState(() => getInitialDebtState(initialDebt, isEditing));

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, "");
        const numberValue = Number(value) / 100;
        setNewDebt({ ...newDebt, amount: numberValue.toFixed(2) });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedDebtorId && newDebt.description && newDebt.amount) {
            if (isEditing && initialDebt) {
                updateDebt(selectedDebtorId, initialDebt.id, {
                    description: newDebt.description,
                    amount: parseFloat(newDebt.amount),
                    date: new Date(newDebt.date).toISOString(),
                    cardId: newDebt.cardId,
                    month: newDebt.date.slice(0, 7),
                });
            } else {
                addDebt(selectedDebtorId, {
                    description: newDebt.description,
                    amount: parseFloat(newDebt.amount),
                    date: new Date(newDebt.date).toISOString(),
                    cardId: newDebt.cardId,
                    month: newDebt.date.slice(0, 7),
                    installmentsCount: parseInt(newDebt.installmentsCount),
                });
            }
            onClose();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">
                    {isEditing ? "Editar Dívida" : "Nova Dívida"}
                </h3>
                <button
                    onClick={onClose}
                    className="text-muted-foreground hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                {!initialDebtorId && !isEditing && (
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                            Devedor
                        </label>
                        <select
                            value={selectedDebtorId}
                            onChange={(e) => setSelectedDebtorId(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 [&>option]:bg-zinc-900"
                            required
                        >
                            <option value="">Selecione um devedor</option>
                            {debtors.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Descrição
                    </label>
                    <input
                        type="text"
                        value={newDebt.description}
                        onChange={(e) => setNewDebt({ ...newDebt, description: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Ex: Almoço"
                        required
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                            Valor Total
                        </label>
                        <input
                            type="text"
                            value={newDebt.amount}
                            onChange={handleAmountChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="0.00"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                            Parcelas
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={newDebt.installmentsCount}
                            onChange={(e) =>
                                setNewDebt({ ...newDebt, installmentsCount: e.target.value })
                            }
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            required
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Data
                    </label>
                    <input
                        type="date"
                        value={newDebt.date}
                        onChange={(e) => setNewDebt({ ...newDebt, date: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Cartão (Opcional)
                    </label>
                    <select
                        value={newDebt.cardId}
                        onChange={(e) => setNewDebt({ ...newDebt, cardId: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 [&>option]:bg-zinc-900"
                    >
                        <option value="">Nenhum</option>
                        {cards.map((card) => (
                            <option key={card.id} value={card.id}>
                                {card.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-white hover:bg-white/10 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors"
                    >
                        {isEditing ? "Salvar Alterações" : "Adicionar"}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export const AddDebtModal = ({
    isOpen,
    onClose,
    initialDebtorId,
    initialDebt,
    isEditing = false,
}: AddDebtModalProps) => {
    if (!isOpen) return null;

    // Usar key para forçar remontagem do formulário quando as props mudam
    const formKey = `${initialDebtorId}-${initialDebt?.id}-${isEditing}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <AddDebtForm
                key={formKey}
                onClose={onClose}
                initialDebtorId={initialDebtorId}
                initialDebt={initialDebt}
                isEditing={isEditing}
            />
        </div>
    );
};
