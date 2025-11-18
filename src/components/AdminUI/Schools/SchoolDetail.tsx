'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Escola {
    id: string;
    nome: string;
    endereco: string | null;
}

interface SchoolDetailProps {
    escola: Escola;
    onDone: () => void; // Chamado após Save/Delete
    onCancel: () => void; // Chamado para voltar à lista
}

export default function SchoolDetail({ escola, onDone, onCancel }: SchoolDetailProps) {
    const { API_BASE_URL, token, user } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        nome: escola.nome,
        endereco: escola.endereco || '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Redireciona se o usuário não for Admin (apenas por segurança extra, o Manager já filtra)
    useEffect(() => {
        if (user?.acesso !== 'Administrador') {
            router.push('/unauthorized'); // Rota de erro de permissão
        }
    }, [user, router]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setMessage(null);
    };

    // --- Função de Edição (PUT) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || user?.acesso !== 'Administrador') {
            setMessage({ type: 'error', text: 'Permissão negada ou sessão expirada.' });
            return;
        }
        
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/escolas/${escola.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `Falha ao atualizar escola: ${response.statusText}`);
            }

            setMessage({ type: 'success', text: 'Escola atualizada com sucesso!' });
            setTimeout(onDone, 1500); 

        } catch (err) {
            const errorText = err instanceof Error ? err.message : 'Erro desconhecido ao atualizar.';
            setMessage({ type: 'error', text: errorText });
        } finally {
            setLoading(false);
        }
    };

    // --- Função de Exclusão (DELETE) ---
    const handleDelete = async () => {
        if (!window.confirm(`Tem certeza que deseja excluir a escola "${escola.nome}"? Esta ação é irreversível e pode afetar docentes e alunos.`)) {
            return;
        }
        if (!token || user?.acesso !== 'Administrador') {
            setMessage({ type: 'error', text: 'Permissão negada ou sessão expirada.' });
            return;
        }

        setLoading(true);
        setMessage(null);
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/escolas/${escola.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Falha ao excluir escola: ${response.statusText}`);
            }

            setMessage({ type: 'success', text: 'Escola excluída com sucesso!' });
            setTimeout(onDone, 1500); 

        } catch (err) {
            const errorText = err instanceof Error ? err.message : 'Erro desconhecido ao excluir.';
            setMessage({ type: 'error', text: errorText });
        } finally {
            setLoading(false);
        }
    };

    const messageClass = message 
        ? message.type === 'success' 
            ? 'bg-green-100 border-green-400 text-green-700'
            : 'bg-red-100 border-red-400 text-red-700'
        : '';

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-xl mt-4">
            <h2 className="text-2xl font-bold text-green-600 mb-6 text-center">Editar Escola: {escola.nome}</h2>
            
            {message && (
                <div className={`p-3 mb-4 rounded-lg text-center font-medium ${messageClass}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="nomeEscola" className="block text-sm font-medium text-gray-700 mb-1">
                        Nome da Escola
                    </label>
                    <input
                        type="text"
                        id="nomeEscola"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        required
                        disabled={loading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
                    />
                </div>
                <div>
                    <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-1">
                        Endereço
                    </label>
                    <input
                        type="text"
                        id="endereco"
                        name="endereco"
                        value={formData.endereco}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
                    />
                </div>

                <div className="flex justify-between gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-xl shadow hover:bg-gray-400 transition-colors"
                    >
                        Voltar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </form>
            
            <div className="mt-6 border-t pt-4 border-gray-200">
                <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="w-full bg-red-500 text-white font-semibold py-2 px-4 rounded-xl shadow hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                    {loading ? 'Excluindo...' : 'Excluir Escola'}
                </button>
            </div>
        </div>
    );
}
