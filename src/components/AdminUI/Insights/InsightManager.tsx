'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import InsightGenerate from './InsightGenerate';
import InsightDetail from './InsightDetail';

// Tipos base para o Manager
interface CondicaoAluno {
  id: string;
  nomeCondicao: string;
  statusComprovacao: string;
  descricaoAdicional: string;
}

interface Aluno {
  id: string;
  Nome: string;
  Matricula: string;
  turmaId: string;
  condicao: CondicaoAluno[];
}

interface Turma {
  id: string;
  Nome: string;
}

interface Insight {
  id: string;
  dataGeracao: string;
  textoInsight: string;
  jsonInput: any;
}

type ViewState = 'LIST' | 'GENERATE' | 'DETAIL';

export default function InsightManager() {
  // CORRIGIDO: Incluindo viewingSchoolId e user do AuthContext
  const { API_BASE_URL, token, user, viewingSchoolId } = useAuth();
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [selectedTurmaId, setSelectedTurmaId] = useState('');
  const [selectedAlunoId, setSelectedAlunoId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewState>('LIST');
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);

  const isAdmin = user?.acesso === 'Administrador';

  const fetchDependencies = useCallback(async () => {
    if (!token) return;
    
    // 1. Determina o ID de filtro
    const escolaIdParaFiltrar = isAdmin ? viewingSchoolId : user?.escolaId;

    // Bloqueia a busca se não houver ID válido (Admin sem seleção)
    if (!escolaIdParaFiltrar) {
        setTurmas([]);
        setAlunos([]);
        setLoading(false);
        return;
    }
    
    setLoading(true);
    setError(null);
    
    // Monta a URL de filtro para Turmas e Alunos
    const urlQuery = `?viewingSchoolId=${escolaIdParaFiltrar}`;
    
    try {
      const [turmasRes, alunosRes] = await Promise.all([
        // CORRIGIDO: Adicionando filtro de escola
        fetch(`${API_BASE_URL}/api/turmas${urlQuery}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/alunos${urlQuery}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (turmasRes.ok) setTurmas(await turmasRes.json());
      if (alunosRes.ok) setAlunos(await alunosRes.json());
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError('Falha ao carregar dados iniciais.');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token, user?.escolaId, isAdmin, viewingSchoolId]); // Dependências atualizadas

  const fetchInsights = useCallback(async () => {
    if (!token || !selectedAlunoId) {
        setInsights([]);
        return;
    }
    try {
      const insightsRes = await fetch(`${API_BASE_URL}/api/insights/aluno/${selectedAlunoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (insightsRes.ok) {
        const data = await insightsRes.json();
        setInsights(data);
      }
    } catch (err) {
      console.error('Erro ao buscar insights:', err);
      setError('Falha ao carregar insights do aluno.');
    }
  }, [API_BASE_URL, token, selectedAlunoId]);

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  useEffect(() => {
    if (selectedAlunoId) {
      fetchInsights();
    }
  }, [selectedAlunoId, fetchInsights]);

  const alunosDaTurma = selectedTurmaId
    ? alunos.filter((aluno) => aluno.turmaId === selectedTurmaId)
    : [];

  const handleTurmaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTurmaId(e.target.value);
    setSelectedAlunoId('');
    setInsights([]);
  };

  const handleAlunoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAlunoId(e.target.value);
  };
  
  const handleSavedInsight = () => {
    setView('LIST'); // 1. Volta para a visualização de lista
    fetchInsights(); // 2. Recarrega os insights para incluir o novo
  };

  const renderView = () => {
    if (loading) return <p className="text-center mt-8">A carregar...</p>;
    if (error) return <p className="text-center text-red-500 mt-8">Erro: {error}</p>;

    // Adicionado bloqueio visual para Admin sem escola selecionada
    if (isAdmin && !viewingSchoolId) {
         return (
            <div className="text-center p-12 bg-yellow-100 rounded-xl mt-8">
                <p className="text-xl font-semibold text-yellow-800">
                    Por favor, selecione uma escola no cabeçalho superior para gerar insights.
                </p>
            </div>
        );
    }


    switch (view) {
      case 'GENERATE':
        // Agora o onSaved chama a nova função handleSavedInsight
        return <InsightGenerate alunoId={selectedAlunoId} onSaved={handleSavedInsight} onCancel={() => setView('LIST')} />;
      case 'DETAIL':
        return selectedInsight && <InsightDetail insight={selectedInsight} onCancel={() => setView('LIST')} />;
      case 'LIST':
      default:
        return (
          <>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Histórico de Insights</h3>
                <button
                  onClick={() => setView('GENERATE')}
                  disabled={!selectedAlunoId}
                  className="bg-green-400 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  Gerar Insight
                </button>
            </div>
            {insights.length === 0 ? (
                <p className="text-center text-gray-500">Nenhum insight gerado para este aluno ainda.</p>
            ) : (
                <ul className="bg-white rounded-xl shadow-lg divide-y divide-gray-200">
                  {insights.map((insight) => (
                    <li
                      key={insight.id}
                      onClick={() => {setSelectedInsight(insight); setView('DETAIL');}}
                      className="p-4 flex justify-between items-center hover:bg-green-50 cursor-pointer transition-colors"
                    >
                      <div>
                        <p className="text-lg font-medium text-gray-800">Insight de {new Date(insight.dataGeracao).toLocaleDateString()}</p>
                      </div>
                      <span className="text-green-500 text-sm font-semibold">Ver Detalhes &gt;</span>
                    </li>
                  ))}
                </ul>
            )}
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Gerar Insight da Turma</h1>
        <div className="flex gap-4 mb-8">
          <div>
            <label className="block mb-2 font-bold">Selecione a Turma:</label>
            <select
              value={selectedTurmaId}
              onChange={handleTurmaChange}
              className="border p-2 rounded w-64"
            >
              <option value="">-- Nenhuma --</option>
              {turmas.map((turma) => (
                <option key={turma.id} value={turma.id}>
                  {turma.Nome}
                </option>
              ))}
            </select>
          </div>
          {selectedTurmaId && (
            <div>
              <label className="block mb-2 font-bold">Selecione o Aluno:</label>
              <select
                value={selectedAlunoId}
                onChange={handleAlunoChange}
                className="border p-2 rounded w-64"
                disabled={alunosDaTurma.length === 0}
              >
                <option value="">-- Nenhum --</option>
                {alunosDaTurma.map((aluno) => (
                  <option key={aluno.id} value={aluno.id}>
                    {aluno.Nome}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        {renderView()}
      </div>
    </div>
  );
}