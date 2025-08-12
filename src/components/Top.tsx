'use client';
import { useState } from 'react';
import LoginModal from './LoginModal';
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Top() {
  const [showLogin, setShowLogin] = useState(false);
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="fixed top-0 left-0 w-screen bg-green-300 h-20 text-zinc-50 font-bold flex items-center justify-between px-8">

      <div className="text-lg flex gap-4 items-center px-8 py-4">
        <Link href="/" onClick={handleClick} className="flex items-center">
          <img src="./head-logo2.svg" className="w-12 ml-[-32px]" alt="Logo" />
          COGNITIVA
        </Link>
      </div>
      <nav className="flex gap-20 text-md">
        <Link href={pathname === "/" ? "#sobre-nos" : "/#sobre-nos"} scroll={true} className="hover:underline">Sobre nós</Link>
        <Link href={pathname === "/" ? "#noticias" : "/#noticias"} scroll={true} className="hover:underline">Notícias</Link>
        <Link href={pathname === "/" ? "#contato" : "/#contato"} scroll={true} className="hover:underline">Contato</Link>
        <a href="/user_interface" className="hover:underline">Área do Professor</a>
      </nav>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => setShowLogin(true)} 
          className="bg-zinc-50 text-green-300 px-4 py-1 rounded hover:bg-green-100 transition">
          Login
        </button>
        <div className="w-8 h-8 bg-gray-400 rounded-full"></div> {/* Imagem placeholder */}
      </div>
       <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}
