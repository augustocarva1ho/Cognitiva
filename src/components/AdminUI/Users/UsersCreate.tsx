'use client'

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { FaPlus, FaTrashAlt } from "react-icons/fa";

// Interface para o tipo 'Escola'
interface Escola {
    id: string;
    nome: string;
}

// Define a interface para o tipo 'Acesso' que vamos buscar da API
interface Acesso {
    id: string;
    nome: string;
}

// Define os tipos para o formulário
interface FormData {
    registro: string; // Campo obrigatório
    nome: string;
    email: string;
    cpf: string; // Mantido, mas não mais exibido no JSX
    senha: string;
    materia: string; // Mantido, mas não mais exibido no JSX
    turmas: string[]; // Mantido, mas não mais exibido no JSX
    nivelAcesso: string;
    escolaId: string;
}

// Define os tipos esperados pelo UsersManager
interface UsersCreateProps {
    onCreated: () => void;
    onCancel: () => void;
}

export default function UsersCreate({ onCreated, onCancel }: UsersCreateProps) {
    const { API_BASE_URL, token, user } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState<FormData>({
        registro: "",
        nome: "",
        email: "",
        cpf: "",
        senha: "",
        materia: "",
        turmas: [],
        nivelAcesso: "Professor", // Valor padrão
        escolaId: user?.escolaId || "", // Preenche com a escola do usuário logado
    });

    const [acessos, setAcessos] = useState<Acesso[]>([]);
    const [escolas, setEscolas] = useState<Escola[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingResources, setLoadingResources] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const isAdmin = user?.acesso === 'Administrador';
    const isEscolaDisabled = !isAdmin || loadingResources || loading;

    // UseEffect para buscar acessos e escolas
    useEffect(() => {
        const fetchResources = async () => {
            if (!token) return;
            setLoadingResources(true);
            try {
                // NOTA: A rota /api/acessos deve estar montada no index.ts
                const [escolasRes, acessosRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/escolas`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_BASE_URL}/api/acessos`, { headers: { Authorization: `Bearer ${token}` } }),
                ]);

                if (escolasRes.ok) {
                    const escolasData: Escola[] = await escolasRes.json();
                    setEscolas(escolasData);
                    // Lógica para definir a escola padrão/selecionada
                    if (user?.escolaId) {
                         setFormData(prev => ({ ...prev, escolaId: user.escolaId }));
                    } else if (isAdmin && escolasData.length > 0) {
                        setFormData(prev => ({ ...prev, escolaId: escolasData[0].id }));
                    }
                }
                if (acessosRes.ok) {
                    const acessosData: Acesso[] = await acessosRes.json();
                    setAcessos(acessosData);
                    // Garante que o nível de acesso padrão seja um valor válido da lista
                    const defaultAcesso = acessosData.find(a => a.nome === "Professor") || acessosData[0];
                    setFormData(prev => ({ ...prev, nivelAcesso: defaultAcesso.nome }));
                }
            } catch (error) {
                // Se a API falhar (ex: 403 Forbidden), o formulário não será bloqueado.
                // O erro de login expirado deve ser resolvido no login.
                console.error("Erro ao carregar recursos:", error);
                setMessage({ type: 'error', text: 'Não foi possível carregar os recursos do formulário.' });
            } finally {
                setLoadingResources(false);
            }
        };
        fetchResources();
    }, [API_BASE_URL, token, user?.acesso, user?.escolaId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setMessage(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            setMessage({ type: 'error', text: 'Sessão expirada. Faça login novamente.' });
            router.push('/');
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const payload = {
                ...formData,
                escolaId: isAdmin ? formData.escolaId : user?.escolaId, // Garante que apenas Admin pode mudar
            };

            const response = await fetch(`${API_BASE_URL}/api/docentes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro de servidor ao criar docente: ${response.status}`);
            }

            setMessage({ type: 'success', text: 'Docente cadastrado com sucesso!' });
            
            setFormData({
                registro: "", nome: "", email: "", cpf: "", senha: "", materia: "", turmas: [],
                nivelAcesso: "Professor", escolaId: user?.escolaId || ""
            });
            
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
                <h2 className="text-2xl font-bold text-green-600 mb-6 text-center">Cadastrar Novo Docente</h2>
                
                {message && (
                    <div className={`p-3 mb-4 rounded-lg text-center font-medium ${messageClass}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Campo Registro / Matrícula */}
                    <div>
                        <label htmlFor="registro" className="block text-sm font-medium text-gray-700 mb-1">
                            Registro / Matrícula
                        </label>
                        <input
                            type="text" id="registro" name="registro" value={formData.registro} onChange={handleChange} required
                            disabled={loading}
                            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
                        />
                    </div>

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
                            disabled={isEscolaDisabled}
                            className={`w-full px-3 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none 
                                ${isEscolaDisabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
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
                            disabled={loadingResources || loading}
                            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
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
                            disabled={loading}
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
                            disabled={loading}
                            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
                        />
                    </div>
                    
                    {/* Senha */}
                    <div>
                        <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
                            Senha
                        </label>
                        <input
                            type="password" id="senha" name="senha" value={formData.senha} onChange={handleChange} required
                            disabled={loading}
                            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
                        />
                    </div>

                    {/* Botões */}
                    <div className="mt-8 flex justify-end gap-4">
                        <button type="button" onClick={onCancel} disabled={loading}
                            className="w-full md:w-auto bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-xl shadow-md hover:bg-gray-400 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading}
                            className="w-full md:w-auto bg-green-600 text-white font-semibold py-2 px-6 rounded-xl shadow-md hover:bg-green-700 transition-colors disabled:opacity-50">
                            {loading ? 'Salvando...' : 'Salvar Docente'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
