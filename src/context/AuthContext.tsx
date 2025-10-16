'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Interface para o usuário autenticado
interface AuthUser {
  id: string;
  nome: string;
  acesso: string; // O nome da role (Ex: 'Administrador')
}

// Interface do contexto de autenticação
interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoadingAuth: boolean;
  login: (jwtToken: string, userData: AuthUser) => void; // CORRIGIDO: Agora aceita userData
  logout: () => void;
  API_BASE_URL: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  // Função helper para decodificar JWT e extrair o usuário (Usado apenas no useEffect)
  const decodeUserFromJWT = (jwtToken: string): AuthUser | null => {
      try {
          const payload = JSON.parse(atob(jwtToken.split('.')[1]));
          
          if (payload.user && payload.user.acesso) {
              return {
                  id: payload.user.id,
                  nome: payload.user.nome,
                  acesso: payload.user.acesso, // String (ex: 'Administrador')
              };
          }
          return null;
      } catch (error) {
          return null;
      }
  };

  // FUNÇÃO DE LOGIN CORRIGIDA
  const login = (jwtToken: string, userData: AuthUser) => {
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData)); // Salva o objeto usuário
    
    setToken(jwtToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Remove o objeto usuário
    setToken(null);
    setUser(null);
    router.push('/');
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user'); // Lê o objeto usuário salvo
    
    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser) as AuthUser;
        // O token é apenas para fins de API, o user é o que usamos para autenticar
        setUser(userData); 
        setToken(storedToken);
      } catch (error) {
        console.error("Dados de usuário armazenados inválidos.", error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoadingAuth(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn: !!token, isLoadingAuth, login, logout, API_BASE_URL }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
