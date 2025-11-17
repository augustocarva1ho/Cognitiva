'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import StudentCreate from './StudentCreate'; 
import StudentDetail from './StudentDetail';

// --- INTERFACES DE DADOS SINCRONIZADAS ---
interface CondicaoAluno {
    id: string;
    nomeCondicao: string;
    statusComprovacao: string;
    descricaoAdicional: string;
}

// Define a interface completa para o tipo 'Aluno' (que a API /api/alunos retorna)
interface Aluno {
    id: string;
    Nome: string;
    Matricula: string;
    Idade: number;
    turmaId: string; // Adicionado para filtro
    escolaId: string; // Adicionado a FK de escola
    turma: {
        Nome: string;
        id: string;
    };
    // Tornamos condicoes opcional para evitar crash durante a listagem inicial
    condicoes?: CondicaoAluno[]; 
}

type ViewState = 'LIST' | 'CREATE' | 'DETAIL';

export default function StudentManager() {
    // Inclui viewingSchoolId do AuthContext
    const { API_BASE_URL, token, user, viewingSchoolId } = useAuth(); 
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [view, setView] = useState<ViewState>('LIST');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);

    // Função para carregar os alunos da API (COM FILTRO DE ESCOLA)
    const fetchAlunos = useCallback(async () => {
        if (!token) {
            setError('Sessão expirada. Por favor, faça login novamente.');
            setLoading(false);
            return;
        }

        // 1. Determina o ID de filtro
        // Admin usa viewingSchoolId; Supervisor/Professor usa user.escolaId (que é garantido pelo backend/AuthContext)
        const escolaIdParaFiltrar = user?.acesso === 'Administrador' ? viewingSchoolId : user?.escolaId;

        // Se o Admin não selecionou escola, ou se o usuário não tem escola, bloqueia a busca
        if (!escolaIdParaFiltrar) {
             setAlunos([]);
             setLoading(false);
             return; 
        }

        setLoading(true);
        setError(null);
        try {
            // Monta a URL para enviar o ID correto como query parameter
            const url = `${API_BASE_URL}/api/alunos?viewingSchoolId=${escolaIdParaFiltrar}`;
            
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Envia o token para autenticar
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Falha ao carregar a lista de alunos.`);
            }

            const data: Aluno[] = await response.json();
            setAlunos(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao conectar com a API.');
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, token, user?.acesso, user?.escolaId, viewingSchoolId]); // Dependências

    // Carrega a lista de alunos na montagem do componente e quando viewingSchoolId muda
    useEffect(() => {
        fetchAlunos();
    }, [fetchAlunos]);

    // Filtra a lista com base no termo de pesquisa
    const filteredAlunos = alunos.filter(aluno =>
        aluno.Nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aluno.Matricula.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Função para voltar à lista e recarregar os dados
    const handleReturnToList = () => {
        setView('LIST');
        fetchAlunos(); 
        setSelectedAluno(null);
    };

    const handleAlunoClick = (aluno: Aluno) => {
        setSelectedAluno(aluno);
        setView('DETAIL');
    };

    const renderView = () => {
        if (loading) {
            return <p className="text-center text-gray-500 mt-8">A carregar alunos...</p>;
        }
        if (error) {
            return <p className="text-center text-red-500 mt-8">Erro: {error}</p>;
        }
        
        // Mensagem de bloqueio para o Admin sem escola selecionada
        if (user?.acesso === 'Administrador' && !viewingSchoolId) {
             return (
                <div className="text-center p-12 bg-yellow-100 rounded-xl mt-8">
                    <p className="text-xl font-semibold text-yellow-800">
                        Por favor, selecione uma escola no cabeçalho superior para gerenciar os alunos.
                    </p>
                </div>
            );
        }


        switch (view) {
            case 'CREATE':
                // StudentCreate.tsx precisa da escolaId, que será o ID que o Admin está a visualizar
                return <StudentCreate onCreated={handleReturnToList} onCancel={() => setView('LIST')} />;

            case 'DETAIL':
                // StudentDetail.tsx será criado no próximo passo
                return selectedAluno ? (
                    <StudentDetail aluno={selectedAluno} onDone={handleReturnToList} onCancel={() => setView('LIST')} />
                ) : <p className="text-center text-red-500 mt-8">Aluno não selecionado.</p>;

            case 'LIST':
            default:
                return (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <input
                                type="text"
                                placeholder="Pesquisar por nome ou matrícula..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-2/3 px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-300 focus:outline-none"
                            />
                            <button
                                onClick={() => setView('CREATE')}
                                className="bg-green-400 text-white font-semibold py-2 px-4 rounded-xl whitespace-nowrap shadow-md hover:bg-green-600 transition-colors flex items-center"
                            >
                                Novo Aluno
                            </button>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            {filteredAlunos.length === 0 && !searchTerm ? (
                                <p className="p-6 text-center text-gray-500">Nenhum aluno foi cadastrado na escola atual.</p>
                            ) : filteredAlunos.length === 0 && searchTerm ? (
                                <p className="p-6 text-center text-gray-500">Nenhum aluno encontrado para "{searchTerm}".</p>
                            ) : (
                                <ul className="divide-y divide-gray-200">
                                    {filteredAlunos.map((aluno) => (
                                        <li
                                            key={aluno.id}
                                            onClick={() => handleAlunoClick(aluno)}
                                            className="p-4 flex justify-between items-center hover:bg-green-50 cursor-pointer transition-colors"
                                        >
                                            <div>
                                                <p className="text-lg font-medium text-gray-800">{aluno.Nome}</p>
                                                <p className="text-sm text-gray-500">
                                                    Matrícula: {aluno.Matricula} | Turma: {aluno.turma.Nome}
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
                <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Gerenciar Alunos</h1>
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
