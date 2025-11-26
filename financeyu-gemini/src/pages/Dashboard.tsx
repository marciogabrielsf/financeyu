import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    DollarSign,
    CreditCard,
    Users,
    TrendingUp,
    Calendar,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useFinance } from "../hooks/useFinance";
import { useDashboardStats } from "../hooks/queries";
import { format, subMonths, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CardSummary } from "../components/CardSummary";
import type { Debtor, Debt } from "../types";

const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    delay,
    trend,
}: {
    title: string;
    value: string;
    icon: React.ElementType;
    color: string;
    delay: number;
    trend?: string;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="glass p-6 rounded-2xl relative overflow-hidden group hover:bg-white/5 transition-colors"
    >
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-20 text-white`}>
                <Icon className="w-6 h-6" />
            </div>
            {trend && (
                <span className="text-emerald-400 text-sm font-medium bg-emerald-400/10 px-2 py-1 rounded-lg">
                    {trend}
                </span>
            )}
        </div>
        <div>
            <h3 className="text-muted-foreground font-medium mb-1 text-sm">{title}</h3>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </motion.div>
);

export const Dashboard = () => {
    const { debtors, isLoading: isFinanceLoading } = useFinance();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const currentMonthStr = format(currentMonth, "yyyy-MM");

    const { data: stats, isLoading: isStatsLoading } = useDashboardStats(currentMonthStr);

    if (isFinanceLoading || isStatsLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] text-white">
                Carregando dados...
            </div>
        );
    }

    const handlePrevMonth = () => setCurrentMonth((prev) => subMonths(prev, 1));
    const handleNextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1));

    // Filter debts by current month for the list
    const monthlyDebts = debtors.flatMap((d: Debtor) =>
        d.debts
            .filter((debt: Debt) => debt.month === currentMonthStr)
            .map((debt: Debt) => ({ ...debt, debtorName: d.name }))
    );

    const totalReceivable = stats?.totalReceivable || 0;
    const totalPaid = stats?.totalPaid || 0;
    const progress = totalReceivable > 0 ? (totalPaid / totalReceivable) * 100 : 0;

    const totalDebtors = stats?.activeDebtors || 0;
    const activeCards = stats?.activeCards || 0;
    const monthlyGrowth = stats?.monthlyGrowth || 0;
    const monthlyGrowthStr = `${monthlyGrowth > 0 ? "+" : ""}${monthlyGrowth.toFixed(1)}%`;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
                    <p className="text-muted-foreground">
                        Visão geral das suas finanças e recebimentos.
                    </p>
                </div>

                {/* Month Selector */}
                <div className="flex items-center justify-center bg-white/5 rounded-xl p-1 border border-white/10">
                    <button
                        onClick={handlePrevMonth}
                        className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="px-4 py-1 flex items-center gap-2 text-white font-medium min-w-[140px] justify-center">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                    </div>
                    <button
                        onClick={handleNextMonth}
                        className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="glass p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-end">
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1">
                            Progresso de Recebimento
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Total recebido em relação ao total previsto para o mês
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-primary">
                            {progress.toFixed(0)}%
                        </span>
                    </div>
                </div>
                <div className="relative h-4 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="absolute top-0 left-0 h-full bg-linear-to-r from-primary/50 to-primary rounded-full"
                    />
                </div>
            </div>

            {/* Card Summaries */}
            <div>
                <h3 className="text-xl font-bold text-white mb-4">Resumo por Cartão</h3>
                <CardSummary currentMonth={currentMonthStr} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total a Receber (Mês)"
                    value={`R$ ${totalReceivable.toFixed(2)}`}
                    icon={DollarSign}
                    color="bg-emerald-500"
                    delay={0.1}
                    trend={monthlyGrowthStr}
                />
                <StatCard
                    title="Devedores Ativos (Mês)"
                    value={totalDebtors.toString()}
                    icon={Users}
                    color="bg-blue-500"
                    delay={0.2}
                />
                <StatCard
                    title="Cartões Ativos"
                    value={activeCards.toString()}
                    icon={CreditCard}
                    color="bg-purple-500"
                    delay={0.3}
                />
                <StatCard
                    title="Crescimento Mensal"
                    value={monthlyGrowthStr}
                    icon={TrendingUp}
                    color="bg-rose-500"
                    delay={0.4}
                    trend={monthlyGrowthStr}
                />
            </div>

            {/* Recent Activity Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="glass rounded-2xl p-6"
            >
                <h3 className="text-xl font-bold text-white mb-6">Próximos Vencimentos</h3>
                <div className="space-y-4">
                    {monthlyDebts
                        .filter((debt) => !debt.paid)
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .slice(0, 5)
                        .map((debt) => (
                            <div
                                key={debt.id}
                                className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                                        {debt.debtorName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{debt.description}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {debt.debtorName}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-white">
                                        R$ {debt.amount.toFixed(2)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {format(new Date(debt.date), "dd 'de' MMMM", {
                                            locale: ptBR,
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    {monthlyDebts.filter((debt) => !debt.paid).length === 0 && (
                        <p className="text-muted-foreground text-center py-8">
                            Nenhum pagamento pendente para este mês.
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
