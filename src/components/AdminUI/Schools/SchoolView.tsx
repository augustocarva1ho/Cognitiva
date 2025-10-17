'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FaSchool } from 'react-icons/fa';

interface Escola {
    id: string;
    nome: string;
    endereco: string;
}

export default function SchoolView() {
    const { API_BASE_URL, token, user } = useAuth();
    const [escola, setEscola] = useState<Escola | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEscola = async () => {
        if (!token || !user) {
            setError('Usuário não autenticado.');
            setLoading(false);
            return;
        }

        try {
            // A rota GET /api/escolas é usada aqui. O backend se encarrega de filtrar
            // e devolver APENAS a escola do usuário logado (ou todas se for Admin, mas
            // esta tela só é visível para Supervisor/Professor que só verão 1 ou 0).
            const response = await fetch(`${API_BASE_URL}/api/escolas`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erro ao carregar os dados da escola.');
            }

            // Esta rota deve retornar um array com 0 ou 1 escola.
            setEscola(result[0] || null);
        } catch (err) {
            const errorText = err instanceof Error ? err.message : 'Erro desconhecido ao carregar a escola.';
            setError(errorText);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEscola();
    }, [token, user]);

    if (loading) {
        return <div className="text-center p-8 text-gray-500">Carregando dados da sua escola...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">Erro: {error}</div>;
    }

    return (
        <div className="w-full max-w-xl mx-auto p-8 bg-white rounded-2xl shadow-xl mt-4 border-t-4 border-green-500">
            <div className="flex items-center space-x-4 mb-6">
                {/* [Icon of a school building] */}
                <h1 className="text-3xl font-bold text-green-600">Minha Escola</h1>
            </div>
            
            {escola ? (
                <div className="space-y-4">
                    <div className="border-b pb-4">
                        <p className="text-xs text-gray-500">Nome da Instituição</p>
                        <p className="text-xl font-semibold text-gray-800">{escola.nome}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Endereço</p>
                        <p className="text-gray-700">{escola.endereco || 'Endereço não cadastrado.'}</p>
                    </div>
                    
                    {/* Informação adicional para o usuário */}
                    <p className="pt-4 text-sm text-blue-600">
                        {user?.acesso}s não têm permissão para editar estas informações.
                    </p>
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500 text-lg bg-gray-50 rounded-lg border border-dashed">
                    Você ainda não está associado a nenhuma escola.
                </div>
            )}
        </div>
    );
}
