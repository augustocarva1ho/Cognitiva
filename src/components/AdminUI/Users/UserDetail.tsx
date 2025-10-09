'use client';
import { useState, useEffect } from 'react';
import { useAuth, Docente } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface UserDetailProps {
  docente: Docente;
  onDone: () => void;
  onCancel: () => void;
}

interface DocenteFormData {
  nome: string;
  email: string | null;
  cpf: string;
  materia: string;
  turmas: string[];
  nivelAcesso: string;
}

interface Acesso {
  id: string;
  nome: string;
}

export default function UserDetail({ docente, onDone, onCancel }: UserDetailProps) {
  const { API_BASE_URL, token } = useAuth();
  const [formData, setFormData] = useState<DocenteFormData>({
    nome: docente.nome,
    email: docente.email,
    cpf: docente.cpf,
    materia: docente.materia,
    turmas: docente.turmas || [],
    nivelAcesso: docente.acesso.id,
  });
  const [acessos, setAcessos] = useState<Acesso[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAcessos, setLoadingAcessos] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const turmasPlaceholder = ["Turma A", "Turma B", "Turma C", "Turma D"];

  useEffect(() => {
    const fetchAcessos = async () => {
      setLoadingAcessos(true);
      if (!token) {
        setLoadingAcessos(false);
        return;
      }

      const url = `${API_BASE_URL}/api/docentes/acessos`;

      try {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Falha ao buscar níveis de acesso');
        }
        const data: Acesso[] = await response.json();
        setAcessos(data);
      } catch (error) {
        console.error('Erro ao buscar níveis de acesso:', error);
        setMessage({ type: 'error', text: 'Não foi possível carregar os níveis de acesso.' });
      } finally {
        setLoadingAcessos(false);
      }
    };
    fetchAcessos();
  }, [API_BASE_URL, token]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage(null);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, selectedOptions } = e.target;
    const selectedValues = Array.from(selectedOptions, (option) => option.value);
    setFormData((prev) => ({ ...prev, [name]: selectedValues }));
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
      const response = await fetch(`${API_BASE_URL}/api/docentes/${docente.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Falha ao atualizar docente: ${response.statusText}`);
      }

      setMessage({ type: 'success', text: 'Docente atualizado com sucesso!' });
      setTimeout(onDone, 1500); 

    } catch (err) {
      const errorText = err instanceof Error ? err.message : 'Erro desconhecido ao atualizar.';
      setMessage({ type: 'error', text: errorText });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Tem certeza que deseja excluir o docente ${docente.nome}? Esta ação é irreversível.`)) {
      return;
    }
    if (!token) {
      setMessage({ type: 'error', text: 'Sessão expirada.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/docentes/${docente.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Falha ao excluir docente: ${response.statusText}`);
      }

      setMessage({ type: 'success', text: 'Docente excluído com sucesso!' });
      setTimeout(onDone, 1500); 

    } catch (err) {
      const errorText = err instanceof Error ? err.message : 'Erro desconhecido ao excluir.';
      setMessage({ type: 'error', text: errorText });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-8 mt-4">
      <h2 className="text-2xl font-bold text-green-500 mb-6 text-center">Detalhes e Edição de Docente</h2>
      <p className="text-sm text-gray-500 mb-4 text-center">Registro: {docente.registro}</p>

      {message && (
        <div className={`p-3 mb-4 rounded-lg text-center font-medium ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo de Nome */}
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Docente
          </label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome || ''}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
          />
        </div>

        {/* CPF 
        <div>
          <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
            CPF
          </label>
          <input
            type="text"
            id="cpf"
            name="cpf"
            value={formData.cpf || ''}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
          />
        </div>*/}

        {/* Matéria 
        <div>
          <label htmlFor="materia" className="block text-sm font-medium text-gray-700 mb-1">
            Matéria
          </label>
          <input
            type="text"
            id="materia"
            name="materia"
            value={formData.materia || ''}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
          />
        </div>

        {/* Turmas atribuídas 
        <div>
          <label htmlFor="turmas" className="block text-sm font-medium text-gray-700 mb-1">
            Turmas atribuídas
          </label>
          <select
            multiple
            id="turmas"
            name="turmas"
            value={formData.turmas}
            onChange={handleSelectChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none h-32"
          >
            {turmasPlaceholder.map((turma) => (
              <option key={turma} value={turma}>
                {turma}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Segure <kbd>Ctrl</kbd> (ou <kbd>Cmd</kbd> no Mac) para selecionar mais de uma.
          </p>
        </div>*/}
        
        {/* Campo de Nível de Acesso */}
        <div>
          <label htmlFor="nivelAcesso" className="block text-sm font-medium text-gray-700 mb-1">
            Nível de Acesso
          </label>
          <select
            id="nivelAcesso"
            name="nivelAcesso"
            value={formData.nivelAcesso}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
            required
            disabled={loadingAcessos || loading}
          >
            <option value="" disabled>
              {loadingAcessos ? 'A carregar...' : 'Selecione um nível de acesso'}
            </option>
            {acessos.map((acesso) => (
              <option key={acesso.id} value={acesso.id}>
                {acesso.nome}
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
          {loading ? 'Excluindo...' : 'Excluir Docente'}
        </button>
      </div>
    </div>
  );
}