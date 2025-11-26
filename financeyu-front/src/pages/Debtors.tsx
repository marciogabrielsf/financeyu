import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useFinance } from "../hooks/useFinance";
import { AddDebtModal } from "../components/AddDebtModal";

export const Debtors = () => {
    const { debtors, addDebtor, removeDebtor, isLoading } = useFinance();
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newDebtorName, setNewDebtorName] = useState("");
    const [expandedDebtor, setExpandedDebtor] = useState<string | null>(null);

    // Add Debt State
    const [isAddDebtModalOpen, setIsAddDebtModalOpen] = useState(false);
    const [selectedDebtorId, setSelectedDebtorId] = useState<string | null>(null);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] text-white">
                Carregando dados...
            </div>
        );
    }

    const filteredDebtors = debtors.filter((debtor) =>
        debtor.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddDebtor = (e: React.FormEvent) => {
        e.preventDefault();
        if (newDebtorName.trim()) {
            addDebtor(newDebtorName);
            setNewDebtorName("");
            setIsModalOpen(false);
        }
    };

    const openAddDebtModal = (debtorId: string) => {
        setSelectedDebtorId(debtorId);
        setIsAddDebtModalOpen(true);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Devedores</h2>
                    <p className="text-muted-foreground">Gerencie as pessoas que te devem.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Novo Devedor
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                    type="text"
                    placeholder="Buscar devedor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
            </div>

            {/* Debtors List */}
            <div className="grid gap-4">
                {filteredDebtors.map((debtor) => (
                    <motion.div
                        key={debtor.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass rounded-xl overflow-hidden"
                    >
                        <div
                            className="p-4 flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:bg-white/5 transition-colors gap-4"
                            onClick={() =>
                                setExpandedDebtor(expandedDebtor === debtor.id ? null : debtor.id)
                            }
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                                    {debtor.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-white truncate">{debtor.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {debtor.debts.filter((d) => !d.paid).length} dívidas
                                        pendentes
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between md:justify-end gap-4 pl-14 md:pl-0">
                                <p className="font-bold text-white">
                                    R${" "}
                                    {debtor.debts
                                        .filter((d) => !d.paid)
                                        .reduce((acc, d) => acc + d.amount, 0)
                                        .toFixed(2)}
                                </p>
                                {expandedDebtor === debtor.id ? (
                                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                )}
                            </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedDebtor === debtor.id && (
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: "auto" }}
                                className="bg-black/20 border-t border-white/5"
                            >
                                <div className="p-4 space-y-2">
                                    {debtor.debts.length > 0 ? (
                                        debtor.debts.map((debt) => (
                                            <div
                                                key={debt.id}
                                                className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                                            >
                                                <div>
                                                    <p className="text-white font-medium">
                                                        {debt.description}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {debt.date}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className={`text-xs px-2 py-1 rounded-full ${
                                                            debt.paid
                                                                ? "bg-green-500/20 text-green-400"
                                                                : "bg-yellow-500/20 text-yellow-400"
                                                        }`}
                                                    >
                                                        {debt.paid ? "Pago" : "Pendente"}
                                                    </span>
                                                    <p className="text-white font-bold">
                                                        R$ {debt.amount.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-muted-foreground py-4">
                                            Nenhuma dívida registrada.
                                        </p>
                                    )}
                                    <div className="flex justify-end pt-4 gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openAddDebtModal(debtor.id);
                                            }}
                                            className="text-primary hover:text-primary/80 text-sm flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" /> Nova Dívida
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeDebtor(debtor.id);
                                            }}
                                            className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" /> Excluir Devedor
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Add Debtor Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                    >
                        <h3 className="text-xl font-bold text-white mb-4">Novo Devedor</h3>
                        <form onSubmit={handleAddDebtor} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">
                                    Nome
                                </label>
                                <input
                                    type="text"
                                    value={newDebtorName}
                                    onChange={(e) => setNewDebtorName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="Ex: João Silva"
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-white hover:bg-white/10 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors"
                                >
                                    Adicionar
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Add Debt Modal */}
            <AddDebtModal
                isOpen={isAddDebtModalOpen}
                onClose={() => setIsAddDebtModalOpen(false)}
                initialDebtorId={selectedDebtorId || undefined}
            />
        </div>
    );
};
