'use client'

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { FaTrashAlt } from "react-icons/fa";

// Interface para o tipo 'Escola'
interface Escola {
    id: string;
    nome: string;
}

// Define a interface para o tipo 'Acesso'
interface Acesso {
    id: string;
    nome: string;
}

// Interface para o Docente (com os dados completos para edição)
interface Docente {
    id: string;
    nome: string;
    email: string;
    registro: string;
    escolaId: string;
    acesso: { nome: string }; // Nível de acesso
}

interface UsersDetailProps {
    docente: Docente;
    onDone: () => void; // Chamado após Save/Delete
    onCancel: () => void; // Chamado para voltar à lista
}

interface DocenteFormData {
    nome: string;
    email: string;
    nivelAcesso: string;
    escolaId: string;
    // Removendo campos não editáveis diretamente (registro, senha, cpf, turmas)
}


export default function UsersDetail({ docente, onDone, onCancel }: UsersDetailProps) {
    const { API_BASE_URL, token, user } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState<DocenteFormData>({
        nome: docente.nome,
        email: docente.email,
        nivelAcesso: docente.acesso.nome,
        escolaId: docente.escolaId,
    });

    const [acessos, setAcessos] = useState<Acesso[]>([]);
    const [escolas, setEscolas] = useState<Escola[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingResources, setLoadingResources] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const isAdmin = user?.acesso === 'Administrador';
    const isSupervisor = user?.acesso === 'Supervisor';
    const canEdit = isAdmin || (isSupervisor && docente.escolaId === user?.escolaId);


    // UseEffect para buscar acessos e escolas
    useEffect(() => {
        const fetchResources = async () => {
            if (!token) return;
            setLoadingResources(true);
            try {
                const [escolasRes, acessosRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/escolas`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_BASE_URL}/api/acessos`, { headers: { Authorization: `Bearer ${token}` } }),
                ]);

                if (escolasRes.ok) {
                    const escolasData: Escola[] = await escolasRes.json();
                    setEscolas(escolasData);
                }
                if (acessosRes.ok) {
                    setAcessos(await acessosRes.json());
                }
            } catch (error) {
                setMessage({ type: 'error', text: 'Não foi possível carregar os recursos do formulário.' });
            } finally {
                setLoadingResources(false);
            }
        };
        fetchResources();
    }, [API_BASE_URL, token]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setMessage(null);
    };
    
    // --- Funções CRUD ---

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
                // Garantir que a escolaId seja enviada, mesmo que não editável
                escolaId: isAdmin ? formData.escolaId : docente.escolaId, 
                // Envia o nome do nível de acesso
                nivelAcesso: formData.nivelAcesso, 
            };

            const response = await fetch(`${API_BASE_URL}/api/docentes/${docente.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro de servidor ao atualizar docente: ${response.status}`);
            }

            setMessage({ type: 'success', text: 'Docente atualizado com sucesso!' });
            setTimeout(onDone, 1500);

        } catch (err) {
            const errorText = err instanceof Error ? err.message : 'Erro desconhecido ao atualizar.';
            setMessage({ type: 'error', text: errorText });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Tem certeza que deseja excluir o docente ${docente.nome}? Esta ação é irreversível.`)) {
            return;
        }
        if (!token || user?.acesso === 'Professor') { // Professores não devem excluir
            setMessage({ type: 'error', text: 'Permissão negada.' });
            return;
        }

        setLoading(true);
        setMessage(null);
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/docentes/${docente.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Falha ao excluir docente: ${response.statusText}`);
            }

            setMessage({ type: 'success', text: 'Docente excluído com sucesso!' });
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
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                <h2 className="text-2xl font-bold text-green-600 mb-6 text-center">Editar Docente: {docente.nome}</h2>
                
                {message && (
                    <div className={`p-3 mb-4 rounded-lg text-center font-medium ${messageClass}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Escola */}
                    <div>
                        <label htmlFor="escolaId" className="block text-sm font-medium text-gray-700 mb-1">
                            Escola
                        </label>
                        <select
                            id="escolaId"
                            name="escolaId"
                            value={formData.escolaId}
                            onChange={handleChange}
                            required
                            disabled={!isAdmin || loadingResources || loading}
                            className={`w-full px-3 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none 
                                ${!isAdmin ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                        >
                            <option value="">
                                {loadingResources ? 'A carregar...' : '-- Selecione a Escola --'}
                            </option>
                            {escolas.map((escola) => (
                                <option key={escola.id} value={escola.id}>
                                    {escola.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Nível de Acesso */}
                    <div>
                        <label htmlFor="nivelAcesso" className="block text-sm font-medium text-gray-700 mb-1">
                            Nível de Acesso
                        </label>
                        <select
                            id="nivelAcesso"
                            name="nivelAcesso"
                            value={formData.nivelAcesso}
                            onChange={handleChange}
                            required
                            disabled={loadingResources || loading || !canEdit}
                            className={`w-full px-3 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none 
                                ${!canEdit ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                        >
                            {acessos.map((acesso) => (
                                <option key={acesso.id} value={acesso.nome}>
                                    {acesso.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Nome */}
                    <div>
                        <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                            Nome do Docente
                        </label>
                        <input
                            type="text" id="nome" name="nome" value={formData.nome} onChange={handleChange} required
                            disabled={loading || !canEdit}
                            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
                        />
                    </div>
                    
                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email" id="email" name="email" value={formData.email} onChange={handleChange} required
                            disabled={loading || !canEdit}
                            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
                        />
                    </div>
                    
                    {/* Matrícula (Registro) - Apenas Visualização */}
                    <div>
                        <label htmlFor="registro" className="block text-sm font-medium text-gray-700 mb-1">
                            Registro (Matrícula)
                        </label>
                        <input
                            type="text" id="registro" name="registro" value={docente.registro} disabled
                            className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-xl shadow-sm focus:outline-none cursor-not-allowed"
                        />
                    </div>
                    
                    <div className="mt-8 flex justify-between gap-4">
                        <button type="button" onClick={onCancel} disabled={loading}
                            className="flex-1 bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-xl shadow-md hover:bg-gray-400 transition-colors">
                            Voltar
                        </button>
                        <button type="submit" disabled={loading || !canEdit}
                            className={`flex-1 bg-green-600 text-white font-semibold py-2 px-6 rounded-xl shadow-md hover:bg-green-700 transition-colors 
                                ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
                
                {/* Botão de Exclusão */}
                <div className="mt-6 border-t pt-4 border-gray-200">
                    <button
                        onClick={handleDelete}
                        disabled={loading || user?.acesso === 'Professor'}
                        className={`w-full bg-red-500 text-white font-semibold py-2 px-4 rounded-xl shadow hover:bg-red-600 transition-colors 
                            ${user?.acesso === 'Professor' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Excluindo...' : 'Excluir Docente'}
                    </button>
                </div>
            </div>
        </div>
    );
}
