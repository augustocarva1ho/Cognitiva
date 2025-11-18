'use client'

import { useState } from "react";
import { useAuth } from "@/context/AuthContext"; // Ajuste o caminho conforme sua estrutura
import { useRouter } from "next/navigation";

// Define os tipos esperados pelo SubjectManager
interface SubjectCreateProps {
    // CORRIGIDO: Aceita o ID da escola para criação
    escolaId: string | null | undefined; 
    onCreated: () => void;
    onCancel: () => void;
}

export default function SubjectCreate({ escolaId, onCreated, onCancel }: SubjectCreateProps) {
    const { API_BASE_URL, token, user } = useAuth();
    const router = useRouter();

    const [nome, setNome] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Determina o ID de escola a ser usado (o que foi passado na prop)
        const finalEscolaId = escolaId;

        if (!token) {
            setMessage({ type: 'error', text: 'Sessão expirada. Faça login novamente.' });
            return;
        }

        if (!finalEscolaId) {
            setMessage({ type: 'error', text: 'ID da escola não definido. Selecione uma escola.' });
            return;
        }
        
        setLoading(true);
        setMessage(null);

        try {
            const payload = {
                nome: nome,
                escolaId: finalEscolaId,
            };

            const response = await fetch(`${API_BASE_URL}/api/materias`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro de servidor ao criar matéria: ${response.status}`);
            }

            setMessage({ type: 'success', text: `Matéria "${nome}" cadastrada com sucesso!` });
            setNome('');
            
            setTimeout(onCreated, 1500);

        } catch (err) {
            const errorText = err instanceof Error ? err.message : 'Erro desconhecido ao cadastrar.';
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
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                <h2 className="text-2xl font-bold text-green-600 mb-6 text-center">Cadastrar Nova Matéria</h2>
                
                {message && (
                    <div className={`p-3 mb-4 rounded-lg text-center font-medium ${messageClass}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Campo Nome da Matéria */}
                    <div>
                        <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                            Nome da Matéria
                        </label>
                        <input
                            type="text" id="nome" name="nome" value={nome} onChange={(e) => setNome(e.target.value)} required
                            disabled={loading}
                            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
                        />
                    </div>

                    <div className="mt-8 flex justify-end gap-4">
                        <button type="button" onClick={onCancel} disabled={loading}
                            className="w-full md:w-auto bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-xl shadow-md hover:bg-gray-400 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading}
                            className="w-full md:w-auto bg-green-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:bg-green-700 transition-colors disabled:opacity-50">
                            {loading ? 'Salvando...' : 'Salvar Matéria'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
