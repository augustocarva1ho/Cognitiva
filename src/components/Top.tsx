'use client';
import { useState } from 'react';
import LoginModal from './LoginModal'; // CORREÇÃO: Padrão Next.js (sem extensão)
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from '../context/AuthContext'; // CORREÇÃO: Padrão Next.js (sem extensão)

export default function Top() {
  const { isLoggedIn, user, logout } = useAuth(); // Usando o estado de login
  const [showLogin, setShowLogin] = useState(false);
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Lógica para bloquear a navegação para outras páginas (além de '/')
  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    // Se o usuário não está logado E o link não é um link âncora da página inicial
    if (!isLoggedIn && href !== '/' && !href.startsWith('#')) {
      // Bloqueia a navegação
      e.preventDefault();
      // Usando console.error/log em vez de alert()
      console.error("Acesso restrito. Faça login para acessar a Área do Professor.");
      setShowLogin(true); // Abre o modal de login para guiar o usuário
    }
    // Permite a navegação se estiver logado ou se for um link âncora
  };
  
  // URL para a área restrita
  const professorAreaPath = "/user_interface";

  return (
    <div className="fixed top-0 left-0 w-screen bg-green-300 h-20 text-zinc-50 font-bold flex items-center justify-between px-8">

      <div className="text-lg flex gap-4 items-center px-8 py-4">
        <Link href="/" onClick={handleClick} className="flex items-center">
          <img src="./head-logo2.svg" className="w-12 ml-[-32px]" alt="Logo" />
          COGNITIVA
        </Link>
      </div>
      
      {/* Links de Navegação */}
      <nav className="flex gap-20 text-md">
        <Link href={pathname === "/" ? "#sobre-nos" : "/#sobre-nos"} scroll={true} className="hover:underline">Sobre nós</Link>
        <Link href={pathname === "/" ? "#noticias" : "/#noticias"} scroll={true} className="hover:underline">Notícias</Link>
        <Link href={pathname === "/" ? "#contato" : "/#contato"} scroll={true} className="hover:underline">Contato</Link>
        
        {/* O link para a área do professor, agora condicionalmente estilizado */}
        <Link 
          href={professorAreaPath} 
          onClick={(e) => handleLinkClick(e, professorAreaPath)}
          className={`hover:underline ${!isLoggedIn ? 'hidden' : ''}`}
        >
          Área do Professor
        </Link>
      </nav>

      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          // Se LOGADO, mostra nome e botão de SAIR
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium whitespace-nowrap">
              Olá, **{user?.nome.split(' ')[0] || 'Docente'}**
            </span>

            <button 
              onClick={logout} 
              className="bg-red-500 text-zinc-50 px-4 py-1 rounded hover:bg-red-600 transition font-medium"
              title="Sair"
            >
              🚪 Sair
            </button>
            <div className="w-8 h-8 bg-gray-400 rounded-full"></div> {/* Imagem placeholder */}
          </div>
        ) : (
          // Se DESLOGADO, mostra o botão de LOGIN (Estilo Original Restaurado)
          <button 
            onClick={() => setShowLogin(true)} 
            className="bg-zinc-50 text-green-300 px-4 py-1 rounded hover:bg-green-100 transition"
          >
            Login
          </button>
        )}
      </div>
      
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}
