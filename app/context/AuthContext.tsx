"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  name: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  login: (phone: string) => void;
  logout: () => void;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const login = (phone: string) => {
    // Mock Login Logic
    setUser({ name: "Demo User", phone });
    setIsLoginModalOpen(false);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoginModalOpen, 
      openLoginModal: () => setIsLoginModalOpen(true), 
      closeLoginModal: () => setIsLoginModalOpen(false) 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};