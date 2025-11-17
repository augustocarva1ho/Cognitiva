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

interface Atividade {
    id: string;
    tipo: string;
    local: string;
    tempoFinalizacao: string;
    dinamica: string;
    comConsulta: boolean;
    liberdadeCriativa: boolean;
    descricaoAdicional: string;
    notaMaxima: number;
    escolaId: string;
    materia: Materia;
    professor: Professor;
}

type ViewState = 'LIST' | 'CREATE' | 'DETAIL';

export default function ActivitiesManager() {
    const { API_BASE_URL, token, user, viewingSchoolId } = useAuth();

    const [atividades, setAtividades] = useState<Atividade[]>([]);
    const [view, setView] = useState<ViewState>('LIST');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAtividade, setSelectedAtividade] = useState<Atividade | null>(null);

    const canCreateOrEdit = user?.acesso === 'Administrador' || user?.acesso === 'Supervisor';

    const fetchAtividades = useCallback(async () => {
        if (!token) {
            setError('Sessão expirada. Faça login novamente.');
            setLoading(false);
            return;
        }

        const escolaIdParaFiltrar =
            user?.acesso === 'Administrador' ? viewingSchoolId : user?.escolaId;

        if (!escolaIdParaFiltrar) {
            setAtividades([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/atividades?viewingSchoolId=${escolaIdParaFiltrar}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao carregar atividades.');
            }

            const data: Atividade[] = await response.json();
            setAtividades(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao conectar com a API.');
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, token, user?.acesso, user?.escolaId, viewingSchoolId]);

    useEffect(() => {
        fetchAtividades();
    }, [fetchAtividades]);

    const filteredAtividades = atividades.filter((atividade) =>
        `${atividade.tipo} ${atividade.materia.nome}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    const handleReturnToList = () => {
        setView('LIST');
        fetchAtividades();
        setSelectedAtividade(null);
    };

    const handleAtividadeClick = (atividade: Atividade) => {
        setSelectedAtividade(atividade);
        setView('DETAIL');
    };

    // ------------------ RENDER PRINCIPAL ------------------ //

    if (loading) {
        return <div className="text-center p-8 text-gray-500">Carregando atividades...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">Erro: {error}</div>;
    }

    // Bloqueio para Administrador sem escola selecionada
    if (user?.acesso === 'Administrador' && !viewingSchoolId) {
        return (
            <div className="text-center p-12 bg-yellow-100 rounded-xl mt-8">
                <p className="text-xl font-semibold text-yellow-800">
                    Por favor, selecione uma escola acima para gerenciar as atividades.
                </p>
            </div>
        );
    }

    // --- CREATE ---
    if (view === 'CREATE') {
        return (
            <ActivityCreate
                escolaId={viewingSchoolId || user?.escolaId}
                onCreated={handleReturnToList}
                onCancel={handleReturnToList}
            />
        );
    }

    // --- DETAIL ---
    if (view === 'DETAIL') {
        return selectedAtividade ? (
            <ActivityDetail
                atividade={selectedAtividade}
                onDone={handleReturnToList}
                onCancel={() => setView('LIST')}
            />
        ) : (
            <div className="text-center p-8 text-gray-500">Atividade não encontrada.</div>
        );
    }

    // ------------------ LIST VIEW ------------------ //

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-xl mt-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-600">Gestão de Atividades</h1>

                {canCreateOrEdit && (
                    <button
                        onClick={() => setView('CREATE')}
                        className="bg-green-400 text-white font-semibold py-2 px-6 rounded-xl shadow-md hover:bg-green-600 transition-colors"
                    >
                        Nova Atividade
                    </button>
                )}
            </div>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Pesquisar por tipo ou matéria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-300 focus:outline-none"
                />
            </div>

            {filteredAtividades.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-lg">
                    {searchTerm
                        ? `Nenhuma atividade encontrada para "${searchTerm}".`
                        : 'Nenhuma atividade cadastrada.'}
                </div>
            ) : (
                <div className="overflow-hidden overflow-y-auto max-h-96 shadow-lg border border-gray-200 rounded-xl">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tipo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Matéria
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Professor
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAtividades.map((atividade) => (
                                <tr
                                    key={atividade.id}
                                    onClick={() => canCreateOrEdit && handleAtividadeClick(atividade)}
                                    className={`cursor-pointer hover:bg-gray-50`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {atividade.tipo}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {atividade.materia.nome}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {atividade.professor.nome}
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
