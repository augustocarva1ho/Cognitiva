'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import SubjectCreate from './SubjectCreate';
import SubjectDetail from './SubjectDetail';

interface Materia {
    id: string;
    nome: string;
    escolaId: string;
    atividades: { id: string }[];
}

type ViewState = 'LIST' | 'CREATE' | 'DETAIL';

export default function SubjectManager() {
    const { API_BASE_URL, token, user, viewingSchoolId } = useAuth();

    const [materias, setMaterias] = useState<Materia[]>([]);
    const [view, setView] = useState<ViewState>('LIST');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMateria, setSelectedMateria] = useState<Materia | null>(null);

    const isProfessor = user?.acesso === 'Professor';
    const canCreateOrEdit = user?.acesso === 'Administrador' || user?.acesso === 'Supervisor';

    const escolaIdParaFiltrar =
        user?.acesso === 'Administrador' ? viewingSchoolId : user?.escolaId;

    const fetchMaterias = useCallback(async () => {
        if (!token) {
            setError('Sessão expirada. Por favor, faça login novamente.');
            setLoading(false);
            return;
        }

        if (user?.acesso === 'Administrador' && !escolaIdParaFiltrar) {
            setMaterias([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const queryParam = escolaIdParaFiltrar ? `?viewingSchoolId=${escolaIdParaFiltrar}` : '';
            const response = await fetch(`${API_BASE_URL}/api/materias${queryParam}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao carregar matérias.');
            }

            const data: Materia[] = await response.json();
            setMaterias(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao conectar com a API.');
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, token, user?.acesso, user?.escolaId, viewingSchoolId]);

    useEffect(() => {
        fetchMaterias();
    }, [fetchMaterias]);

    const filteredMaterias = materias.filter(m =>
        m.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleReturnToList = () => {
        setView('LIST');
        fetchMaterias();
        setSelectedMateria(null);
    };

    const handleMateriaClick = (materia: Materia) => {
        if (!canCreateOrEdit) return;
        setSelectedMateria(materia);
        setView('DETAIL');
    };

    // ----------------------------------------
    // Renderização Condicional (modelo referência)
    // ----------------------------------------

    if (user?.acesso === 'Administrador' && !viewingSchoolId) {
        return (
            <div className="text-center p-8 text-yellow-700 bg-yellow-100 rounded-xl mt-8">
                Selecione uma escola para visualizar as matérias.
            </div>
        );
    }

    if (loading) {
        return <div className="text-center p-8 text-gray-500">Carregando matérias...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">Erro: {error}</div>;
    }

    if (view === 'CREATE') {
        return (
            <SubjectCreate
                escolaId={viewingSchoolId || user?.escolaId}
                onCreated={handleReturnToList}
                onCancel={handleReturnToList}
            />
        );
    }

    if (view === 'DETAIL') {
        return selectedMateria ? (
            <SubjectDetail
                materia={selectedMateria}
                onDone={handleReturnToList}
                onCancel={() => setView('LIST')}
            />
        ) : (
            <div className="text-center p-8 text-gray-500">Nenhuma matéria selecionada.</div>
        );
    }

    // ----------------------------------------
    // LIST VIEW (modelo referência)
    // ----------------------------------------

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-xl mt-4">

            {/* Cabeçalho */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-600">Gestão de Matérias</h1>

                {canCreateOrEdit && (
                    <button
                        onClick={() => setView('CREATE')}
                        className="bg-green-400 text-white font-semibold py-2 px-6 rounded-xl shadow-md hover:bg-green-600 transition-colors"
                    >
                        Nova Matéria
                    </button>
                )}
            </div>

            {/* Pesquisa */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Pesquisar por nome da matéria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-300 focus:outline-none"
                />
            </div>

            {/* Lista */}
            {filteredMaterias.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-lg">
                    {searchTerm
                        ? `Nenhuma matéria encontrada para "${searchTerm}".`
                        : "Nenhuma matéria cadastrada ainda."}
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
                                    Atividades
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredMaterias.map((materia) => (
                                <tr
                                    key={materia.id}
                                    onClick={() => handleMateriaClick(materia)}
                                    className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                                        !canCreateOrEdit ? 'cursor-default' : ''
                                    }`}
                                >
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        {materia.nome}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {materia.atividades.length}
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-medium">
                                        {canCreateOrEdit && (
                                            <span className="text-green-500 hover:text-green-700">
                                                Ver Detalhes
                                            </span>
                                        )}
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
