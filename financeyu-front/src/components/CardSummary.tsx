import { motion } from "framer-motion";
import { CreditCard } from "lucide-react";
import { useFinance } from "../hooks/useFinance";

export const CardSummary = ({ currentMonth }: { currentMonth: string }) => {
  const { cards, debtors } = useFinance();

  const cardStats = cards.map((card) => {
    const cardDebts = debtors.flatMap((debtor) =>
      debtor.debts.filter((debt) => debt.cardId === card.id && debt.month === currentMonth)
    );

    const total = cardDebts.reduce((acc, debt) => acc + debt.amount, 0);
    const paid = cardDebts
      .filter((debt) => debt.paid)
      .reduce((acc, debt) => acc + debt.amount, 0);
    const pending = total - paid;
    const progress = total > 0 ? (paid / total) * 100 : 0;

    return {
      ...card,
      total,
      paid,
      pending,
      progress,
    };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cardStats.map((stat, index) => (
        <motion.div
          key={stat.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass p-6 rounded-2xl space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: stat.color }}
              >
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white">{stat.name}</h3>
                <p className="text-xs text-muted-foreground">Vence dia {stat.dueDay}</p>
              </div>
            </div>
            <div className="text-right">
                <span className="text-xs text-muted-foreground">Total</span>
                <p className="font-bold text-white">R$ {stat.total.toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pago</span>
              <span className="text-green-400 font-medium">R$ {stat.paid.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pendente</span>
              <span className="text-yellow-400 font-medium">R$ {stat.pending.toFixed(2)}</span>
            </div>
          </div>

          <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stat.progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute top-0 left-0 h-full rounded-full"
              style={{ backgroundColor: stat.color }}
            />
          </div>
          
          <div className="flex justify-end">
             <span className="text-xs text-muted-foreground">{stat.progress.toFixed(0)}% pago</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
