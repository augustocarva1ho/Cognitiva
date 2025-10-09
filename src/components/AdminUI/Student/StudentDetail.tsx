'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Interface para o tipo de dado 'Aluno'
interface Aluno {
  id: string;
  Nome: string;
  Matricula: string;
  Idade: number;
  turma: {
    Nome: string;
    id: string;
  };
}

// Interface para o tipo de dado 'Turma'
interface Turma {
  id: string;
  Nome: string;
}

interface StudentDetailProps {
  aluno: Aluno;
  onDone: () => void;
  onCancel: () => void;
}

interface StudentFormData {
  Nome: string;
  Matricula: string;
  Idade: number | '';
  turmaId: string;
}

export default function StudentDetail({ aluno, onDone, onCancel }: StudentDetailProps) {
  const { API_BASE_URL, token } = useAuth();
  const [formData, setFormData] = useState<StudentFormData>({
    Nome: aluno.Nome,
    Matricula: aluno.Matricula,
    Idade: aluno.Idade,
    turmaId: aluno.turma.id,
  });
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTurmas, setLoadingTurmas] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // UseEffect para buscar as turmas da API
  useEffect(() => {
    const fetchTurmas = async () => {
        setLoadingTurmas(true);
        if (!token) {
          setLoadingTurmas(false);
          return;
        }

        const url = `${API_BASE_URL}/api/turmas`;
        try {
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Falha ao buscar turmas');
            }
            const data: Turma[] = await response.json();
            setTurmas(data);
        } catch (error) {
            console.error('Erro ao buscar turmas:', error);
            setMessage({ type: 'error', text: 'Não foi possível carregar as turmas.' });
        } finally {
            setLoadingTurmas(false);
        }
    };
    fetchTurmas();
  }, [API_BASE_URL, token]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let finalValue: string | number = value;
    if (name === "Idade") {
        finalValue = value === "" ? "" : Number(value);
    }
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    setMessage(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setMessage({ type: 'error', text: 'Sessão expirada.' });
      return;
    }
    
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/alunos/${aluno.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Falha ao atualizar aluno: ${response.statusText}`);
      }

      setMessage({ type: 'success', text: 'Aluno atualizado com sucesso!' });
      setTimeout(onDone, 1500); 

    } catch (err) {
      const errorText = err instanceof Error ? err.message : 'Erro desconhecido ao atualizar.';
      setMessage({ type: 'error', text: errorText });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Tem certeza que deseja excluir o aluno ${aluno.Nome}? Esta ação é irreversível.`)) {
      return;
    }
    if (!token) {
      setMessage({ type: 'error', text: 'Sessão expirada.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/alunos/${aluno.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Falha ao excluir aluno: ${response.statusText}`);
      }

      setMessage({ type: 'success', text: 'Aluno excluído com sucesso!' });
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
      <h2 className="text-2xl font-bold text-green-500 mb-6 text-center">Detalhes e Edição de Aluno</h2>
      <p className="text-sm text-gray-500 mb-4 text-center">Matrícula: {aluno.Matricula}</p>

      {message && (
        <div className={`p-3 mb-4 rounded-lg text-center font-medium ${messageClass}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo de Nome */}
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Aluno
          </label>
          <input
            type="text"
            id="nome"
            name="Nome"
            value={formData.Nome}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
          />
        </div>

        {/* Matrícula (apenas visualização) */}
        <div>
          <label htmlFor="matricula" className="block text-sm font-medium text-gray-700 mb-1">
            Matrícula
          </label>
          <input
            type="text"
            id="matricula"
            name="Matricula"
            value={formData.Matricula}
            disabled
            className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-xl shadow-sm focus:outline-none cursor-not-allowed"
          />
        </div>

        {/* Idade */}
        <div>
          <label htmlFor="idade" className="block text-sm font-medium text-gray-700 mb-1">
            Idade
          </label>
          <input
            type="number"
            id="idade"
            name="Idade"
            value={formData.Idade}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
          />
        </div>
        
        {/* Turma */}
        <div>
          <label htmlFor="turmaId" className="block text-sm font-medium text-gray-700 mb-1">
            Turma
          </label>
          <select
            id="turmaId"
            name="turmaId"
            value={formData.turmaId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
            required
            disabled={loadingTurmas || loading}
          >
            <option value="" disabled>
              {loadingTurmas ? 'A carregar...' : 'Selecione uma turma'}
            </option>
            {turmas.map((turma) => (
              <option key={turma.id} value={turma.id}>
                {turma.Nome}
              </option>
            ))}
          </select>
        </div>

        {/* Botões de Ação */}
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
      
      {/* Botão de Exclusão */}
      <div className="mt-4 border-t pt-4 border-gray-200">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="w-full bg-red-500 text-white font-semibold py-2 px-4 rounded-xl shadow hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Excluindo...' : 'Excluir Aluno'}
        </button>
      </div>
    </div>
  );
}