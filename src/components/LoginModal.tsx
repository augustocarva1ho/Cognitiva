'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  // Obtém login, URL base e API_BASE_URL do contexto
  const { login, API_BASE_URL } = useAuth();
  const router = useRouter();
  
  const [registro, setRegistro] = useState(''); // O seu backend espera 'registro' ou 'email'
  const [senha, setSenha] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [showGif, setShowGif] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setRegistro('');
      setSenha('');
      setError(null);
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    // CORREÇÃO: Usando a nova rota simplificada /login
    const loginUrl = `${API_BASE_URL}/login`;
    console.log(`[LoginModal] Tentando POST para: ${loginUrl}`);

    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // O seu backend espera { registro, senha }
        body: JSON.stringify({ registro, senha }), 
      });

      const data = await response.json();
      console.log(`[LoginModal] Resposta da API - Status: ${response.status}`, data);


      if (!response.ok) {
        // Log de erro no console
        console.error('[LoginModal] Erro de autenticação. Status:', response.status);
        setError(data.error || 'Falha ao autenticar. Verifique suas credenciais.');
        setLoading(false);
        return;
      }

      // Log de sucesso
      console.log('[LoginModal] Sucesso: Login concluído e token recebido.');
      login(data.token, data.user);

      // Abrir os modais de termos/política depois do login válido
      sessionStorage.setItem("pendingUserLogin", "true");

      // Fecha modal de login
      onClose();

      // Redireciona para a Home (ou mantenha na mesma página)
      router.push("/");
      
    } catch (err) {
      // Este erro geralmente é de rede, DNS ou CORS
      console.error('[LoginModal] Erro de rede ou interno:', err);
      setError('Não foi possível conectar ao servidor de autenticação.');
    } finally {
      setLoading(false);
    }
  };

  // Resto do componente de visualização (original)
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
              onAnimationEnd={() => setShowGif(false)}
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
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}
          <input
            type="text"
            value={registro}
            onChange={(e) => setRegistro(e.target.value)}
            placeholder="Registro" // Corrigido para refletir o nome do campo
            required
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300 text-gray-500"
            disabled={loading}
          />
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha"
            required
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300 text-gray-500"
            disabled={loading}
          />

          <button
            type="submit"
            className="bg-green-300 text-zinc-50 rounded px-4 py-2 hover:bg-green-100 transition" // Estilo original
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
