'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation'; // Importa useRouter do Next.js

// Tipos baseados na resposta da sua API
interface User {
  id: number;
  nome: string;
  acesso: string; // Ex: 'admin', 'docente', etc.
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isLoggedIn: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// URL da sua API de autenticação. ATUALIZE ESTA URL!
// Removida a barra final '/' por convenção.
const API_BASE_URL = 'http://localhost:4000'; 
console.log(`[AuthContext] API Base URL definida como: ${API_BASE_URL}`);


interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const isLoggedIn = !!token;
  const router = useRouter(); // Inicializa o router

  // 1. Efeito para carregar o estado do localStorage na inicialização
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        console.log('[AuthContext] Sessão restaurada do localStorage.');
      } catch (e) {
        // Limpa se o JSON estiver corrompido
        console.error("[AuthContext] Erro ao carregar dados do localStorage, limpando:", e);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
    }
  }, []);

  const login = (newToken: string, userData: User) => {
    // Armazena no state
    setToken(newToken);
    setUser(userData);
    
    // Armazena no localStorage para persistência
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(userData));
    
    console.log('[AuthContext] Login efetuado. Redirecionando...');
    // Redireciona para a área do professor após o login
    router.push('/user_interface');
  };

  const logout = () => {
    // Limpa o state
    setToken(null);
    setUser(null);
    
    // Limpa o localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    
    console.log('[AuthContext] Logout efetuado. Redirecionando...');
    // Redireciona para a página inicial ao sair
    router.push('/'); 
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para uso simplificado do contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return { ...context, API_BASE_URL }; // Exporta a URL da API junto com o contexto
};
