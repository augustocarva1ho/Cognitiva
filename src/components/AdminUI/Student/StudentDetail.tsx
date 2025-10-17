'use client'

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { FaPlus, FaTrashAlt } from "react-icons/fa"; // Ícones para adicionar/remover
import { Fragment } from "react";


// Interface para o tipo de dado 'Aluno'
interface Aluno {
  id: string;
  Nome: string;
  Matricula: string;
  Idade: number;
  escolaId: string; // Adicionado para a lógica de segurança
  turmaId: string; // Adicionado para a lógica de formulário
  turma: {
    Nome: string;
    id: string;
  };
  condicao?: Condition[]; 
}

// Interface para o tipo de dado 'Turma'
interface Turma {
  id: string;
  Nome: string;
}

// Interfaces para a lógica de Condições
interface Condition {
    id?: string; // ID da CondicaoAluno, é opcional para novas condições
    nomeCondicao: string;
    statusComprovacao: string;
    descricaoAdicional: string;
}

interface StudentDetailProps {
  aluno: Aluno;
  onDone: () => void;
  onCancel: () => void;
}

interface StudentFormData {
  Nome: string;
  Matricula: string;
  Idade: number | '';
  turmaId: string;
}


export default function StudentDetail({ aluno, onDone, onCancel }: StudentDetailProps) {
  const { API_BASE_URL, token, user, viewingSchoolId } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<StudentFormData>({
    Nome: aluno.Nome,
    Matricula: aluno.Matricula,
    Idade: aluno.Idade,
    turmaId: aluno.turma.id,
  });
  const [conditionsData, setConditionsData] = useState<Condition[]>(aluno.condicao || []); 
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTurmas, setLoadingTurmas] = useState(true);
  const [loadingCondicoes, setLoadingCondicoes] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isAdmin = user?.acesso === 'Administrador';
  
  // O ID da escola que está a ser operada (viewingSchoolId se Admin, escolaId do Docente caso contrário)
  const escolaDeOperacao = isAdmin ? viewingSchoolId : user?.escolaId;

  // Permissão de edição/exclusão: Apenas Admin OU Supervisor/Professor se for na própria escola
  const canOperate = isAdmin || (user?.escolaId === aluno.escolaId);

  // UseEffect para buscar as turmas (filtradas)
  useEffect(() => {
    const fetchDependencies = async () => {
      if (!token) return;

      // 1. Busca turmas (filtradas pela escola de visualização/pertencimento)
      setLoadingTurmas(true);
      const escolaIdParaFiltrar = escolaDeOperacao;

      if (!escolaIdParaFiltrar) {
          setMessage({ type: 'error', text: 'ID da escola de operação ausente.' });
          setLoadingTurmas(false);
          return;
      }

      try {
        const turmasRes = await fetch(`${API_BASE_URL}/api/turmas?viewingSchoolId=${escolaIdParaFiltrar}`, { headers: { Authorization: `Bearer ${token}` } });
        if (turmasRes.ok) setTurmas(await turmasRes.json());
      } catch (error) {
        setMessage({ type: 'error', text: 'Não foi possível carregar as turmas.' });
      } finally {
        setLoadingTurmas(false);
      }
      
      // NOTA: A busca de condições foi removida daqui. A nova API deve incluir as condições no payload do Aluno
      // O componente StudentManager deve ser ajustado para chamar o GET /api/alunos/id que retorna tudo.

    };
    fetchDependencies();
  }, [API_BASE_URL, token, escolaDeOperacao]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === "Idade" ? (value === "" ? "" : Number(value)) : value }));
    setMessage(null);
  };

  const handleConditionChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedConditions = [...conditionsData];
    updatedConditions[index] = { ...updatedConditions[index], [name]: value };
    setConditionsData(updatedConditions);
  };

  const handleAddCondition = () => {
    // Adiciona uma nova condição vazia (sem ID)
    setConditionsData(prev => [...prev, { nomeCondicao: "", statusComprovacao: "Suspeita Médica", descricaoAdicional: "" }]);
  };

  const handleRemoveCondition = async (index: number) => {
    const conditionToRemove = conditionsData[index];
    if (!canOperate) {
      setMessage({ type: 'error', text: 'Permissão negada.' });
      return;
    }

    if (conditionToRemove.id) { // Se a condição já existe (tem ID), envia para a API para remover
      if (!window.confirm(`Tem certeza que deseja remover esta condição?`)) {
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/condicoes/${conditionToRemove.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Falha ao remover a condição da API.');
        setMessage({ type: 'success', text: 'Condição removida com sucesso!' });
        
        // Se a exclusão da API foi bem-sucedida, atualiza o estado local
        const updatedConditions = conditionsData.filter((_, i) => i !== index);
        setConditionsData(updatedConditions);
        
      } catch (err) {
        setMessage({ type: 'error', text: (err as Error).message });
      } finally {
        setLoading(false);
      }
    } else {
        // Remove apenas do estado local se a condição for nova (não tem ID)
        const updatedConditions = conditionsData.filter((_, i) => i !== index);
        setConditionsData(updatedConditions);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !canOperate) {
      setMessage({ type: 'error', text: 'Permissão negada ou sessão expirada.' });
      return;
    }
    setLoading(true);
    setMessage(null);

    // ID da escola para o PUT (Admin usa o ID de visualização; Docente usa o ID do aluno)
    const escolaIdToUpdate = aluno.escolaId; 
    
    // Parametro de query com o ID de visualização (necessário para a permissão do backend)
    const queryParam = escolaDeOperacao ? `?viewingSchoolId=${escolaDeOperacao}` : '';

    try {
      // 1. Envia a atualização do aluno
      const alunoResponse = await fetch(`${API_BASE_URL}/api/alunos/${aluno.id}${queryParam}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
            ...formData,
            escolaId: escolaIdToUpdate, // Necessário para a validação da API
        }),
      });
      if (!alunoResponse.ok) {
        const errorData = await alunoResponse.json();
        throw new Error(errorData.error || `Falha ao atualizar aluno: ${alunoResponse.statusText}`);
      }

      // 2. Processa as condições novas (sem ID)
      const novasCondicoes = conditionsData.filter(c => !c.id);
      for (const cond of novasCondicoes) {
        const condicaoPayload = {
          alunoId: aluno.id,
          nomeCondicao: cond.nomeCondicao,
          statusComprovacao: cond.statusComprovacao,
          descricaoAdicional: cond.descricaoAdicional
        };
        const condicaoRes = await fetch(`${API_BASE_URL}/api/condicoes/atribuir`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(condicaoPayload),
        });
        if (!condicaoRes.ok) {
          console.error("Erro ao adicionar nova condição:", await condicaoRes.json());
        }
      }

      setMessage({ type: 'success', text: 'Aluno e condições atualizados com sucesso!' });
      setTimeout(onDone, 1500); 
    } catch (err) {
      const errorText = err instanceof Error ? err.message : 'Erro desconhecido ao atualizar.';
      setMessage({ type: 'error', text: errorText });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Tem certeza que deseja excluir o aluno ${aluno.Nome}? Esta ação é irreversível.`)) {
      return;
    }
    if (!token || !canOperate) {
      setMessage({ type: 'error', text: 'Permissão negada ou sessão expirada.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    
    // Parametro de query com o ID de visualização (necessário para a permissão do backend)
    const queryParam = escolaDeOperacao ? `?viewingSchoolId=${escolaDeOperacao}` : '';
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/alunos/${aluno.id}${queryParam}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Falha ao excluir aluno: ${response.statusText}`);
      }

      setMessage({ type: 'success', text: 'Aluno excluído com sucesso!' });
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
    <div className="w-full mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <h2 className="text-2xl font-bold text-green-600 mb-6 text-center">Detalhes e Edição de Aluno</h2>
        {message && (
          <div className={`p-3 mb-4 rounded-lg text-center font-medium ${messageClass}`}>
            {message.text}
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Formulário Principal (Esquerda) */}
          <div className="flex-1 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Aluno
                </label>
                <input
                  type="text" id="nome" name="Nome" value={formData.Nome} onChange={handleChange} required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="matricula" className="block text-sm font-medium text-gray-700 mb-1">
                  Matrícula
                </label>
                <input
                  type="text" id="matricula" name="Matricula" value={formData.Matricula} disabled
                  className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-xl shadow-sm focus:outline-none cursor-not-allowed"
                />
              </div>
              <div>
                <label htmlFor="idade" className="block text-sm font-medium text-gray-700 mb-1">
                  Idade
                </label>
                <input
                  type="number" id="idade" name="Idade" value={formData.Idade} onChange={handleChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="turmaId" className="block text-sm font-medium text-gray-700 mb-1">
                  Turma
                </label>
                <select
                  id="turmaId" name="turmaId" value={formData.turmaId} onChange={handleChange} required
                  disabled={loadingTurmas || loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
                >
                  <option value="" disabled>
                    {loadingTurmas ? 'A carregar...' : 'Selecione uma turma'}
                  </option>
                  {turmas.map((turma) => (
                    <option key={turma.id} value={turma.id}>{turma.Nome}</option>
                  ))}
                </select>
              </div>
              <div className="mt-8 flex justify-between gap-4">
                <button
                  type="button" onClick={onCancel} disabled={loading}
                  className="flex-1 bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-gray-400 transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit" disabled={loading}
                  className="flex-1 bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
            <div className="mt-4 border-t pt-4 border-gray-200">
                <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="w-full bg-red-500 text-white font-semibold py-2 px-4 rounded-xl shadow hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                    {loading ? 'Excluindo...' : 'Excluir Aluno'}
                </button>
            </div>
          </div>
          {/* Formulário de Condições (Direita) */}
          <div className="flex-1 pt-6 md:pt-0 md:pl-8 space-y-4 border-t md:border-t-0 md:border-l border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Laudos e Condições Médicas</h3>
            <p className="text-sm text-gray-600 mb-4">Gerencie as condições médicas do aluno.</p>
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
                  {loadingCondicoes ? (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-gray-500">A carregar condições...</td>
                    </tr>
                  ) : conditionsData.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-gray-500">Nenhuma condição cadastrada.</td>
                    </tr>
                  ) : (
                    conditionsData.map((condition, index) => (
                      <tr key={condition.id || `new-${index}`} className="border-b border-gray-300">
                        <td className="p-2">
                          <input
                            type="text" name="nomeCondicao" value={condition.nomeCondicao} onChange={(e) => handleConditionChange(index, e)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm" placeholder="Ex: TDAH, Ansiedade"
                            required
                          />
                        </td>
                        <td className="p-2">
                          <select name="statusComprovacao" value={condition.statusComprovacao} onChange={(e) => handleConditionChange(index, e)}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm" required
                          >
                            <option value="Laudo Médico">Laudo Médico</option>
                            <option value="Suspeita Médica">Suspeita Médica</option>
                          </select>
                        </td>
                        <td className="p-2 text-center">
                          <button type="button" onClick={() => handleRemoveCondition(index)}
                            className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                          >
                            <FaTrashAlt />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <button type="button" onClick={handleAddCondition}
                className="mt-2 flex items-center justify-center w-full px-4 py-2 bg-green-100 text-green-700 font-semibold rounded-xl shadow-sm hover:bg-green-200 transition-colors text-sm"
              >
                <FaPlus className="mr-2" /> Adicionar Condição
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}