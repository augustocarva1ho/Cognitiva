'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import SubjectCreate from './SubjectCreate';
import SubjectDetail from './SubjectDetail';

// Tipos base (devem ser definidos no seu projeto)
interface Materia {
    id: string;
    nome: string;
    escolaId: string;
    atividades: { id: string }[];
}

type ViewState = 'LIST' | 'CREATE' | 'DETAIL';

export default function SubjectManager() {
    // Importa o ID de visualização global (viewingSchoolId)
    const { API_BASE_URL, token, user, viewingSchoolId } = useAuth(); 
    
    const [materias, setMaterias] = useState<Materia[]>([]);
    const [view, setView] = useState<ViewState>('LIST');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMateria, setSelectedMateria] = useState<Materia | null>(null);

    const isProfessor = user?.acesso === 'Professor';
    const canCreateOrEdit = user?.acesso === 'Administrador' || user?.acesso === 'Supervisor';
    
    // Função para carregar as matérias da API
    const fetchMaterias = useCallback(async () => {
        if (!token) {
            setError('Sessão expirada. Por favor, faça login novamente.');
            setLoading(false);
            return;
        }

        // Determina qual ID usar para o filtro (visualmente selecionado para Admin, ou padrão para outros)
        const escolaIdParaFiltrar = user?.acesso === 'Administrador' ? viewingSchoolId : user?.escolaId;

        // Se for Admin e o ID de visualização for nulo, paramos a busca (exibe a mensagem)
        if (user?.acesso === 'Administrador' && !escolaIdParaFiltrar) {
            setMaterias([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Monta a URL para enviar o ID correto como query parameter
            const queryParam = escolaIdParaFiltrar ? `?viewingSchoolId=${escolaIdParaFiltrar}` : '';
            const url = `${API_BASE_URL}/api/materias${queryParam}`;

            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Envia o token para autenticar
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Falha ao carregar a lista de matérias. Status: ${response.status}`);
            }

            const data: Materia[] = await response.json();
            setMaterias(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao conectar com a API.');
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, token, user?.acesso, user?.escolaId, viewingSchoolId]);

    // Carrega a lista de matérias na montagem do componente e quando o viewingSchoolId muda
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

        // Se for Admin e não selecionou uma escola, mostra mensagem
        if (user?.acesso === 'Administrador' && !viewingSchoolId) {
            return (
                <div className="text-center p-12 bg-yellow-100 rounded-xl mt-8">
                    <p className="text-xl font-semibold text-yellow-800">
                        Por favor, selecione uma escola acima para gerenciar as matérias.
                    </p>
                </div>
            );
        }

        switch (view) {
            case 'CREATE':
                // O SubjectCreate precisa de saber qual escola usar (viewingSchoolId)
                return <SubjectCreate escolaId={viewingSchoolId || user?.escolaId} onCreated={handleReturnToList} onCancel={() => setView('LIST')} />;

            case 'DETAIL':
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
                                placeholder="Pesquisar por nome da matéria..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-2/3 px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-300 focus:outline-none"
                            />
                            {canCreateOrEdit && (
                                <button
                                    onClick={() => setView('CREATE')}
                                    className="bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-green-600 transition-colors flex items-center"
                                >
                                    + Cadastrar Nova Matéria
                                </button>
                            )}
                        </div>

                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            {filteredMaterias.length === 0 ? (
                                <p className="p-6 text-center text-gray-500">Nenhuma matéria cadastrada na escola atual.</p>
                            ) : (
                                <ul className="divide-y divide-gray-200">
                                    {filteredMaterias.map((materia) => (
                                        <li
                                            key={materia.id}
                                            onClick={() => canCreateOrEdit && handleMateriaClick(materia)}
                                            className={`p-4 flex justify-between items-center hover:bg-green-50 transition-colors ${canCreateOrEdit ? 'cursor-pointer' : ''}`}
                                        >
                                            <div>
                                                <p className="text-lg font-medium text-gray-800">{materia.nome}</p>
                                                <p className="text-sm text-gray-500">
                                                    Atividades cadastradas: {materia.atividades.length}
                                                </p>
                                            </div>
                                            {canCreateOrEdit && <span className="text-green-500 text-sm font-semibold">Detalhes &gt;</span>}
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
