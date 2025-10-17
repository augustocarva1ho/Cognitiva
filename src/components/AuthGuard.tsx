'use client';
import React, { useEffect, ElementType, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

interface AuthGuardProps {
  Component: ElementType;
  allowedRoles?: string[];
}

const AuthGuard: React.FC<AuthGuardProps> = ({ Component, allowedRoles }) => {
  const { isLoggedIn, user, isLoadingAuth } = useAuth(); 
  const router = useRouter();

  // 1. Redirecionamento e verificação de permissões
  useEffect(() => {
    const userRole = user?.acesso; 

    // 1. Não tome decisões até que o carregamento do token termine.
    if (isLoadingAuth) {
        return; 
    }
    
    // 2. Se o carregamento terminou e NÃO está logado, redireciona.
    if (!isLoggedIn) {
      console.warn("[AuthGuard Effect] Usuário não logado. Redirecionando para /");
      router.push('/');
      return;
    } 
    
    // 3. Se está logado (isLoggedIn é true) e a role não corresponde à permissão, redireciona.
    if (userRole && allowedRoles && !allowedRoles.includes(userRole)) {
      console.error(`[AuthGuard Effect] ACESSO NEGADO. Usuário ${userRole} tentou acessar rota restrita.`);
      router.push('/unauthorized'); 
      return;
    }

  }, [isLoggedIn, user, allowedRoles, router, isLoadingAuth]);

  // 2. Exibição Condicional
  
  // Exibir Loading SOMENTE se o carregamento inicial ainda estiver a decorrer
  if (isLoadingAuth) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-zinc-500">
        Aguardando validação de sessão...
      </div>
    );
  }

  // Verifica se o usuário está logado E (tem permissão OU não há restrições)
  // A verificação `user` garante que o objeto existe.
  const userHasPermission = isLoggedIn && user && (!allowedRoles || allowedRoles.includes(user.acesso));

  if (userHasPermission) {
    return <Component />;
  }
  
  // Se chegamos aqui, o useEffect já disparou o redirecionamento.
  return null; 
};

export default AuthGuard;
