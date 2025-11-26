import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(() => !!localStorage.getItem("token"));

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            api.get("/auth/me")
                .then((response) => {
                    setUser(response.data.user);
                })
                .catch(() => {
                    localStorage.removeItem("token");
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, []);

    const login = (token: string, user: User) => {
        localStorage.setItem("token", token);
        setUser(user);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
