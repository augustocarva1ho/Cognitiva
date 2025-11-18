'use client'

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { Fragment } from "react";

// Define a interface para o tipo 'Turma'
interface Turma {
  id: string;
  Nome: string;
}   

// Define os tipos para o novo formulário de condições
interface ConditionFormData {
    nomeCondicao: string; // Texto livre
    statusComprovacao: string; // Laudo ou Suspeita
    descricaoAdicional: string;
}

// O tipo do formulário principal
interface FormData {
    Nome: string;
    Matricula: string;
    Idade: number | '';
    turmaId: string;
    possuiCondicao: boolean;
}

// Define os tipos esperados pelo StudentManager
interface StudentCreateProps {
    onCreated: () => void;
    onCancel: () => void;
}

export default function StudentCreate({ onCreated, onCancel }: StudentCreateProps) {
    const { API_BASE_URL, token, user, viewingSchoolId } = useAuth(); 
    const router = useRouter();

    const [formData, setFormData] = useState<FormData>({
        Nome: "",
        Matricula: "",
        Idade: '',
        turmaId: "",
        possuiCondicao: false,
    });

    const [conditionsData, setConditionsData] = useState<ConditionFormData[]>([{ nomeCondicao: "", statusComprovacao: "Suspeita Médica", descricaoAdicional: "" }]);
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingTurmas, setLoadingTurmas] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // UseEffect para buscar as turmas da API
    useEffect(() => {
        const fetchTurmas = async () => {
            if (!token) return;
            setLoadingTurmas(true);

            // 1. Determina o ID de filtro: Admin usa viewingSchoolId, outros usam user.escolaId
            const escolaIdParaFiltrar = user?.acesso === 'Administrador' ? viewingSchoolId : user?.escolaId;

            // Bloqueia a busca se não houver ID válido (Admin sem seleção)
            if (!escolaIdParaFiltrar) {
                setTurmas([]);
                setLoadingTurmas(false);
                return;
            }

            // 2. Monta a URL com o parâmetro de consulta para o backend filtrar
            const url = `${API_BASE_URL}/api/turmas?viewingSchoolId=${escolaIdParaFiltrar}`;

            try {
                const response = await fetch(url, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Falha ao buscar turmas');
                const data: Turma[] = await response.json();
                setTurmas(data);
                // Se houver turmas, define a primeira como padrão
                if (data.length > 0) setFormData(prev => ({ ...prev, turmaId: data[0].id }));
                else setFormData(prev => ({ ...prev, turmaId: "" })); // Limpa turmaId se não houver turmas
            } catch (error) {
                setMessage({ type: 'error', text: 'Não foi possível carregar as turmas.' });
            } finally {
                setLoadingTurmas(false);
            }
        };
        // Dependências atualizadas para reexecutar o fetch quando o filtro global mudar
        fetchTurmas();
    }, [API_BASE_URL, token, router, user?.escolaId, user?.acesso, viewingSchoolId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: name === "Idade" ? (value === "" ? "" : Number(value)) : value }));
        setMessage(null);
    };

    const handlePossuiCondicaoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value === 'sim';
        setFormData((prev) => ({ ...prev, possuiCondicao: value }));
        if (value && conditionsData.length === 0) {
            handleAddCondition();
        } else if (!value) {
            setConditionsData([]);
        }
        setMessage(null);
    }

    const handleConditionChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const updatedConditions = [...conditionsData];
        updatedConditions[index] = { ...updatedConditions[index], [name]: value };
        setConditionsData(updatedConditions);
    };

    const handleAddCondition = () => {
        setConditionsData(prev => [...prev, { nomeCondicao: "", statusComprovacao: "Suspeita Médica", descricaoAdicional: "" }]);
    };

    const handleRemoveCondition = (index: number) => {
        const updatedConditions = conditionsData.filter((_, i) => i !== index);
        setConditionsData(updatedConditions);
        if (updatedConditions.length === 0) {
            setFormData(prev => ({ ...prev, possuiCondicao: false }));
        }
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

        let alunoId = "";
        
        // 1. Determina o ID de escola a ser salvo (Admin usa viewingSchoolId, outros usam user.escolaId)
        const escolaIdToSave = user?.acesso === 'Administrador' ? viewingSchoolId : user?.escolaId;

        // 2. Validação dos campos obrigatórios do formulário E ID de escola
        if (!formData.Nome || !formData.Matricula || !formData.turmaId || !escolaIdToSave) {
             setMessage({ type: 'error', text: 'Nome, Matrícula, Turma e ID da escola são obrigatórios.' });
             setLoading(false);
             return;
        }

        try {
            const alunoPayload = {
                Nome: formData.Nome,
                Matricula: formData.Matricula,
                Idade: formData.Idade,
                turmaId: formData.turmaId,
                escolaId: escolaIdToSave,
            };

            const alunoResponse = await fetch(`${API_BASE_URL}/api/alunos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(alunoPayload),
            });

            if (!alunoResponse.ok) {
                const errorData = await alunoResponse.json();
                throw new Error(errorData.error || `Erro de servidor ao criar aluno: ${alunoResponse.status}`);
            }
            const alunoData = await alunoResponse.json();
            alunoId = alunoData.aluno.id;

            if (formData.possuiCondicao && conditionsData.length > 0) {
                const condicoesValidas = conditionsData.filter(c => c.nomeCondicao && c.statusComprovacao);
                for (const condition of condicoesValidas) {
                    const condicaoPayload = {
                        alunoId: alunoId,
                        nomeCondicao: condition.nomeCondicao,
                        statusComprovacao: condition.statusComprovacao,
                        descricaoAdicional: condition.descricaoAdicional
                    };

                    const condicaoResponse = await fetch(`${API_BASE_URL}/api/condicoes/atribuir`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify(condicaoPayload),
                    });
                    if (!condicaoResponse.ok) {
                         console.error("Erro ao atribuir condição:", await condicaoResponse.json());
                    }
                }
            }

            setMessage({ type: 'success', text: 'Aluno e condições cadastrados com sucesso!' });
            
            setFormData({ Nome: "", Matricula: "", Idade: '', turmaId: turmas[0]?.id || "", possuiCondicao: false });
            setConditionsData([{ nomeCondicao: "", statusComprovacao: "Suspeita Médica", descricaoAdicional: "" }]);

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
        <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow-xl mt-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                <h2 className="text-2xl font-bold text-green-600 mb-6 text-center">Cadastrar Novo Aluno</h2>
                
                {message && (
                    <div className={`p-3 mb-4 rounded-lg text-center font-medium ${messageClass}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Formulário Principal */}
                        <div className="flex-1 space-y-4">
                            <div>
                                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                                    Nome do Aluno
                                </label>
                                <input
                                    type="text"
                                    id="nome"
                                    name="Nome"
                                    value={formData.Nome}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label htmlFor="matricula" className="block text-sm font-medium text-gray-700 mb-1">
                                    Matrícula
                                </label>
                                <input
                                    type="text"
                                    id="matricula"
                                    name="Matricula"
                                    value={formData.Matricula}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label htmlFor="idade" className="block text-sm font-medium text-gray-700 mb-1">
                                    Idade
                                </label>
                                <input
                                    type="number"
                                    id="idade"
                                    name="Idade"
                                    value={formData.Idade}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label htmlFor="turmaId" className="block text-sm font-medium text-gray-700 mb-1">
                                    Turma
                                </label>
                                <select
                                    id="turmaId"
                                    name="turmaId"
                                    value={formData.turmaId}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
                                    required
                                    disabled={loadingTurmas || loading}
                                >
                                    <option value="" disabled>
                                        {loadingTurmas ? 'A carregar...' : 'Selecione uma turma'}
                                    </option>
                                    {turmas.map((turma) => (
                                        <option key={turma.id} value={turma.id}>
                                            {turma.Nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="possuiCondicao" className="block text-sm font-medium text-gray-700 mb-1">
                                    Possui neurodivergência ou condição?
                                </label>
                                <select
                                    id="possuiCondicao"
                                    name="possuiCondicao"
                                    value={formData.possuiCondicao ? 'sim' : 'nao'}
                                    onChange={handlePossuiCondicaoChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
                                    disabled={loading}
                                >
                                    <option value="nao">Não</option>
                                    <option value="sim">Sim</option>
                                </select>
                                <p className="mt-2 text-xs text-gray-500">
                                    *A suspeita deve ter comprovação médica profissional e não apenas de pais ou professores.
                                </p>
                            </div>
                        </div>

                        {/* Formulário de Condições (condicional) */}
                        {formData.possuiCondicao && (
                            <div className="flex-1 pt-6 md:pt-0 md:pl-8 space-y-4 border-t md:border-t-0 md:border-l border-gray-200">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">Laudos e Condições Médicas</h3>
                                
                                <div className="overflow-x-auto bg-gray-100 rounded-xl shadow-inner p-4">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="p-2 text-left w-1/2">Condição/Nome</th>
                                                <th className="p-2 text-left w-1/4">Status</th>
                                                <th className="p-2 w-[50px]"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {conditionsData.map((condition, index) => (
                                                <tr key={index} className="border-b border-gray-300">
                                                    <td className="p-2">
                                                        <input
                                                            type="text"
                                                            name="nomeCondicao"
                                                            value={condition.nomeCondicao}
                                                            onChange={(e) => handleConditionChange(index, e)}
                                                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                                                            placeholder="Ex: TDAH, Ansiedade"
                                                            required
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <select
                                                            name="statusComprovacao"
                                                            value={condition.statusComprovacao}
                                                            onChange={(e) => handleConditionChange(index, e)}
                                                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                                                            required
                                                        >
                                                            <option value="Laudo Médico">Laudo Médico</option>
                                                            <option value="Suspeita Médica">Suspeita Médica</option>
                                                        </select>
                                                    </td>
                                                    <td className="p-2 text-center">
                                                        <button type="button" onClick={() => handleRemoveCondition(index)} className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50" disabled={conditionsData.length === 1}>
                                                            <FaTrashAlt />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {/* Botão Adicionar Linha */}
                                    <button type="button" onClick={handleAddCondition} className="mt-2 flex items-center justify-center w-full px-4 py-2 bg-green-100 text-green-700 font-semibold rounded-xl shadow-sm hover:bg-green-200 transition-colors text-sm">
                                        <FaPlus className="mr-2" /> Adicionar Condição
                                    </button>
                                </div>
                                <div className="pt-2">
                                     <label className="block text-sm font-medium text-gray-700 mb-1">Descrição Adicional (Opcional)</label>
                                    <textarea
                                        name="descricaoAdicional"
                                        value={conditionsData[0]?.descricaoAdicional || ""}
                                        onChange={(e) => handleConditionChange(0, e)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none text-sm"
                                        rows={2}
                                        placeholder="Detalhes adicionais sobre todas as condições..."
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Botões de Ação */}
                    <div className="mt-8 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="w-full md:w-auto bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-xl shadow-md hover:bg-gray-400 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full md:w-auto bg-green-600 text-white font-semibold py-2 px-6 rounded-xl shadow-md hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Salvando...' : 'Salvar Aluno'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}