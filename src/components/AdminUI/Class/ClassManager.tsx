'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import ClassCreate from './ClassCreate';
import ClassDetail from './ClassDetail';

// Tipos base
interface Turma {
    id: string;
    Nome: string;
    escolaId: string;
    Alunos: { id: string }[];
}

type ViewState = 'LIST' | 'CREATE' | 'DETAIL';

export default function ClassManager() {
    // Adicionado viewingSchoolId e API_BASE_URL do AuthContext
    const { API_BASE_URL, token, user, viewingSchoolId } = useAuth(); 
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [view, setView] = useState<ViewState>('LIST');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);

    // Função para carregar as turmas da API
    // Agora aceita token e escolaId como argumentos de execução
    const fetchTurmas = useCallback(async (token: string | null, userRole: string, escolaIdParaFiltrar: string | null) => {
        if (!token) {
            setError('Sessão expirada. Por favor, faça login novamente.');
            setLoading(false);
            return;
        }
        
        // Se for Admin e o ID de visualização for nulo, paramos a busca (exibe a mensagem)
        if (userRole === 'Administrador' && !escolaIdParaFiltrar) {
            setTurmas([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Monta a URL para enviar o ID correto como query parameter
            const queryParam = escolaIdParaFiltrar ? `?viewingSchoolId=${escolaIdParaFiltrar}` : '';
            const url = `${API_BASE_URL}/api/turmas${queryParam}`;

            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Envia o token para autenticação
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Falha ao carregar a lista de turmas. Status: ${response.status}`);
            }

            const data: Turma[] = await response.json();
            setTurmas(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao conectar com a API.');
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, token, user?.acesso]); // Dependências do useCallback simplificadas

    // Este useEffect agora trata a mudança de ID e chama a função de busca
    useEffect(() => {
        // 1. Determina qual ID usar para o filtro 
        const escolaIdParaFiltrar = user?.acesso === 'Administrador' ? viewingSchoolId : user?.escolaId;
        
        // 2. Garante que o valor é string ou null (não undefined)
        const finalId = escolaIdParaFiltrar || null;
        
        // CORRIGIDO: Se for Admin, só executa a busca se finalId não for nulo.
        if (token) {
            if (user?.acesso === 'Administrador' && finalId) {
                 fetchTurmas(token, user.acesso, finalId);
            } else if (user?.acesso !== 'Administrador') {
                 // CORRIGIDO: Usa o operador '!' para garantir a tipagem (pois sabemos que o token é válido aqui)
                 fetchTurmas(token, user!.acesso, user!.escolaId);
            } else if (user?.acesso === 'Administrador' && !finalId) {
                 // Admin sem ID, apenas define o estado para mostrar a mensagem sem loop infinito
                 setTurmas([]);
                 setLoading(false);
            }
        } else {
             setLoading(false);
        }

    }, [fetchTurmas, viewingSchoolId, user?.escolaId, user?.acesso, token]); // Dependências corrigidas

    // Filtra a lista com base no termo de pesquisa
    const filteredTurmas = turmas.filter(turma =>
        turma.Nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Função para voltar à lista e recarregar os dados
    const handleReturnToList = () => {
        setView('LIST');
        // Recarrega forçando a execução da busca com os parâmetros atuais
        const escolaIdParaFiltrar = user?.acesso === 'Administrador' ? viewingSchoolId : user?.escolaId;
        // CORRIGIDO: Usa o operador '!' para garantir a tipagem na chamada de retorno
        fetchTurmas(token, user!.acesso, escolaIdParaFiltrar || null); 
        setSelectedTurma(null);
    };

    const handleTurmaClick = (turma: Turma) => {
        setSelectedTurma(turma);
        setView('DETAIL');
    };

    const renderView = () => {
        if (loading) {
            return <p className="text-center text-gray-500 mt-8">A carregar turmas...</p>;
        }
        if (error) {
            return <p className="text-center text-red-500 mt-8">Erro: {error}</p>;
        }

        // Se for Admin e não selecionou uma escola, mostra mensagem
        if (user?.acesso === 'Administrador' && !viewingSchoolId) {
            return (
                <div className="text-center p-12 bg-yellow-100 rounded-xl mt-8">
                    <p className="text-xl font-semibold text-yellow-800">
                        Por favor, selecione uma escola acima para gerenciar as turmas.
                    </p>
                </div>
            );
        }

        switch (view) {
            case 'CREATE':
                return <ClassCreate onCreated={handleReturnToList} onCancel={() => setView('LIST')} />;

            case 'DETAIL':
                return selectedTurma ? (
                    <ClassDetail turma={selectedTurma} onDone={handleReturnToList} onCancel={() => setView('LIST')} />
                ) : <p className="text-center text-red-500 mt-8">Turma não selecionada.</p>;

            case 'LIST':
            default:
                return (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <input
                                type="text"
                                placeholder="Pesquisar por nome da turma..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-2/3 px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-300 focus:outline-none"
                            />
                            <button
                                onClick={() => setView('CREATE')}
                                className="bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-green-600 transition-colors flex items-center"
                            >
                                + Cadastrar Nova Turma
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            {filteredTurmas.length === 0 ? (
                                <p className="p-6 text-center text-gray-500">Nenhuma turma cadastrada na escola atual.</p>
                            ) : (
                                <ul className="divide-y divide-gray-200">
                                    {filteredTurmas.map((turma) => (
                                        <li
                                            key={turma.id}
                                            onClick={() => handleTurmaClick(turma)}
                                            className="p-4 flex justify-between items-center hover:bg-green-50 cursor-pointer transition-colors"
                                        >
                                            <div>
                                                <p className="text-lg font-medium text-gray-800">{turma.Nome}</p>
                                                <p className="text-sm text-gray-500">
                                                    Alunos: {turma.Alunos.length}
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
                <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Gerenciar Turmas</h1>
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
