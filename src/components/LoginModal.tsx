'use client';
import { useEffect, useState } from 'react';


interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showGif, setShowGif] = useState(false);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
  }, [isOpen]);

  if (!isOpen) return null;

  const gifSrc = `/close-btn-animation.gif?${showGif ? Date.now() : ''}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-zinc-200 rounded-lg shadow-lg w-[90%] max-w-md p-6 relative">
        <button
          onMouseEnter={() => setShowGif(true)}
          onMouseLeave={() => setShowGif(false)}
          onClick={onClose}
          className="absolute top-1 right-1 w-16 h-16"
        >
          {showGif ? (
            <img
              key="gif"
              src={gifSrc}
              alt="Close button animation"
              className="w-full h-full object-contain"
              draggable={false}
              onAnimationEnd={() => setShowGif(false)} // oculta após o fim
            />
          ) : (
             <img
                key="png"
                src="/close-btn-static.png"
                alt="Close button static"
                className="w-full h-full object-contain bg-transparent"
                draggable={false}
              />
          )}
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center text-green-400">Login</h2>
        <form className="flex flex-col gap-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300 text-gray-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300 text-gray-500"
          />

          <button
            type="submit"
            className="bg-green-300 text-zinc-50 rounded px-4 py-2 transition-all duration-300 hover:rounded-3xl"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
