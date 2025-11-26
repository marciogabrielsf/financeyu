import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Plus, Trash2, Edit2, Wifi } from "lucide-react";
import { useFinance } from "../hooks/useFinance";
import type { Card } from "../types";

export const Cards = () => {
    const { cards, addCard, updateCard, removeCard, debtors, toggleDebtPaid, isLoading } =
        useFinance();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
    const [editingCard, setEditingCard] = useState<Card | null>(null);
    const [newCard, setNewCard] = useState({
        name: "",
        color: "#8B5CF6", // Default purple
        dueDay: "",
        lastDigits: "",
        expiryDate: "",
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] text-white">
                Carregando dados...
            </div>
        );
    }

    const colors = [
        "#8B5CF6", // Purple
        "#EC4899", // Pink
        "#3B82F6", // Blue
        "#10B981", // Emerald
        "#F59E0B", // Amber
        "#EF4444", // Red
        "#6366F1", // Indigo
        "#14B8A6", // Teal
        "#18181B", // Zinc/Black
    ];

    const handleAddCard = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCard.name && newCard.dueDay) {
            addCard({
                name: newCard.name,
                color: newCard.color,
                dueDay: parseInt(newCard.dueDay),
                lastDigits: newCard.lastDigits,
                expiryDate: newCard.expiryDate,
            });
            setIsModalOpen(false);
            setNewCard({
                name: "",
                color: "#8B5CF6",
                dueDay: "",
                lastDigits: "",
                expiryDate: "",
            });
        }
    };

    const handleUpdateCard = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCard) {
            updateCard(editingCard.id, editingCard);
            setEditingCard(null);
        }
    };

    // Input masks
    const handleExpiryChange = (value: string, isEditing: boolean) => {
        let formatted = value.replace(/\D/g, "");
        if (formatted.length >= 2) {
            formatted = `${formatted.slice(0, 2)}/${formatted.slice(2, 4)}`;
        }
        if (isEditing && editingCard) {
            setEditingCard({ ...editingCard, expiryDate: formatted });
        } else {
            setNewCard({ ...newCard, expiryDate: formatted });
        }
    };

    const handleDigitsChange = (value: string, isEditing: boolean) => {
        const formatted = value.replace(/\D/g, "").slice(0, 4);
        if (isEditing && editingCard) {
            setEditingCard({ ...editingCard, lastDigits: formatted });
        } else {
            setNewCard({ ...newCard, lastDigits: formatted });
        }
    };

    const getCardColor = (color: string) => {
        if (color.startsWith("#")) return color;

        // Legacy mapping
        const mapping: Record<string, string> = {
            "bg-purple-600": "#8B5CF6",
            "bg-orange-500": "#F59E0B",
            "bg-black": "#18181B",
            "bg-blue-600": "#3B82F6",
            "bg-green-600": "#10B981",
            "bg-red-600": "#EF4444",
        };
        return mapping[color] || color;
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Cartões</h2>
                    <p className="text-muted-foreground">Gerencie seus cartões de crédito.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Novo Cartão
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {cards.map((card) => {
                        const cardDebts = debtors
                            .flatMap((d) =>
                                d.debts.map((debt) => ({
                                    ...debt,
                                    debtorName: d.name,
                                    debtorId: d.id,
                                }))
                            )
                            .filter((debt) => debt.cardId === card.id && !debt.paid);
                        const totalReceivable = cardDebts.reduce(
                            (acc, debt) => acc + debt.amount,
                            0
                        );
                        const isExpanded = expandedCardId === card.id;
                        const cardColor = getCardColor(card.color);

                        return (
                            <motion.div
                                key={card.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`rounded-2xl p-6 space-y-6 relative overflow-hidden group shadow-xl ${
                                    isExpanded ? "row-span-2" : ""
                                }`}
                                style={{
                                    backgroundColor: cardColor,
                                    boxShadow: `0 8px 32px 0 ${cardColor}40`,
                                }}
                                onClick={() => setExpandedCardId(isExpanded ? null : card.id)}
                            >
                                {/* Glass overlay for texture */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                                <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-6 rounded bg-yellow-400/80 flex items-center justify-center overflow-hidden relative">
                                                <div className="absolute inset-0 border border-yellow-600/50 rounded" />
                                                <div className="w-full h-[1px] bg-yellow-600/50" />
                                                <div className="h-full w-[1px] bg-yellow-600/50" />
                                            </div>
                                            <Wifi className="w-5 h-5 text-white/70 rotate-90" />
                                        </div>

                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingCard({
                                                        ...card,
                                                        dueDay: card.dueDay,
                                                        lastDigits: card.lastDigits || "",
                                                        expiryDate: card.expiryDate || "",
                                                    });
                                                }}
                                                className="p-2 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (
                                                        confirm(
                                                            "Tem certeza que deseja excluir este cartão?"
                                                        )
                                                    ) {
                                                        removeCard(card.id);
                                                    }
                                                }}
                                                className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-white transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-xl font-bold text-white tracking-wide">
                                            {card.name}
                                        </h3>
                                        <div className="flex justify-between items-end">
                                            <div className="font-mono text-white/90 text-lg tracking-widest">
                                                •••• •••• •••• {card.lastDigits || "0000"}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-end text-sm text-white/80">
                                            <div>
                                                <span className="text-[10px] uppercase tracking-wider block opacity-70">
                                                    Vencimento
                                                </span>
                                                <span className="font-medium">
                                                    Dia {card.dueDay}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] uppercase tracking-wider block opacity-70">
                                                    Validade
                                                </span>
                                                <span className="font-medium">
                                                    {card.expiryDate || "MM/YY"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-white/20">
                                        <p className="text-sm text-white/70 mb-1">
                                            Total a Receber
                                        </p>
                                        <p className="text-2xl font-bold text-white">
                                            R$ {totalReceivable.toFixed(2)}
                                        </p>
                                    </div>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="mt-6 pt-4 border-t border-white/20 z-10"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <h4 className="text-white font-bold mb-3">
                                                Itens a Receber
                                            </h4>
                                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                                {cardDebts.length > 0 ? (
                                                    cardDebts.map((debt) => (
                                                        <div
                                                            key={debt.id}
                                                            className="flex items-center justify-between bg-black/20 p-2 rounded-lg"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={debt.paid}
                                                                    onChange={() =>
                                                                        toggleDebtPaid(
                                                                            debt.debtorId,
                                                                            debt.id
                                                                        )
                                                                    }
                                                                    className="rounded border-white/30 bg-white/10 text-primary focus:ring-primary"
                                                                />
                                                                <div>
                                                                    <p className="text-white text-sm font-medium">
                                                                        {debt.description}
                                                                    </p>
                                                                    <p className="text-white/60 text-xs">
                                                                        {debt.debtorName} -{" "}
                                                                        {debt.date}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <p
                                                                className={`text-sm font-bold ${
                                                                    debt.paid
                                                                        ? "text-green-400"
                                                                        : "text-white"
                                                                }`}
                                                            >
                                                                R$ {debt.amount.toFixed(2)}
                                                            </p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-white/60 text-sm text-center">
                                                        Nenhum item vinculado.
                                                    </p>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Add Card Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card border border-white/10 rounded-2xl p-6 w-full max-w-4xl shadow-2xl flex flex-col md:flex-row gap-8"
                    >
                        <div className="flex-1 space-y-6">
                            <h3 className="text-xl font-bold text-white">Adicionar Novo Cartão</h3>
                            <form onSubmit={handleAddCard} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                                        Nome do Cartão
                                    </label>
                                    <input
                                        type="text"
                                        value={newCard.name}
                                        onChange={(e) =>
                                            setNewCard({ ...newCard, name: e.target.value })
                                        }
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="Ex: Nubank"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-3">
                                        Cor do Cartão
                                    </label>
                                    <div className="flex gap-3 flex-wrap">
                                        {colors.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setNewCard({ ...newCard, color })}
                                                className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                                                    newCard.color === color
                                                        ? "ring-2 ring-white ring-offset-2 ring-offset-black"
                                                        : ""
                                                }`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                                            Dia Vencimento
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="31"
                                            value={newCard.dueDay}
                                            onChange={(e) =>
                                                setNewCard({ ...newCard, dueDay: e.target.value })
                                            }
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            placeholder="Ex: 10"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                                            Últimos 4 dígitos
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={4}
                                            value={newCard.lastDigits}
                                            onChange={(e) =>
                                                handleDigitsChange(e.target.value, false)
                                            }
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            placeholder="Ex: 1234"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                                        Validade (MM/AA)
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={5}
                                        value={newCard.expiryDate}
                                        onChange={(e) => handleExpiryChange(e.target.value, false)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="Ex: 12/28"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
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
                        </div>

                        {/* Preview Section */}
                        <div className="w-full md:w-80 flex flex-col items-center justify-center bg-white/5 rounded-xl p-6 border border-white/10">
                            <h4 className="text-sm font-medium text-muted-foreground mb-6">
                                Pré-visualização
                            </h4>
                            <div
                                className="w-full aspect-[1.586] rounded-2xl p-6 relative overflow-hidden shadow-2xl transition-all duration-300"
                                style={{
                                    background: `linear-gradient(135deg, ${newCard.color}, ${newCard.color}DD)`,
                                    boxShadow: `0 8px 32px 0 ${newCard.color}40`,
                                }}
                            >
                                <div className="absolute inset-0 bg-white/5 pointer-events-none" />
                                <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />

                                <div className="relative z-10 h-full flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-7 rounded bg-yellow-400/80 flex items-center justify-center overflow-hidden relative">
                                                <div className="absolute inset-0 border border-yellow-600/50 rounded" />
                                                <div className="w-full h-[1px] bg-yellow-600/50" />
                                                <div className="h-full w-[1px] bg-yellow-600/50" />
                                            </div>
                                            <Wifi className="w-5 h-5 text-white/70 rotate-90" />
                                        </div>
                                        <CreditCard className="w-6 h-6 text-white/80" />
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-white font-bold tracking-wide text-lg truncate">
                                            {newCard.name || "Nome do Cartão"}
                                        </p>
                                        <div className="flex justify-between items-end">
                                            <p className="font-mono text-white/90 text-lg tracking-widest">
                                                •••• •••• •••• {newCard.lastDigits || "0000"}
                                            </p>
                                        </div>
                                        <div className="flex justify-between items-end text-sm text-white/80">
                                            <div>
                                                <span className="text-[9px] uppercase tracking-wider block opacity-70">
                                                    Vencimento
                                                </span>
                                                <span className="font-medium">
                                                    Dia {newCard.dueDay || "00"}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-[9px] uppercase tracking-wider block opacity-70">
                                                    Validade
                                                </span>
                                                <span className="font-medium">
                                                    {newCard.expiryDate || "MM/YY"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Edit Card Modal */}
            {editingCard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                    >
                        <h3 className="text-xl font-bold text-white mb-4">Editar Cartão</h3>
                        <form onSubmit={handleUpdateCard} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">
                                    Nome do Cartão
                                </label>
                                <input
                                    type="text"
                                    value={editingCard.name}
                                    onChange={(e) =>
                                        setEditingCard({ ...editingCard, name: e.target.value })
                                    }
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-3">
                                    Cor do Cartão
                                </label>
                                <div className="flex gap-3 flex-wrap">
                                    {colors.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() =>
                                                setEditingCard({ ...editingCard, color })
                                            }
                                            className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                                                editingCard.color === color
                                                    ? "ring-2 ring-white ring-offset-2 ring-offset-black"
                                                    : ""
                                            }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                                        Dia Vencimento
                                    </label>
                                    <input
                                        type="number"
                                        value={editingCard.dueDay}
                                        onChange={(e) =>
                                            setEditingCard({
                                                ...editingCard,
                                                dueDay: parseInt(e.target.value),
                                            })
                                        }
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                                        Últimos 4 dígitos
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={4}
                                        value={editingCard.lastDigits}
                                        onChange={(e) => handleDigitsChange(e.target.value, true)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">
                                    Validade (MM/AA)
                                </label>
                                <input
                                    type="text"
                                    maxLength={5}
                                    value={editingCard.expiryDate}
                                    onChange={(e) => handleExpiryChange(e.target.value, true)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingCard(null)}
                                    className="px-4 py-2 rounded-xl text-white hover:bg-white/10 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors"
                                >
                                    Salvar Alterações
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};
