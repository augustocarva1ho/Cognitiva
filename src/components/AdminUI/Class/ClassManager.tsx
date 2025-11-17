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
    const { API_BASE_URL, token, user, viewingSchoolId } = useAuth(); 

    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [view, setView] = useState<ViewState>('LIST');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);

    const fetchTurmas = useCallback(async (token: string | null, userRole: string, escolaIdParaFiltrar: string | null) => {
        if (!token) {
            setError('Sessão expirada. Por favor, faça login novamente.');
            setLoading(false);
            return;
        }

        if (userRole === 'Administrador' && !escolaIdParaFiltrar) {
            setTurmas([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const queryParam = escolaIdParaFiltrar ? `?viewingSchoolId=${escolaIdParaFiltrar}` : '';
            const url = `${API_BASE_URL}/api/turmas${queryParam}`;

            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Falha ao carregar turmas.`);
            }

            const data: Turma[] = await response.json();
            setTurmas(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao conectar com a API.');
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]);

    // Carrega turmas ao iniciar ou mudar escola
    useEffect(() => {
        const escolaIdParaFiltrar =
            user?.acesso === 'Administrador' ? viewingSchoolId : user?.escolaId;

        const finalId = escolaIdParaFiltrar || null;

        if (token) {
            if (user?.acesso === 'Administrador' && finalId) {
                fetchTurmas(token, user.acesso, finalId);
            } else if (user?.acesso !== 'Administrador') {
                fetchTurmas(token, user!.acesso, user!.escolaId);
            } else if (user?.acesso === 'Administrador' && !finalId) {
                setTurmas([]);
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, [fetchTurmas, viewingSchoolId, user?.escolaId, user?.acesso, token]);

    const filteredTurmas = turmas.filter(t =>
        t.Nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleReturnToList = () => {
        setView('LIST');
        const escolaIdParaFiltrar =
            user?.acesso === 'Administrador' ? viewingSchoolId : user?.escolaId;

        fetchTurmas(token, user!.acesso, escolaIdParaFiltrar || null);
        setSelectedTurma(null);
    };

    const handleTurmaClick = (turma: Turma) => {
        setSelectedTurma(turma);
        setView('DETAIL');
    };

    // -----------------------
    // RENDERIZAÇÃO CONDICIONAL NO MODELO PADRÃO
    // -----------------------

    if (loading) {
        return <div className="text-center p-8 text-gray-500">Carregando turmas...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">Erro: {error}</div>;
    }

    if (user?.acesso === 'Administrador' && !viewingSchoolId) {
        return (
            <div className="text-center p-12 text-yellow-700 bg-yellow-100 rounded-xl mt-4">
                Selecione uma escola para visualizar as turmas.
            </div>
        );
    }

    // CREATE
    if (view === 'CREATE') {
        return <ClassCreate onCreated={handleReturnToList} onCancel={handleReturnToList} />;
    }

    // DETAIL
    if (view === 'DETAIL') {
        return selectedTurma ? (
            <ClassDetail turma={selectedTurma} onDone={handleReturnToList} onCancel={() => setView('LIST')} />
        ) : (
            <div className="text-center p-8 text-gray-500">Nenhuma turma selecionada.</div>
        );
    }

    // -----------------------
    // LIST — modelo de referência
    // -----------------------

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-xl mt-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-600">Gestão de Turmas</h1>

                <button
                    onClick={() => setView('CREATE')}
                    className="bg-green-400 text-white font-semibold py-2 px-6 rounded-xl shadow-md hover:bg-green-600 transition-colors"
                >
                    Nova Turma
                </button>
            </div>

            {/* Barra de pesquisa */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Pesquisar por nome da turma..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-300 focus:outline-none"
                />
            </div>

            {/* Lista */}
            {filteredTurmas.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-lg">
                    {searchTerm
                        ? `Nenhuma turma encontrada para "${searchTerm}".`
                        : "Nenhuma turma cadastrada ainda."}
                </div>
            ) : (
                <div className="overflow-hidden overflow-y-auto max-h-96 shadow-lg border border-gray-200 rounded-xl">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Turma
                                </th>

                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Alunos
                                </th>

                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredTurmas.map((turma) => (
                                <tr
                                    key={turma.id}
                                    onClick={() => handleTurmaClick(turma)}
                                    className="cursor-pointer hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {turma.Nome}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {turma.Alunos.length} alunos
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
