'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth, Docente } from '@/context/AuthContext';
import UsersCreate from './UsersCreate';
import UserDetail from './UserDetail';

type ViewState = 'LIST' | 'CREATE' | 'DETAIL';

export default function UsersManager() {
  const { API_BASE_URL, token } = useAuth();
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [view, setView] = useState<ViewState>('LIST');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocente, setSelectedDocente] = useState<Docente | null>(null);

  // --- BUSCA DOCENTES ---
  const fetchDocentes = useCallback(async () => {
    if (!token) {
      setError('Sessão expirada. Por favor faça login novamente.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/docentes`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao carregar lista de docentes.');
      }

      const data: Docente[] = await response.json();
      setDocentes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao conectar com a API.');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  useEffect(() => {
    fetchDocentes();
  }, [fetchDocentes]);


  // --- FILTRO ---
  const filteredDocentes = docentes.filter(docente =>
    docente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    docente.registro.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReturnToList = () => {
    setView('LIST');
    fetchDocentes();
    setSelectedDocente(null);
  };

  const handleDocenteClick = (docente: Docente) => {
    setSelectedDocente(docente);
    setView('DETAIL');
  };

  // ============================
  //  RENDERIZAÇÃO BASEADA NA VIEW
  // ============================
  if (loading) {
    return <div className="text-center p-8 text-gray-500">Carregando docentes...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Erro: {error}</div>;
  }

  if (view === 'CREATE') {
    return <UsersCreate onCreated={handleReturnToList} onCancel={handleReturnToList} />;
  }

  if (view === 'DETAIL') {
    return selectedDocente ? (
      <UserDetail docente={selectedDocente} onDone={handleReturnToList} onCancel={() => setView('LIST')} />
    ) : (
      <div className="text-center p-8 text-gray-500">Nenhum docente selecionado.</div>
    );
  }

  // ============================
  //  LISTAGEM PADRONIZADA
  // ============================
  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-xl mt-4">

      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-600">Gestão de Docentes</h1>
        <button
          onClick={() => setView('CREATE')}
          className="bg-green-400 text-white font-semibold py-2 px-6 rounded-xl shadow-md hover:bg-green-600 transition-colors"
        >
          Novo Docente
        </button>
      </div>

      {/* Pesquisa */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Pesquisar por nome ou registro..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-300 focus:outline-none"
        />
      </div>

      {/* Lista */}
      {filteredDocentes.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-lg">
          {searchTerm
            ? `Nenhum docente encontrado para "${searchTerm}".`
            : "Nenhum docente cadastrado ainda."}
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
                  Registro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acesso
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocentes.map((docente) => (
                <tr
                  key={docente.id}
                  onClick={() => handleDocenteClick(docente)}
                  className="cursor-pointer hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {docente.nome}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {docente.registro}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {docente.acesso?.nome}
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
