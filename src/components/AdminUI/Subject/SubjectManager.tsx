'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import SubjectCreate from './SubjectCreate'; 
import SubjectDetail from './SubjectDetail'; // Este será o próximo componente a ser criado

// Define a interface para o tipo 'Materia'
interface Materia {
  id: string;
  nome: string;
}

type ViewState = 'LIST' | 'CREATE' | 'DETAIL';

export default function SubjectManager() {
  const { API_BASE_URL, token } = useAuth();
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [view, setView] = useState<ViewState>('LIST');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMateria, setSelectedMateria] = useState<Materia | null>(null);

  // Função para carregar as matérias da API
  const fetchMaterias = useCallback(async () => {
    if (!token) {
      setError('Sessão expirada. Por favor, faça login novamente.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/materias`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Envia o token para autenticar
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao carregar a lista de matérias.');
      }

      const data: Materia[] = await response.json();
      setMaterias(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao conectar com a API.');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  // Carrega a lista de matérias na montagem do componente
  useEffect(() => {
    fetchMaterias();
  }, [fetchMaterias]);

  // Filtra a lista com base no termo de pesquisa
  const filteredMaterias = materias.filter(materia =>
    materia.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Função para voltar à lista e recarregar os dados
  const handleReturnToList = () => {
    setView('LIST');
    fetchMaterias(); 
    setSelectedMateria(null);
  };

  const handleMateriaClick = (materia: Materia) => {
    setSelectedMateria(materia);
    setView('DETAIL');
  };

  const renderView = () => {
    if (loading) {
      return <p className="text-center text-gray-500 mt-8">A carregar matérias...</p>;
    }
    if (error) {
      return <p className="text-center text-red-500 mt-8">Erro: {error}</p>;
    }

    switch (view) {
      case 'CREATE':
        return <SubjectCreate onCreated={handleReturnToList} onCancel={() => setView('LIST')} />;

      case 'DETAIL':
        // SubjectDetail.tsx será criado no próximo passo
        return selectedMateria ? (
          <SubjectDetail materia={selectedMateria} onDone={handleReturnToList} onCancel={() => setView('LIST')} />
        ) : <p className="text-center text-red-500 mt-8">Matéria não selecionada.</p>;

      case 'LIST':
      default:
        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <input
                type="text"
                placeholder="Pesquisar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-2/3 px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-300 focus:outline-none"
              />
              <button
                onClick={() => setView('CREATE')}
                className="bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-green-600 transition-colors flex items-center"
              >
                + Cadastrar Nova Matéria
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {filteredMaterias.length === 0 && !searchTerm && (
                <p className="p-6 text-center text-gray-500">Nenhuma matéria foi cadastrada ainda.</p>
              )}
              {filteredMaterias.length === 0 && searchTerm && (
                <p className="p-6 text-center text-gray-500">Nenhuma matéria encontrada para "{searchTerm}".</p>
              )}

              {filteredMaterias.length > 0 && (
                <ul className="divide-y divide-gray-200">
                  {filteredMaterias.map((materia) => (
                    <li
                      key={materia.id}
                      onClick={() => handleMateriaClick(materia)}
                      className="p-4 flex justify-between items-center hover:bg-green-50 cursor-pointer transition-colors"
                    >
                      <div>
                        <p className="text-lg font-medium text-gray-800">{materia.nome}</p>
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
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Gerenciar Matérias</h1>
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