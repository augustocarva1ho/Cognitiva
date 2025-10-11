'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface SubjectCreateProps {
  onCreated: () => void;
  onCancel: () => void;
}

export default function SubjectCreate({ onCreated, onCancel }: SubjectCreateProps) {
  const { API_BASE_URL, token } = useAuth();
  const [nomeMateria, setNomeMateria] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setMessage({ type: 'error', text: 'Sessão expirada. Faça login novamente.' });
      return;
    }
    
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/materias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ nome: nomeMateria }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Erro de servidor: ${response.status}`);
      }

      setMessage({ type: 'success', text: 'Matéria cadastrada com sucesso!' });
      setNomeMateria(''); // Limpa o campo
      setTimeout(onCreated, 1500); // Retorna à lista após 1.5s

    } catch (err) {
      const errorText = err instanceof Error ? err.message : 'Erro desconhecido ao cadastrar.';
      setMessage({ type: 'error', text: errorText });
    } finally {
      setLoading(false);
    }
  };

  const messageClass = message 
    ? message.type === 'success' 
      ? 'bg-green-100 border-green-400 text-green-700'
      : 'bg-red-100 border-red-400 text-red-700'
    : '';

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-8 mt-4">
      <h2 className="text-2xl font-bold text-green-500 mb-6 text-center">Cadastrar Nova Matéria</h2>
      
      {message && (
        <div className={`p-3 mb-4 rounded-lg text-center font-medium ${messageClass}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nomeMateria" className="block text-sm font-medium text-gray-700 mb-1">
            Nome da Matéria
          </label>
          <input
            type="text"
            id="nomeMateria"
            name="nomeMateria"
            value={nomeMateria}
            onChange={(e) => setNomeMateria(e.target.value)}
            required
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
          />
        </div>

        <div className="flex justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-xl shadow hover:bg-gray-400 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Matéria'}
          </button>
        </div>
      </form>
    </div>
  );
}