import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Calendar, CreditCard, User, Plus, Trash2, Edit2, Check } from "lucide-react";
import { useFinance } from "../hooks/useFinance";
import { format } from "date-fns";
import { AddDebtModal } from "../components/AddDebtModal";
import type { Debt } from "../types";

export const Debts = () => {
    const { debtors, cards, deleteDebt, toggleDebtPaid, isLoading } = useFinance();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCard, setSelectedCard] = useState<string>("");
    const [selectedDebtor, setSelectedDebtor] = useState<string>("");
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [isAddDebtModalOpen, setIsAddDebtModalOpen] = useState(false);
    const [editingDebt, setEditingDebt] = useState<{ debt: Debt; debtorId: string } | null>(null);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] text-white">
                Carregando dados...
            </div>
        );
    }

    const allDebts = debtors.flatMap((debtor) =>
        debtor.debts.map((debt) => ({
            ...debt,
            debtorName: debtor.name,
            debtorId: debtor.id,
        }))
    );

    const filteredDebts = allDebts.filter((debt) => {
        const matchesSearch = debt.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCard = selectedCard ? debt.cardId === selectedCard : true;
        const matchesDebtor = selectedDebtor ? debt.debtorId === selectedDebtor : true;
        const matchesDate =
            (!dateRange.start || debt.date >= dateRange.start) &&
            (!dateRange.end || debt.date <= dateRange.end);

        return matchesSearch && matchesCard && matchesDebtor && matchesDate;
    });

    const totalFiltered = filteredDebts.reduce((acc, debt) => acc + debt.amount, 0);

    const handleEdit = (debt: Debt, debtorId: string) => {
        setEditingDebt({ debt, debtorId });
        setIsAddDebtModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddDebtModalOpen(false);
        setEditingDebt(null);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Dívidas</h2>
                    <p className="text-muted-foreground">
                        Gerencie todas as dívidas, filtre e acompanhe pagamentos.
                    </p>
                </div>
                <button
                    onClick={() => setIsAddDebtModalOpen(true)}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Nova Dívida
                </button>
            </div>

            {/* Filters */}
            <div className="glass p-6 rounded-2xl space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar dívida..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        <select
                            value={selectedDebtor}
                            onChange={(e) => setSelectedDebtor(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 [&>option]:bg-zinc-900"
                        >
                            <option value="">Todos Devedores</option>
                            {debtors.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={selectedCard}
                            onChange={(e) => setSelectedCard(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 [&>option]:bg-zinc-900"
                        >
                            <option value="">Todos Cartões</option>
                            {cards.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground pt-2 border-t border-white/10">
                    <span>{filteredDebts.length} dívidas encontradas</span>
                    <span className="font-bold text-white">
                        Total: R$ {totalFiltered.toFixed(2)}
                    </span>
                </div>
            </div>

            {/* Debts List */}
            <div className="space-y-4">
                {filteredDebts.map((debt) => {
                    const card = cards.find((c) => c.id === debt.cardId);
                    return (
                        <motion.div
                            key={debt.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/5 transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 group-hover:bg-primary/20 group-hover:text-primary transition-colors shrink-0">
                                    <AnimatedCheckbox
                                        checked={debt.paid}
                                        onChange={() => toggleDebtPaid(debt.debtorId, debt.id)}
                                    />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-white truncate">
                                        {debt.description}
                                        {debt.installments && (
                                            <span className="text-xs text-muted-foreground ml-2 font-normal">
                                                ({debt.installments.current}/
                                                {debt.installments.total})
                                            </span>
                                        )}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <User className="w-3 h-3" /> {debt.debtorName}
                                        </span>
                                        {card && (
                                            <span className="flex items-center gap-1">
                                                <CreditCard className="w-3 h-3" /> {card.name}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />{" "}
                                            {format(new Date(debt.date), "dd/MM/yyyy")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between md:justify-end gap-4 pl-14 md:pl-0">
                                <div className="text-right">
                                    <p
                                        className={`font-bold text-lg ${
                                            debt.paid ? "text-green-400" : "text-white"
                                        }`}
                                    >
                                        R$ {debt.amount.toFixed(2)}
                                    </p>
                                    <span
                                        className={`text-xs px-2 py-1 rounded-full ${
                                            debt.paid
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-yellow-500/20 text-yellow-400"
                                        }`}
                                    >
                                        {debt.paid ? "Pago" : "Pendente"}
                                    </span>
                                </div>
                                <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(debt, debt.debtorId)}
                                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (
                                                confirm(
                                                    "Tem certeza que deseja excluir esta dívida?"
                                                )
                                            ) {
                                                deleteDebt(debt.debtorId, debt.id);
                                            }
                                        }}
                                        className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-200 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
                {filteredDebts.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        Nenhuma dívida encontrada com os filtros selecionados.
                    </div>
                )}
            </div>

            <AddDebtModal
                isOpen={isAddDebtModalOpen}
                onClose={handleCloseModal}
                initialDebtorId={editingDebt?.debtorId}
                initialDebt={editingDebt?.debt}
                isEditing={!!editingDebt}
            />
        </div>
    );
};

const AnimatedCheckbox = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => {
    return (
        <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={(e) => {
                e.stopPropagation();
                onChange();
            }}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                checked ? "bg-green-500 border-green-500" : "border-white/30 hover:border-primary"
            }`}
        >
            <motion.div
                initial={false}
                animate={{ scale: checked ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
            </motion.div>
        </motion.button>
    );
};
