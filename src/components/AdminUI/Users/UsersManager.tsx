'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth, Docente } from '@/context/AuthContext'; // Importa o tipo Docente centralizado
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

  // Função para carregar os docentes da API
  const fetchDocentes = useCallback(async () => {
    if (!token) {
      setError('Sessão expirada. Por favor, faça login novamente.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/docentes`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Envia o token para autenticar
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao carregar a lista de docentes.');
      }

      const data: Docente[] = await response.json();
      setDocentes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao conectar com a API.');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  // Carrega a lista de docentes na montagem do componente
  useEffect(() => {
    fetchDocentes();
  }, [fetchDocentes]);

  // Filtra a lista com base no termo de pesquisa
  const filteredDocentes = docentes.filter(docente =>
    docente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    docente.registro.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Função para voltar à lista e recarregar os dados
  const handleReturnToList = () => {
    setView('LIST');
    fetchDocentes(); 
    setSelectedDocente(null);
  };

  const handleDocenteClick = (docente: Docente) => {
    setSelectedDocente(docente);
    setView('DETAIL');
  };

  const renderView = () => {
    if (loading) {
      return <p className="text-center text-gray-500 mt-8">A carregar docentes...</p>;
    }
    if (error) {
      return <p className="text-center text-red-500 mt-8">Erro: {error}</p>;
    }

    switch (view) {
      case 'CREATE':
        return <UsersCreate onCreated={handleReturnToList} onCancel={() => setView('LIST')} />;

      case 'DETAIL':
        return selectedDocente ? (
          <UserDetail docente={selectedDocente} onDone={handleReturnToList} onCancel={() => setView('LIST')} />
        ) : <p className="text-center text-red-500 mt-8">Docente não selecionado.</p>;

      case 'LIST':
      default:
        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <input
                type="text"
                placeholder="Pesquisar por nome ou registro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-2/3 px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-300 focus:outline-none"
              />
              <button
                onClick={() => setView('CREATE')}
                className="bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-green-600 transition-colors flex items-center"
              >
                + Cadastrar Novo Docente
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {filteredDocentes.length === 0 && !searchTerm && (
                <p className="p-6 text-center text-gray-500">Nenhum usuário foi cadastrado ainda.</p>
              )}
              {filteredDocentes.length === 0 && searchTerm && (
                <p className="p-6 text-center text-gray-500">Nenhum docente encontrado para "{searchTerm}".</p>
              )}

              {filteredDocentes.length > 0 && (
                <ul className="divide-y divide-gray-200">
                  {filteredDocentes.map((docente) => (
                    <li
                      key={docente.id}
                      onClick={() => handleDocenteClick(docente)}
                      className="p-4 flex justify-between items-center hover:bg-green-50 cursor-pointer transition-colors"
                    >
                      <div>
                        <p className="text-lg font-medium text-gray-800">{docente.nome}</p>
                        <p className="text-sm text-gray-500">
                          Registro: {docente.registro} | Nível: {docente.acesso.nome}
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
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Gerenciar Docentes</h1>
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