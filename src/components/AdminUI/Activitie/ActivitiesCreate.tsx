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

interface ActivityCreateProps {
  onCreated: () => void;
  onCancel: () => void;
}

// O tipo do formulário
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

export default function ActivityCreate({ onCreated, onCancel }: ActivityCreateProps) {
  const { API_BASE_URL, token } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    tipo: "",
    local: "",
    tempoFinalizacao: "",
    dinamica: "",
    comConsulta: false,
    liberdadeCriativa: false,
    notaMaxima: '',
    materiaId: "",
    professorId: "",
    descricaoAdicional: "",
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

            if (materiasRes.ok) {
                const data = await materiasRes.json();
                setMaterias(data);
                if (data.length > 0) setFormData(prev => ({ ...prev, materiaId: data[0].id }));
            }
            if (professoresRes.ok) {
                const data = await professoresRes.json();
                setProfessores(data);
                if (data.length > 0) setFormData(prev => ({ ...prev, professorId: data[0].id }));
            }
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setMessage({ type: 'error', text: 'Sessão expirada. Faça login novamente.' });
      return;
    }
    
    setLoading(true);
    setMessage(null);

    const payload = { ...formData, notaMaxima: Number(formData.notaMaxima) };

    try {
      const response = await fetch(`${API_BASE_URL}/api/atividades`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro de servidor: ${response.status}`);
      }

      setMessage({ type: 'success', text: 'Atividade cadastrada com sucesso!' });
      
      setFormData({
        tipo: "", local: "", tempoFinalizacao: "", dinamica: "", comConsulta: false,
        liberdadeCriativa: false, notaMaxima: '', materiaId: "", professorId: "", descricaoAdicional: ""
      });
      
      setTimeout(onCreated, 1500); 

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
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-4">
      <h2 className="text-2xl font-bold text-green-500 mb-6 text-center">Cadastrar Nova Atividade</h2>
      
      {message && (
        <div className={`p-3 mb-4 rounded-lg text-center font-medium ${messageClass}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
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
              <option value="Em sala">Em Sala</option>
              <option value="Em casa">Em Casa</option>
              <option value="Em casa">Em Quadra</option>
              <option value="Em casa">Em Laboratório</option>
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

        <div className="flex justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading || loadingDependencies}
            className="flex-1 bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-xl shadow hover:bg-gray-400 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || loadingDependencies}
            className="flex-1 bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Atividade'}
          </button>
        </div>
      </form>
    </div>
  );
}