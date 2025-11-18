'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FaTrashAlt } from 'react-icons/fa';

// Interface Materia (deve coincidir com a que o Manager passa)
interface Materia {
    id: string;
    nome: string;
    escolaId: string;
    atividades: { id: string }[];
}

interface SubjectDetailProps {
    materia: Materia;
    onDone: () => void; // Chamado após Save/Delete
    onCancel: () => void; // Chamado para voltar à lista
}

interface MateriaFormData {
    nome: string;
}

export default function SubjectDetail({ materia, onDone, onCancel }: SubjectDetailProps) {
    const { API_BASE_URL, token, user } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState<MateriaFormData>({
        nome: materia.nome,
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const isAdmin = user?.acesso === 'Administrador';
    
    // Define se o usuário tem permissão para editar/excluir esta matéria específica
    const canEdit = isAdmin || (user?.escolaId === materia.escolaId);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setMessage(null);
    };

    // --- Função de Edição (PUT) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !canEdit) {
            setMessage({ type: 'error', text: 'Permissão negada ou sessão expirada.' });
            return;
        }
        
        setLoading(true);
        setMessage(null);

        try {
            const payload = {
                ...formData,
                // Garantir que o Admin pode alterar a escola se necessário, mas Supervisor/Professor não.
                // O backend (materia.ts) já tem a lógica de filtro de segurança.
                escolaId: isAdmin ? materia.escolaId : user?.escolaId, 
            };

            const response = await fetch(`${API_BASE_URL}/api/materias/${materia.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Falha ao atualizar matéria: ${response.status}`);
            }

            setMessage({ type: 'success', text: 'Matéria atualizada com sucesso!' });
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
        if (!window.confirm(`Tem certeza que deseja excluir a matéria "${materia.nome}"? Esta ação é irreversível e excluirá ${materia.atividades.length} atividades.`)) {
            return;
        }
        if (!token || !canEdit) { 
            setMessage({ type: 'error', text: 'Permissão negada.' });
            return;
        }

        setLoading(true);
        setMessage(null);
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/materias/${materia.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Falha ao excluir matéria: ${response.statusText}`);
            }

            setMessage({ type: 'success', text: 'Matéria excluída com sucesso!' });
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
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700' 
        : '';

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-xl mt-4">
            <h2 className="text-2xl font-bold text-green-600 mb-6 text-center">Editar Matéria: {materia.nome}</h2>
            
            {message && (
                <div className={`p-3 mb-4 rounded-lg text-center font-medium ${messageClass}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">            
                {/* Nome da Matéria */}
                <div>
                    <label htmlFor="nomeMateria" className="block text-sm font-medium text-gray-700 mb-1">
                        Nome da Matéria
                    </label>
                    <input
                        type="text"
                        id="nomeMateria"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        required
                        disabled={loading || !canEdit}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
                    />
                </div>
                
                {/* Informações não editáveis */}
                <div className="pt-2">
                    <p className="text-sm text-gray-600">Atividades associadas: {materia.atividades.length}</p>
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
                        disabled={loading || !canEdit}
                        className={`flex-1 bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow hover:bg-green-600 transition-colors disabled:opacity-50 
                            ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </form>
            
            {/* Botão de Exclusão */}
            <div className="mt-6 border-t pt-4 border-gray-200">
                <button
                    onClick={handleDelete}
                    disabled={loading || !canEdit}
                    className={`w-full bg-red-500 text-white font-semibold py-2 px-4 rounded-xl shadow hover:bg-red-600 transition-colors 
                        ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Excluindo...' : 'Excluir Matéria'}
                </button>
            </div>
        </div>
    );
}
