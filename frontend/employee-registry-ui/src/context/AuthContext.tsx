import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
    token: string | null;
    username: string | null;
    role: string | null;
    login: (token: string, username: string, role: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [username, setUsername] = useState<string | null>(localStorage.getItem('username'));
    const [role, setRole] = useState<string | null>(localStorage.getItem('role'));

    const login = (newToken: string, newUsername: string, newRole: string) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('username', newUsername);
        localStorage.setItem('role', newRole);
        setToken(newToken);
        setUsername(newUsername);
        setRole(newRole);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        setToken(null);
        setUsername(null);
        setRole(null);
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                username,
                role,
                login,
                logout,
                isAuthenticated: !!token,
                isAdmin: role === 'Admin',
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
