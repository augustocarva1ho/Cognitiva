'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Materia {
  id: string;
  nome: string;
}

interface SubjectDetailProps {
  materia: Materia;
  onDone: () => void;
  onCancel: () => void;
}

export default function SubjectDetail({ materia, onDone, onCancel }: SubjectDetailProps) {
  const { API_BASE_URL, token } = useAuth();
  const [nomeMateria, setNomeMateria] = useState(materia.nome);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // --- Função de Edição (PUT) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setMessage({ type: 'error', text: 'Sessão expirada.' });
      return;
    }
    
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/materias/${materia.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ nome: nomeMateria }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Falha ao atualizar matéria: ${response.statusText}`);
      }

      setMessage({ type: 'success', text: 'Matéria atualizada com sucesso!' });
      setTimeout(onDone, 1500); 

    } catch (err) {
      const errorText = err instanceof Error ? err.message : 'Erro desconhecido ao atualizar.';
      setMessage({ type: 'error', text: errorText });
    } finally {
      setLoading(false);
    }
  };

  // --- Função de Exclusão (DELETE) ---
  const handleDelete = async () => {
    if (!window.confirm(`Tem certeza que deseja excluir a matéria "${materia.nome}"? Esta ação é irreversível.`)) {
      return;
    }
    if (!token) {
      setMessage({ type: 'error', text: 'Sessão expirada.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/materias/${materia.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Falha ao excluir matéria: ${response.statusText}`);
      }

      setMessage({ type: 'success', text: 'Matéria excluída com sucesso!' });
      setTimeout(onDone, 1500); 

    } catch (err) {
      const errorText = err instanceof Error ? err.message : 'Erro desconhecido ao excluir.';
      setMessage({ type: 'error', text: errorText });
    } finally {
      setLoading(false);
    }
  };

  const messageClass = message 
    ? message.type === 'success' 
      ? 'bg-green-100 text-green-700'
      : 'bg-red-100 text-red-700'
    : '';

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-8 mt-4">
      <h2 className="text-2xl font-bold text-green-500 mb-6 text-center">Detalhes e Edição de Matéria</h2>
      
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
            Voltar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
      
      <div className="mt-4 border-t pt-4 border-gray-200">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="w-full bg-red-500 text-white font-semibold py-2 px-4 rounded-xl shadow hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Excluindo...' : 'Excluir Matéria'}
        </button>
      </div>
    </div>
  );
}
