import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Settings,
    DollarSign,
    FileText,
    Menu,
    X,
} from "lucide-react";
import { cn } from "../lib/utils";
import { AIAssistant } from "../components/AIAssistant";
import { AnimatePresence, motion } from "framer-motion";

const SidebarItem = ({
    icon: Icon,
    label,
    to,
    active,
    onClick,
}: {
    icon: React.ElementType;
    label: string;
    to: string;
    active: boolean;
    onClick?: () => void;
}) => (
    <Link
        to={to}
        onClick={onClick}
        className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
            active
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
        )}
    >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
        {active && <div className="absolute left-0 w-1 h-8 bg-primary rounded-r-full" />}
    </Link>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { icon: LayoutDashboard, label: "Dashboard", to: "/" },
        { icon: Users, label: "Devedores", to: "/debtors" },
        { icon: CreditCard, label: "Cartões", to: "/cards" },
        { icon: DollarSign, label: "Dívidas", to: "/debts" },
        { icon: FileText, label: "Relatórios", to: "/reports" },
        { icon: Settings, label: "Configurações", to: "/settings" },
    ];

    return (
        <div className="h-screen bg-background text-foreground flex overflow-hidden bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-indigo-900/20 via-background to-background">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-black/20 backdrop-blur-xl border-b border-white/10 z-50 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                        F
                    </div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-purple-400">
                        FinanceYu
                    </h1>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 text-muted-foreground hover:text-foreground"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-64 bg-black/90 backdrop-blur-xl border-r border-white/10 z-50 md:hidden flex flex-col p-6"
                        >
                            <div className="flex items-center justify-between mb-10 px-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                                        F
                                    </div>
                                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-purple-400">
                                        FinanceYu
                                    </h1>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <nav className="space-y-2 flex-1">
                                {navItems.map((item) => (
                                    <SidebarItem
                                        key={item.to}
                                        icon={item.icon}
                                        label={item.label}
                                        to={item.to}
                                        active={location.pathname === item.to}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    />
                                ))}
                            </nav>

                            <div className="mt-auto pt-6 border-t border-white/10">
                                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-pink-500 to-rose-500" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">Usuário</p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            admin@financeyu.com
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <aside className="w-64 hidden md:flex flex-col border-r border-white/10 bg-black/20 backdrop-blur-xl p-6 relative z-10">
                <div className="flex items-center gap-2 mb-10 px-2">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                        F
                    </div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-purple-400">
                        FinanceYu
                    </h1>
                </div>

                <nav className="space-y-2 flex-1">
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.to}
                            icon={item.icon}
                            label={item.label}
                            to={item.to}
                            active={location.pathname === item.to}
                        />
                    ))}
                </nav>

                <div className="mt-auto pt-6 border-t border-white/10">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-pink-500 to-rose-500" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">Usuário</p>
                            <p className="text-xs text-muted-foreground truncate">
                                admin@financeyu.com
                            </p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 relative overflow-y-auto pt-16 md:pt-0">
                <div className="absolute inset-0 pointer-events-none w-full overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                </div>
                <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto">{children}</div>
            </main>
            <AIAssistant />
        </div>
    );
};
