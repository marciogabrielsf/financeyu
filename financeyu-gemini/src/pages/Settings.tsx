import { useTheme } from "../context/ThemeContext";
import { useFinance } from "../hooks/useFinance";
import { Moon, Sun, Trash2, Bell, Shield, Smartphone } from "lucide-react";
import { motion } from "framer-motion";

export const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { debtors, cards } = useFinance();

  const handleClearData = () => {
    if (confirm("Tem certeza? Isso apagará TODOS os seus dados (débitos, cartões, devedores) e não pode ser desfeito.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const totalDebts = debtors.flatMap(d => d.debts).length;
  const totalCards = cards.length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Configurações</h2>
        <p className="text-muted-foreground">
          Personalize sua experiência e gerencie seus dados.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Appearance Section */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Sun className="w-5 h-5" /> Aparência
          </h3>
          <motion.div 
            className="bg-card border border-border rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Tema do Aplicativo</p>
                <p className="text-sm text-muted-foreground">Alterne entre modo claro e escuro.</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  theme === "dark" ? "bg-primary" : "bg-input"
                }`}
              >
                <span
                  className={`${
                    theme === "dark" ? "translate-x-7" : "translate-x-1"
                  } inline-block h-6 w-6 transform rounded-full bg-white transition-transform flex items-center justify-center`}
                >
                  {theme === "dark" ? (
                    <Moon className="w-3 h-3 text-black" />
                  ) : (
                    <Sun className="w-3 h-3 text-yellow-500" />
                  )}
                </span>
              </button>
            </div>
          </motion.div>
        </section>

        {/* Notifications Section (Mock) */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Bell className="w-5 h-5" /> Notificações
          </h3>
          <motion.div 
            className="bg-card border border-border rounded-2xl p-6 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Lembretes de Pagamento</p>
                <p className="text-sm text-muted-foreground">Receba alertas quando uma fatura estiver próxima do vencimento.</p>
              </div>
              <div className="h-6 w-11 bg-primary/20 rounded-full relative cursor-not-allowed">
                 <div className="absolute left-1 top-1 h-4 w-4 bg-primary rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Resumo Semanal</p>
                <p className="text-sm text-muted-foreground">Receba um resumo dos seus gastos toda semana.</p>
              </div>
              <div className="h-6 w-11 bg-input rounded-full relative cursor-not-allowed">
                 <div className="absolute left-1 top-1 h-4 w-4 bg-muted-foreground rounded-full" />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Data Management Section */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5" /> Dados e Privacidade
          </h3>
          <motion.div 
            className="bg-card border border-border rounded-2xl p-6 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                        <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-medium text-foreground">Dados Locais</p>
                        <p className="text-sm text-muted-foreground">
                            Seus dados estão salvos apenas neste dispositivo.
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-between md:justify-end gap-8 md:gap-8 pl-16 md:pl-0">
                    <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">{totalDebts}</p>
                        <p className="text-xs text-muted-foreground">Débitos</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">{totalCards}</p>
                        <p className="text-xs text-muted-foreground">Cartões</p>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-border">
              <button
                onClick={handleClearData}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors px-4 py-2 rounded-lg hover:bg-red-500/10 w-full md:w-auto justify-center"
              >
                <Trash2 className="w-4 h-4" />
                Apagar Todos os Dados
              </button>
              <p className="text-xs text-muted-foreground mt-2 ml-1">
                Atenção: Esta ação é irreversível e removerá todos os seus cadastros.
              </p>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
};
