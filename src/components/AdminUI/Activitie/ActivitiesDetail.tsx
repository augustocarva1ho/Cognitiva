'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Tipos base
interface Materia {
  id: string;
  nome: string;
}

interface Docente {
  id: string;
  nome: string;
}

interface Atividade {
  id: string;
  tipo: string;
  local: string;
  tempoFinalizacao: string;
  dinamica: string;
  comConsulta: boolean;
  liberdadeCriativa: boolean;
  notaMaxima: number;
  materia: Materia;
  professor: Docente;
  descricaoAdicional?: string;
}

interface ActivityDetailProps {
  atividade: Atividade;
  onDone: () => void;
  onCancel: () => void;
}

// O tipo do formulário para edição
interface FormData {
  tipo: string;
  local: string;
  tempoFinalizacao: string;
  dinamica: string;
  comConsulta: boolean;
  liberdadeCriativa: boolean;
  notaMaxima: number | '';
  materiaId: string;
  professorId: string;
  descricaoAdicional: string;
}

export default function ActivityDetail({ atividade, onDone, onCancel }: ActivityDetailProps) {
  const { API_BASE_URL, token } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    tipo: atividade.tipo,
    local: atividade.local,
    tempoFinalizacao: atividade.tempoFinalizacao,
    dinamica: atividade.dinamica,
    comConsulta: atividade.comConsulta,
    liberdadeCriativa: atividade.liberdadeCriativa,
    notaMaxima: atividade.notaMaxima,
    materiaId: atividade.materia.id,
    professorId: atividade.professor.id,
    descricaoAdicional: atividade.descricaoAdicional || "",
  });
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [professores, setProfessores] = useState<Docente[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDependencies, setLoadingDependencies] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // UseEffect para buscar matérias e professores
  useEffect(() => {
    const fetchDependencies = async () => {
        setLoadingDependencies(true);
        if (!token) {
          setLoadingDependencies(false);
          return;
        }
        
        try {
            const [materiasRes, professoresRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/materias`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_BASE_URL}/api/docentes`, { headers: { 'Authorization': `Bearer ${token}` } }),
            ]);

            if (materiasRes.ok) setMaterias(await materiasRes.json());
            if (professoresRes.ok) setProfessores(await professoresRes.json());
        } catch (error) {
            console.error('Erro ao buscar matérias/professores:', error);
            setMessage({ type: 'error', text: 'Não foi possível carregar as opções de matéria e professor.' });
        } finally {
            setLoadingDependencies(false);
        }
    };
    fetchDependencies();
  }, [API_BASE_URL, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let finalValue: string | number | boolean = value;

    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'notaMaxima' && value !== '') {
      finalValue = Number(value);
    }
    
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    setMessage(null);
  };
  
  // --- Lógica de Edição e Clonagem ---
  const handleSubmit = async (e: React.FormEvent, isClone: boolean = false) => {
    e.preventDefault();
    if (!token) {
      setMessage({ type: 'error', text: 'Sessão expirada.' });
      return;
    }
    
    setLoading(true);
    setMessage(null);

    const payload = { ...formData, notaMaxima: Number(formData.notaMaxima) };

    try {
      const method = isClone ? 'POST' : 'PUT';
      const url = isClone ? `${API_BASE_URL}/api/atividades` : `${API_BASE_URL}/api/atividades/${atividade.id}`;

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Falha ao ${isClone ? 'clonar' : 'atualizar'} atividade: ${response.status}`);
      }

      const successMessage = isClone ? 'Atividade clonada com sucesso!' : 'Atividade atualizada com sucesso!';
      setMessage({ type: 'success', text: successMessage });
      setTimeout(onDone, 1500); 

    } catch (err) {
      const errorText = err instanceof Error ? err.message : 'Erro desconhecido.';
      setMessage({ type: 'error', text: errorText });
    } finally {
      setLoading(false);
    }
  };

  // --- Função de Exclusão (DELETE) ---
  const handleDelete = async () => {
    if (!window.confirm(`Tem certeza que deseja excluir a atividade "${atividade.tipo}"? Esta ação é irreversível.`)) {
      return;
    }
    if (!token) {
      setMessage({ type: 'error', text: 'Sessão expirada.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/atividades/${atividade.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Falha ao excluir atividade: ${response.statusText}`);
      }

      setMessage({ type: 'success', text: 'Atividade excluída com sucesso!' });
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
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-4">
      <h2 className="text-2xl font-bold text-green-500 mb-6 text-center">Detalhes e Edição de Atividade</h2>
      
      {message && (
        <div className={`p-3 mb-4 rounded-lg text-center font-medium ${messageClass}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
        
        {/* Tipo de Atividade */}
        <div>
          <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Atividade</label>
          <select
            id="tipo" name="tipo" value={formData.tipo} onChange={handleChange} required
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
            disabled={loadingDependencies || loading}
          >
            <option value="">Selecione...</option>
            <option value="Prova">Prova</option>
            <option value="Trabalho de Pesquisa">Trabalho de Pesquisa</option>
            <option value="Lista de Exercícios">Lista de Exercícios</option>
            <option value="Redação">Redação</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        {/* Local, Tempo, Dinâmica */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="local" className="block text-sm font-medium text-gray-700 mb-1">Local</label>
            <select id="local" name="local" value={formData.local} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
              disabled={loadingDependencies || loading}
            >
              <option value="">Selecione...</option>
              <option value="Em sala">Em sala</option>
              <option value="Em casa">Em casa</option>
              <option value="Em Quadra">Em Quadra</option>
              <option value="Em Laboratório">Em Laboratório</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          <div>
            <label htmlFor="tempoFinalizacao" className="block text-sm font-medium text-gray-700 mb-1">Tempo Finalização</label>
            <input type="text" id="tempoFinalizacao" name="tempoFinalizacao" value={formData.tempoFinalizacao} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
              disabled={loadingDependencies || loading}
            />
          </div>
          <div>
            <label htmlFor="dinamica" className="block text-sm font-medium text-gray-700 mb-1">Dinâmica</label>
            <select id="dinamica" name="dinamica" value={formData.dinamica} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
              disabled={loadingDependencies || loading}
            >
              <option value="">Selecione...</option>
              <option value="Individual">Individual</option>
              <option value="Em Dupla">Em Dupla</option>
              <option value="Em Grupo">Em Grupo</option>
            </select>
          </div>
        </div>

        {/* Matéria, Professor e Nota Máxima */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="materiaId" className="block text-sm font-medium text-gray-700 mb-1">Matéria</label>
            <select
              id="materiaId" name="materiaId" value={formData.materiaId} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
              disabled={loadingDependencies || loading}
            >
              <option value="">Selecione...</option>
              {materias.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="professorId" className="block text-sm font-medium text-gray-700 mb-1">Professor</label>
            <select
              id="professorId" name="professorId" value={formData.professorId} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
              disabled={loadingDependencies || loading}
            >
              <option value="">Selecione...</option>
              {professores.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="notaMaxima" className="block text-sm font-medium text-gray-700 mb-1">Nota Máxima</label>
            <input type="number" id="notaMaxima" name="notaMaxima" value={formData.notaMaxima} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
              disabled={loadingDependencies || loading}
            />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex gap-8">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="comConsulta" name="comConsulta" checked={formData.comConsulta} onChange={handleChange}
              disabled={loadingDependencies || loading}
              className="h-4 w-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="comConsulta" className="text-sm font-medium text-gray-700">Com Consulta?</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="liberdadeCriativa" name="liberdadeCriativa" checked={formData.liberdadeCriativa} onChange={handleChange}
              disabled={loadingDependencies || loading}
              className="h-4 w-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="liberdadeCriativa" className="text-sm font-medium text-gray-700">Liberdade Criativa?</label>
          </div>
        </div>

        {/* Descrição Adicional */}
        <div>
          <label htmlFor="descricaoAdicional" className="block text-sm font-medium text-gray-700 mb-1">Descrição Adicional</label>
          <textarea id="descricaoAdicional" name="descricaoAdicional" value={formData.descricaoAdicional} onChange={handleChange} rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
            disabled={loadingDependencies || loading}
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 pt-2">
          <div className="flex-1 space-y-2">
            <button
              type="submit"
              disabled={loading || loadingDependencies}
              className="w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)} // Botão para clonar
              disabled={loading || loadingDependencies}
              className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-xl shadow hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Clonando...' : 'Salvar como Nova Atividade'}
            </button>
          </div>
          
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading || loadingDependencies}
              className="bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-xl shadow hover:bg-gray-400 transition-colors w-full"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-500 text-white font-semibold py-2 px-4 rounded-xl shadow hover:bg-red-600 transition-colors w-full"
            >
              {loading ? 'Excluindo...' : 'Excluir Atividade'}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}