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

interface Professor {
    id: string;
    nome: string;
}

// CORRIGIDO: Atividade completa, incluindo todos os campos para evitar o erro 2739 no ActivityDetail
interface Atividade {
    id: string;
    tipo: string;
    local: string;
    tempoFinalizacao: string; // Adicionado
    dinamica: string;          // Adicionado
    comConsulta: boolean;      // Adicionado
    liberdadeCriativa: boolean; // Adicionado
    descricaoAdicional: string; // Adicionado
    notaMaxima: number;
    escolaId: string;
    materia: Materia;
    professor: Professor;
}

type ViewState = 'LIST' | 'CREATE' | 'DETAIL';

export default function ActivitiesManager() {
    // Inclui viewingSchoolId do AuthContext
    const { API_BASE_URL, token, user, viewingSchoolId } = useAuth(); 
    const [atividades, setAtividades] = useState<Atividade[]>([]);
    const [view, setView] = useState<ViewState>('LIST');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAtividade, setSelectedAtividade] = useState<Atividade | null>(null);

    const isProfessor = user?.acesso === 'Professor';
    const canCreateOrEdit = user?.acesso === 'Administrador' || user?.acesso === 'Supervisor';
    
    // Função para carregar as atividades da API (COM FILTRO DE ESCOLA)
    const fetchAtividades = useCallback(async () => {
        if (!token) {
            setError('Sessão expirada. Por favor, faça login novamente.');
            setLoading(false);
            return;
        }

        // 1. Determina o ID de filtro
        const escolaIdParaFiltrar = user?.acesso === 'Administrador' ? viewingSchoolId : user?.escolaId;

        // Se o Administrador não selecionou escola, bloqueia a busca
        if (user?.acesso === 'Administrador' && !escolaIdParaFiltrar) {
            setAtividades([]);
            setLoading(false);
            return;
        }
        
        // Se não for Admin e não tiver escola, também bloqueia a busca (embora o backend retorne 403)
        if (user?.acesso !== 'Administrador' && !escolaIdParaFiltrar) {
             setAtividades([]);
             setLoading(false);
             return;
        }

        setLoading(true);
        setError(null);
        try {
            // Monta a URL para enviar o ID correto como query parameter
            const url = `${API_BASE_URL}/api/atividades?viewingSchoolId=${escolaIdParaFiltrar}`;

            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Envia o token para autenticar
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Falha ao carregar a lista de atividades.`);
            }

            const data: Atividade[] = await response.json();
            setAtividades(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao conectar com a API.');
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, token, user?.acesso, user?.escolaId, viewingSchoolId]); 

    // Carrega a lista de atividades na montagem do componente e quando viewingSchoolId muda
    useEffect(() => {
        fetchAtividades();
    }, [fetchAtividades]);

    // Filtra a lista com base no termo de pesquisa
    const filteredAtividades = atividades.filter(atividade =>
        atividade.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        atividade.materia.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Função para voltar à lista e recarregar os dados
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

        // Se for Admin e não selecionou uma escola, mostra mensagem
        if (user?.acesso === 'Administrador' && !viewingSchoolId) {
            return (
                <div className="text-center p-12 bg-yellow-100 rounded-xl mt-8">
                    <p className="text-xl font-semibold text-yellow-800">
                        Por favor, selecione uma escola acima para gerenciar as atividades.
                    </p>
                </div>
            );
        }

        switch (view) {
            case 'CREATE':
                
                return <ActivityCreate escolaId={viewingSchoolId || user?.escolaId} onCreated={handleReturnToList} onCancel={() => setView('LIST')} />;

            case 'DETAIL':
                return selectedAtividade ? (
                    // CORRIGIDO: A interface Atividade completa agora é passada corretamente
                    <ActivityDetail atividade={selectedAtividade} onDone={handleReturnToList} onCancel={() => setView('LIST')} />
                ) : <p className="text-center text-red-500 mt-8">Atividade não selecionada.</p>;

            case 'LIST':
            default:
                return (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <input
                                type="text"
                                placeholder="Pesquisar por tipo ou matéria..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-2/3 px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-300 focus:outline-none"
                            />
                            {canCreateOrEdit && (
                                <button
                                    onClick={() => setView('CREATE')}
                                    className="bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-green-600 transition-colors flex items-center"
                                >
                                    + Cadastrar Nova Atividade
                                </button>
                            )}
                        </div>

                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            {filteredAtividades.length === 0 ? (
                                <p className="p-6 text-center text-gray-500">Nenhuma atividade cadastrada na escola atual.</p>
                            ) : (
                                <ul className="divide-y divide-gray-200">
                                    {filteredAtividades.map((atividade) => (
                                        <li
                                            key={atividade.id}
                                            onClick={() => canCreateOrEdit && handleAtividadeClick(atividade)}
                                            className={`p-4 flex justify-between items-center hover:bg-green-50 transition-colors ${canCreateOrEdit ? 'cursor-pointer' : ''}`}
                                        >
                                            <div>
                                                <p className="text-lg font-medium text-gray-800">{atividade.tipo} ({atividade.materia.nome})</p>
                                                <p className="text-sm text-gray-500">
                                                    Professor: {atividade.professor.nome} | Local: {atividade.local}
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
