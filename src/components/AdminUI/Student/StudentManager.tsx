'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import StudentCreate from './StudentCreate';
import StudentDetail from './StudentDetail';

// Interfaces
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
  Idade: number;
  turmaId: string;
  escolaId: string;
  turma: {
    Nome: string;
    id: string;
  };
  condicoes?: CondicaoAluno[];
}

type ViewState = 'LIST' | 'CREATE' | 'DETAIL';

export default function StudentManager() {
  const { API_BASE_URL, token, user, viewingSchoolId } = useAuth();

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [view, setView] = useState<ViewState>('LIST');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================
  // BUSCA DA API
  // ============================
  const fetchAlunos = useCallback(async () => {
    if (!token) {
      setError('Sessão expirada. Faça login novamente.');
      setLoading(false);
      return;
    }

    const escolaIdParaFiltrar =
      user?.acesso === 'Administrador' ? viewingSchoolId : user?.escolaId;

    if (!escolaIdParaFiltrar) {
      setAlunos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = `${API_BASE_URL}/api/alunos?viewingSchoolId=${escolaIdParaFiltrar}`;

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao carregar os alunos.');
      }

      const data: Aluno[] = await response.json();
      setAlunos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao conectar com a API.');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token, user?.acesso, user?.escolaId, viewingSchoolId]);

  useEffect(() => {
    fetchAlunos();
  }, [fetchAlunos]);

  // ============================
  // FILTRO
  // ============================
  const filteredAlunos = alunos.filter(a =>
    a.Nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.Matricula.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReturnToList = () => {
    setView('LIST');
    fetchAlunos();
    setSelectedAluno(null);
  };

  const handleAlunoClick = (aluno: Aluno) => {
    setSelectedAluno(aluno);
    setView('DETAIL');
  };

  // ============================
  // VIEWS PADRONIZADAS
  // ============================
  if (loading) {
    return <div className="text-center p-8 text-gray-500">Carregando alunos...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Erro: {error}</div>;
  }

  // Admin sem escola selecionada
  if (user?.acesso === 'Administrador' && !viewingSchoolId) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-xl mt-4">
        <div className="text-center py-16">
          <p className="text-xl font-bold text-gray-600">
            Selecione uma escola no topo para visualizar os alunos.
          </p>
        </div>
      </div>
    );
  }

  if (view === 'CREATE') {
    return <StudentCreate onCreated={handleReturnToList} onCancel={handleReturnToList} />;
  }

  if (view === 'DETAIL') {
    return selectedAluno ? (
      <StudentDetail aluno={selectedAluno} onDone={handleReturnToList} onCancel={() => setView('LIST')} />
    ) : (
      <div className="text-center p-8 text-gray-500">Nenhum aluno selecionado.</div>
    );
  }

  // ============================
  // LISTA PADRÃO (MODELO ESCOLAS)
  // ============================
  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-xl mt-4">

      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-600">Gestão de Alunos</h1>

        <button
          onClick={() => setView('CREATE')}
          className="bg-green-400 text-white font-semibold py-2 px-6 rounded-xl shadow-md hover:bg-green-600 transition-colors"
        >
          Novo Aluno
        </button>
      </div>

      {/* Pesquisa */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Pesquisar por nome ou matrícula..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-300 focus:outline-none"
        />
      </div>

      {/* Lista / Tabela */}
      {filteredAlunos.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-lg">
          {searchTerm
            ? `Nenhum aluno encontrado para "${searchTerm}".`
            : 'Nenhum aluno cadastrado nesta escola.'}
        </div>
      ) : (
        <div className="overflow-hidden overflow-y-auto max-h-96 shadow-lg border border-gray-200 rounded-xl">
          <table className="min-w-full divide-y divide-gray-200">

            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matrícula
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Turma
                </th>

                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAlunos.map((aluno) => (
                <tr
                  key={aluno.id}
                  onClick={() => handleAlunoClick(aluno)}
                  className="cursor-pointer hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {aluno.Nome}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {aluno.Matricula}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {aluno.turma.Nome}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <span className="text-green-500 hover:text-green-700">
                      Ver Detalhes
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
}
