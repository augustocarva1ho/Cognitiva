'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Turma {
  id: string;
  Nome: string;
  escolaId: string;
}

interface ClassDetailProps {
  turma: Turma;
  onDone: () => void;
  onCancel: () => void;
}

export default function ClassDetail({ turma, onDone, onCancel }: ClassDetailProps) {
  const { API_BASE_URL, token, user, viewingSchoolId } = useAuth();
  const [nomeTurma, setNomeTurma] = useState(turma.Nome);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isAdmin = user?.acesso === 'Administrador';
  // Apenas Administrador OU o Docente/Supervisor cuja escolaId seja a da turma
  const canOperate = isAdmin || (user?.escolaId === turma.escolaId);
  
  // ID de escola para o PUT/DELETE (usa viewingSchoolId do Admin ou o ID fixo do Docente)
  const escolaDeOperacao = isAdmin ? viewingSchoolId : user?.escolaId

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setMessage({ type: 'error', text: 'Sessão expirada.' });
      return;
    }
    
    setLoading(true);
    setMessage(null);

    // CRÍTICO: Caso seja Admin, a escolaIdToSave é a escola selecionada. Caso seja Docente, é a escola da turma.
    const escolaIdToSave = escolaDeOperacao;

    if (!escolaIdToSave) {
        setMessage({ type: 'error', text: 'ID da escola de operação ausente.' });
        setLoading(false);
        return;
    }

    try {
      const payload = {
        Nome: nomeTurma,
        escolaId: escolaIdToSave, // CRÍTICO: Envia a FK correta para o backend
      };

      // Adiciona o viewingSchoolId na query para o backend verificar a permissão do Admin
      const queryParam = isAdmin ? `?viewingSchoolId=${escolaIdToSave}` : '';

      const response = await fetch(`${API_BASE_URL}/api/turmas/${turma.id}${queryParam}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Falha ao atualizar turma: ${response.statusText}`);
      }

      setMessage({ type: 'success', text: 'Turma atualizada com sucesso!' });
      setTimeout(onDone, 1500); 

    } catch (err) {
      const errorText = err instanceof Error ? err.message : 'Erro desconhecido ao atualizar.';
      setMessage({ type: 'error', text: errorText });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Tem certeza que deseja excluir a turma "${turma.Nome}"? Esta ação é irreversível.`)) {
      return;
    }
    if (!token) {
      setMessage({ type: 'error', text: 'Sessão expirada.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const escolaIdToOperate = escolaDeOperacao;
    const queryParam = isAdmin ? `?viewingSchoolId=${escolaIdToOperate}` : ''; // Anexa filtro para o Admin
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/turmas/${turma.id}${queryParam}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Falha ao excluir turma: ${response.statusText}`);
      }

      setMessage({ type: 'success', text: 'Turma excluída com sucesso!' });
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

  const isFormDisabled = loading || !canOperate;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-xl mt-4">
      <h2 className="text-2xl font-bold text-green-500 mb-6 text-center">Detalhes e Edição de Turma</h2>
      
      {message && (
        <div className={`p-3 mb-4 rounded-lg text-center font-medium ${messageClass}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nomeTurma" className="block text-sm font-medium text-gray-700 mb-1">
            Nome da Turma
          </label>
          <input
            type="text"
            id="nomeTurma"
            name="nomeTurma"
            value={nomeTurma}
            onChange={(e) => setNomeTurma(e.target.value)}
            required
            disabled={isFormDisabled}
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
            disabled={isFormDisabled}
            className="flex-1 bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
      
      <div className="mt-4 border-t pt-4 border-gray-200">
        <button
          onClick={handleDelete}
          disabled={isFormDisabled}
          className="w-full bg-red-500 text-white font-semibold py-2 px-4 rounded-xl shadow hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Excluindo...' : 'Excluir Turma'}
        </button>
      </div>
    </div>
  );
}