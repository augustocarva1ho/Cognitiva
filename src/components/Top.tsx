'use client';
import { useState } from 'react';
import LoginModal from './LoginModal';

export default function Top() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <header className="w-screen bg-green-300 h-20 text-zinc-50 font-bold flex items-center justify-between px-8">

      <div className="text-lg flex gap-4 items-center">
        <img src='./head-logo2.svg' className="w-12"/>
        COGNITIVA
      </div>

      <nav className="flex gap-20 text-md">
        <a href="#" className="hover:underline">Sobre nós</a>
        <a href="#" className="hover:underline">Notícias</a>
        <a href="#" className="hover:underline">Contato</a>
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
    </header>
  );
}
