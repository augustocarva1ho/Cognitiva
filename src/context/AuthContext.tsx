'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Interface completa do Docente, exportada para uso em Managers e Detail Views
export interface Docente {
  id: string;
  nome: string;
  email: string;
  registro: string;
  escolaId: string; // FK para a Escola
  acesso: { nome: string }; // Objeto de acesso
}

// Interface para o usuário autenticado
interface AuthUser {
  id: string;
  nome: string;
  acesso: string; // O nome da role (Ex: 'Administrador')
  escolaId: string; // ID da escola principal do Docente (permanente)
  escolaNome: string; // <-- ADICIONADO: Nome da escola para exibição na UI
}

// Interface do contexto de autenticação
interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoadingAuth: boolean;
  viewingSchoolId: string | null; // <-- NOVO: ID da escola atualmente VISUALIZADA
  setViewingSchoolId: (schoolId: string | null) => void; // <-- NOVO: Função para alterar a visualização
  login: (jwtToken: string, userData: AuthUser) => void;
  logout: () => void;
  API_BASE_URL: string;
  needsTermsPopup: boolean;
  setNeedsTermsPopup: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  // --- NOVO: controla exibição do popup de termos ---
  const [needsTermsPopup, setNeedsTermsPopup] = useState(false);

  // NOVO ESTADO: Inicializa com o valor armazenado ou null
  const [viewingSchoolId, setViewingSchoolId] = useState<string | null>(null); 
  
  const router = useRouter();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const decodeUser = (jwtToken: string): AuthUser | null => {
      try {
          const payload = JSON.parse(atob(jwtToken.split('.')[1]));
          
          if (payload.user && payload.user.acesso) {
              return {
                  id: payload.user.id,
                  nome: payload.user.nome,
                  acesso: payload.user.acesso,
                  escolaId: payload.user.escolaId || null, 
                  escolaNome: payload.user.escolaNome || "Sem Escola", // Garante valor
              } as AuthUser;
          }
          return null;
      } catch (error) {
          return null;
      }
  };

  const login = (jwtToken: string, userData: AuthUser) => {
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    setToken(jwtToken);
    setUser(userData);

    setNeedsTermsPopup(true);
    
    // NOVO: Define a escola principal como a escola de visualização padrão
    if (userData.escolaId) {
        localStorage.setItem('viewingSchoolId', userData.escolaId);
        setViewingSchoolId(userData.escolaId);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('viewingSchoolId'); // Remove o estado de visualização
    setToken(null);
    setUser(null);
    setViewingSchoolId(null);
    router.push('/');
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedViewingSchoolId = localStorage.getItem('viewingSchoolId');
    
    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser) as AuthUser;
        setUser(userData); 
        setToken(storedToken);
        
        // NOVO: Prioriza a última escola de visualização salva, ou a escola principal do usuário
        setViewingSchoolId(storedViewingSchoolId || userData.escolaId || null); 
      } catch (error) {
        console.error("Dados de usuário armazenados inválidos.", error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('viewingSchoolId');
      }
    }
    setIsLoadingAuth(false);
  }, []);
  
  // Função para alterar o ID da escola de visualização e salvar no localStorage
  const updateViewingSchoolId = (schoolId: string | null) => {
    setViewingSchoolId(schoolId);
    if (schoolId) {
        localStorage.setItem('viewingSchoolId', schoolId);
    } else {
        localStorage.removeItem('viewingSchoolId');
    }
  };

  return (
    <AuthContext.Provider value={{ 
        user, token, isLoggedIn: !!token, isLoadingAuth, 
        viewingSchoolId, setViewingSchoolId: updateViewingSchoolId, // Exporta a função de atualização
        login, logout, API_BASE_URL,
        needsTermsPopup, setNeedsTermsPopup,
    }}>
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
