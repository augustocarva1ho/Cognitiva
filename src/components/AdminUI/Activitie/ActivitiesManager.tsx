'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import ActivityCreate from './ActivitiesCreate';
import ActivityDetail from './ActivitiesDetail';

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
}

type ViewState = 'LIST' | 'CREATE' | 'DETAIL';

export default function ActivitiesManager() {
  const { API_BASE_URL, token } = useAuth();
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [view, setView] = useState<ViewState>('LIST');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMateria, setSelectedMateria] = useState<string>('');
  const [selectedProfessor, setSelectedProfessor] = useState<string>('');
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [professores, setProfessores] = useState<Docente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAtividade, setSelectedAtividade] = useState<Atividade | null>(null);

  // Função para carregar as atividades da API
  const fetchAtividades = useCallback(async () => {
    if (!token) {
      setError('Sessão expirada. Por favor, faça login novamente.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/atividades`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar a lista de atividades.');
      }

      const data: Atividade[] = await response.json();
      setAtividades(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao conectar com a API.');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  // Função para carregar matérias e professores
  const fetchFilters = useCallback(async () => {
    if (!token) return;
    try {
      const materiasRes = await fetch(`${API_BASE_URL}/api/materias`, { headers: { 'Authorization': `Bearer ${token}` } });
      const professoresRes = await fetch(`${API_BASE_URL}/api/docentes`, { headers: { 'Authorization': `Bearer ${token}` } });

      if (materiasRes.ok) setMaterias(await materiasRes.json());
      if (professoresRes.ok) setProfessores(await professoresRes.json());
    } catch (error) {
      console.error("Falha ao carregar filtros:", error);
    }
  }, [API_BASE_URL, token]);

  // Carrega dados na montagem
  useEffect(() => {
    fetchAtividades();
    fetchFilters();
  }, [fetchAtividades, fetchFilters]);

  // Lógica de filtragem
  const filteredAtividades = atividades.filter(atividade => {
    const matchesSearch = atividade.tipo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMateria = selectedMateria ? atividade.materia.id === selectedMateria : true;
    const matchesProfessor = selectedProfessor ? atividade.professor.id === selectedProfessor : true;
    return matchesSearch && matchesMateria && matchesProfessor;
  });

  const handleReturnToList = () => {
    setView('LIST');
    fetchAtividades();
    setSelectedAtividade(null);
  };

  const handleAtividadeClick = (atividade: Atividade) => {
    setSelectedAtividade(atividade);
    setView('DETAIL');
  };

  const renderView = () => {
    if (loading) {
      return <p className="text-center text-gray-500 mt-8">A carregar atividades...</p>;
    }
    if (error) {
      return <p className="text-center text-red-500 mt-8">Erro: {error}</p>;
    }

    switch (view) {
      case 'CREATE':
        return <ActivityCreate onCreated={handleReturnToList} onCancel={() => setView('LIST')} />;
      case 'DETAIL':
        return selectedAtividade ? (
          <ActivityDetail atividade={selectedAtividade} onDone={handleReturnToList} onCancel={() => setView('LIST')} />
        ) : <p className="text-center text-red-500 mt-8">Atividade não selecionada.</p>;
      case 'LIST':
      default:
        return (
          <>
            <div className="flex flex-col md:flex-row md:justify-between items-center mb-6 gap-4">
              <input
                type="text"
                placeholder="Pesquisar por tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-300 focus:outline-none"
              />
              <select
                value={selectedMateria}
                onChange={(e) => setSelectedMateria(e.target.value)}
                className="w-full md:w-1/4 px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-300 focus:outline-none"
              >
                <option value="">Filtrar por Matéria</option>
                {materias.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
              </select>
              <select
                value={selectedProfessor}
                onChange={(e) => setSelectedProfessor(e.target.value)}
                className="w-full md:w-1/4 px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-300 focus:outline-none"
              >
                <option value="">Filtrar por Professor</option>
                {professores.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
              <button
                onClick={() => setView('CREATE')}
                className="w-full md:w-auto bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-green-600 transition-colors"
              >
                + Nova Atividade
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {filteredAtividades.length === 0 && (
                <p className="p-6 text-center text-gray-500">Nenhuma atividade encontrada.</p>
              )}
              {filteredAtividades.length > 0 && (
                <ul className="divide-y divide-gray-200">
                  {filteredAtividades.map((atividade) => (
                    <li
                      key={atividade.id}
                      onClick={() => handleAtividadeClick(atividade)}
                      className="p-4 flex justify-between items-center hover:bg-green-50 cursor-pointer transition-colors"
                    >
                      <div>
                        <p className="text-lg font-medium text-gray-800">{atividade.tipo}</p>
                        <p className="text-sm text-gray-500">
                          Matéria: {atividade.materia.nome} | Professor: {atividade.professor.nome}
                        </p>
                      </div>
                      <span className="text-green-500 text-sm font-semibold">Detalhes &gt;</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Gerenciar Atividades</h1>
        {view !== 'LIST' && (
          <button
            onClick={() => handleReturnToList()}
            className="mb-4 text-green-500 hover:underline flex items-center"
          >
            &lt; Voltar para a Lista
          </button>
        )}
        {renderView()}
      </div>
    </div>
  );
}