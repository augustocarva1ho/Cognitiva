'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// --- DEFINIÇÃO DE TIPOS CENTRALIZADA ---
// Usamos a interface Docente como tipo base para o usuário autenticado
export interface Docente {
  id: string; // O UUID do Prisma é uma string
  nome: string;
  email: string | null; // Corrigido para aceitar null
  registro: string;
  cpf: string;
  materia: string;
  turmas: string[];
  acesso: {
      id: string;
      nome: string;
  };
}

// O tipo de usuário no contexto de auth pode ser um Docente completo,
// mas apenas com os campos necessários para a UI
type AuthUser = Pick<Docente, 'id' | 'nome' | 'acesso'>;

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  isLoggedIn: boolean;
  login: (token: string, userData: AuthUser) => void;
  logout: () => void;
  API_BASE_URL: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// URL da sua API de autenticação.
const API_BASE_URL = 'http://localhost:4000'; 

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const isLoggedIn = !!token;
  const router = useRouter(); 

  // Efeito para carregar o estado do localStorage na inicialização
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
    }
  }, []);

  const login = (newToken: string, userData: AuthUser) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(userData));
    router.push('/user_interface');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    router.push('/'); 
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoggedIn, login, logout, API_BASE_URL }}>
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