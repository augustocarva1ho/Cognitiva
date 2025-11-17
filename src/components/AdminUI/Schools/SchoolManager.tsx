'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import SchoolCreate from './SchoolCreate';
import SchoolDetail from './SchoolDetail'; // Importa o componente de detalhes

// Interface da Escola (deve coincidir com a que o backend retorna)
interface Escola {
    id: string;
    nome: string;
    endereco: string | null;
}

type ViewState = 'LIST' | 'CREATE' | 'DETAIL';

export default function SchoolManager() {
    const { API_BASE_URL, token, user } = useAuth();
    const [escolas, setEscolas] = useState<Escola[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<ViewState>('LIST');
    const [selectedEscola, setSelectedEscola] = useState<Escola | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchEscolas = async () => {
        if (!token) {
            setError('Token de autenticação não encontrado.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/escolas`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const result = await response.json();

            if (!response.ok) {
                // Se o acesso for negado (403), não exibe erro no console, mas exibe a mensagem
                if (response.status === 403) {
                     throw new Error("Você não tem permissão para listar todas as escolas.");
                }
                throw new Error(result.error || `Erro ao carregar escolas: Status ${response.status}`);
            }

            setEscolas(result);
        } catch (err) {
            const errorText = err instanceof Error ? err.message : 'Erro desconhecido ao carregar escolas.';
            setError(errorText);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Esta tela só deve ser acessível por Administradores, mas a chamada
        // fetchEscolas já tem a lógica de restrição
        if (user?.acesso === 'Administrador' || user?.acesso === 'Supervisor') {
            fetchEscolas();
        } else {
             setLoading(false); // Finaliza o loading para permitir o erro
        }
    }, [token, user?.acesso]);

    const handleReturnToList = () => {
        setView('LIST');
        fetchEscolas(); 
        setSelectedEscola(null);
    };

    const handleEscolaClick = (escola: Escola) => {
        setSelectedEscola(escola);
        setView('DETAIL');
    };

    const filteredEscolas = escolas.filter(escola =>
        escola.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- Renderização Condicional da Vista ---

    if (user?.acesso !== 'Administrador') {
         return <div className="text-center p-8 text-red-500">Acesso negado. Apenas Administradores gerenciam escolas.</div>;
    }

    if (loading) {
        return <div className="text-center p-8 text-gray-500">Carregando escolas...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">Erro: {error}</div>;
    }
    
    // Mostra o formulário de criação
    if (view === 'CREATE') {
        return <SchoolCreate onCreated={handleReturnToList} onCancel={handleReturnToList} />;
    }

    // Mostra os detalhes/edição
    if (view === 'DETAIL') {
        return selectedEscola ? (
            <SchoolDetail escola={selectedEscola} onDone={handleReturnToList} onCancel={() => setView('LIST')} />
        ) : <div className="text-center p-8 text-gray-500">Nenhuma escola selecionada.</div>;
    }


    // Vista de LISTA
    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-xl mt-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-600">Gestão de Escolas</h1>
                <button
                    onClick={() => setView('CREATE')}
                    className="bg-green-400 text-white font-semibold py-2 px-6 rounded-xl shadow-md hover:bg-green-600 transition-colors"
                >
                    Nova Escola
                </button>
            </div>
            
            <div className="mb-6">
                 <input
                    type="text"
                    placeholder="Pesquisar por nome da escola..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-300 focus:outline-none"
                />
            </div>
            
            {filteredEscolas.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-lg">
                    {searchTerm ? `Nenhuma escola encontrada para "${searchTerm}".` : "Nenhuma escola cadastrada ainda."}
                </div>
            ) : (
                <div className="overflow-hidden overflow-y-auto max-h-96 shadow-lg border border-gray-200 rounded-xl">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nome
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Endereço
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredEscolas.map((escola) => (
                                <tr key={escola.id} onClick={() => handleEscolaClick(escola)} className="cursor-pointer hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {escola.nome}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {escola.endereco || 'Não informado'}
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
