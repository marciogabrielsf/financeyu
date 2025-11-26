import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FinanceProvider } from "./context/FinanceContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Layout } from "./layouts/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Debtors } from "./pages/Debtors";
import { Cards } from "./pages/Cards";
import { Debts } from "./pages/Debts";
import { Reports } from "./pages/Reports";
import { Settings } from "./pages/Settings";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    return <>{children}</>;
};

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <AuthProvider>
                    <Router>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route
                                path="/*"
                                element={
                                    <ProtectedRoute>
                                        <FinanceProvider>
                                            <Layout>
                                                <Routes>
                                                    <Route path="/" element={<Dashboard />} />
                                                    <Route path="/debtors" element={<Debtors />} />
                                                    <Route path="/cards" element={<Cards />} />
                                                    <Route path="/debts" element={<Debts />} />
                                                    <Route path="/reports" element={<Reports />} />
                                                    <Route
                                                        path="/settings"
                                                        element={<Settings />}
                                                    />
                                                </Routes>
                                            </Layout>
                                        </FinanceProvider>
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </Router>
                </AuthProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}

export default App;
