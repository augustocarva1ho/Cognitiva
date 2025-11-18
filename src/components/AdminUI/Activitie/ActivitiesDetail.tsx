'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FaTrashAlt } from 'react-icons/fa';

// Tipos auxiliares (simplificados para COMPATIBILIDADE com o ActivitiesManager)
interface Materia { id: string; nome: string; }
// CORRIGIDO: Retirando a exigência de 'registro' para resolver o conflito de tipagem,
// assumindo que ele está opcional no tipo que o Manager está a usar.
interface Professor { id: string; nome: string; registro?: string; } 

// Interface Atividade Completa (Deve ser passada pelo ActivitiesManager)
interface Atividade {
    id: string;
    tipo: string;
    local: string;
    tempoFinalizacao: string;
    dinamica: string;
    comConsulta: boolean;
    liberdadeCriativa: boolean;
    descricaoAdicional: string;
    notaMaxima: number;
    escolaId: string;
    materia: Materia;
    professor: Professor;
}

interface ActivityDetailProps {
    atividade: Atividade;
    onDone: () => void;
    onCancel: () => void;
}

// Define os tipos para o formulário
interface FormData {
    tipo: string;
    local: string;
    tempoFinalizacao: string;
    dinamica: string;
    comConsulta: boolean;
    liberdadeCriativa: boolean;
    descricaoAdicional: string;
    notaMaxima: number;
    materiaId: string;
    professorId: string;
    escolaId: string;
}

export default function ActivityDetail({ atividade, onDone, onCancel }: ActivityDetailProps) {
    const { API_BASE_URL, token, user, viewingSchoolId } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState<FormData>({
        tipo: atividade.tipo,
        local: atividade.local,
        tempoFinalizacao: atividade.tempoFinalizacao,
        dinamica: atividade.dinamica,
        comConsulta: atividade.comConsulta,
        liberdadeCriativa: atividade.liberdadeCriativa,
        descricaoAdicional: atividade.descricaoAdicional || '',
        notaMaxima: atividade.notaMaxima,
        materiaId: atividade.materia.id,
        professorId: atividade.professor.id,
        escolaId: atividade.escolaId,
    });

    const [materias, setMaterias] = useState<Materia[]>([]);
    const [professores, setProfessores] = useState<Professor[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingResources, setLoadingResources] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const isAdmin = user?.acesso === 'Administrador';
    const canOperate = isAdmin || (user?.escolaId === atividade.escolaId); // Admin ou Docente/Supervisor da escola
    
    // ID da escola que deve ser usada na query para o backend verificar a permissão
    const escolaDeOperacao = isAdmin ? viewingSchoolId : user?.escolaId;


    // UseEffect para buscar Matérias e Professores
    useEffect(() => {
        const fetchResources = async () => {
            if (!token || !escolaDeOperacao) {
                setLoadingResources(false);
                return;
            }
            try {
                // Monta a URL de filtro para Matérias (Rota de Matéria deve ser corrigida para aceitar o viewingSchoolId)
                const materiasUrl = `${API_BASE_URL}/api/materias?viewingSchoolId=${escolaDeOperacao}`;
                const professoresUrl = `${API_BASE_URL}/api/docentes?viewingSchoolId=${escolaDeOperacao}`; // URL DE FILTRO

                
                const [materiasRes, professoresRes] = await Promise.all([
                    fetch(materiasUrl, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(professoresUrl, { headers: { Authorization: `Bearer ${token}` } }),
                ]);

                if (materiasRes.ok) {
                    setMaterias(await materiasRes.json());
                }
                if (professoresRes.ok) {
                    setProfessores(await professoresRes.json());
                }
            } catch (error) {
                setMessage({ type: 'error', text: 'Não foi possível carregar os recursos do formulário.' });
            } finally {
                setLoadingResources(false);
            }
        };
        fetchResources();
    }, [API_BASE_URL, token, escolaDeOperacao]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        setFormData((prev) => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
        }));
        setMessage(null);
    };

    // --- Função de Edição/Clonagem (PUT ou POST) ---
    const handleSubmit = async (e: React.FormEvent, isCloning: boolean = false) => { 
        e.preventDefault();
        
        if (!token || !canOperate) {
            setMessage({ type: 'error', text: 'Permissão negada ou sessão ausente.' });
            return;
        }

        setLoading(true);
        setMessage(null);

        // Se for Admin e estiver clonando, ele usará o viewingSchoolId no payload.
        const targetEscolaId = isAdmin ? viewingSchoolId : user?.escolaId;

        // Se for clonagem, a rota é POST, senão é PUT
        const method = isCloning ? 'POST' : 'PUT';
        const url = isCloning ? `${API_BASE_URL}/api/atividades` : `${API_BASE_URL}/api/atividades/${atividade.id}`;

        // Parametro de query com o ID de visualização (necessário para a permissão do backend)
        const queryParam = escolaDeOperacao ? `?viewingSchoolId=${escolaDeOperacao}` : '';
        
        try {
            const payload = {
                ...formData,
                notaMaxima: Number(formData.notaMaxima),
                // Garante que o Admin não tente mudar o professorId se não for o Admin
                professorId: user?.acesso === 'Professor' && user.id ? user.id : formData.professorId, 
                // Para POST (Clonagem), o backend precisa do ID da escola
                escolaId: isCloning ? targetEscolaId : formData.escolaId,
            };
            
            const response = await fetch(`${url}${queryParam}`, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro de servidor ao ${isCloning ? 'clonar' : 'atualizar'} atividade: ${response.status}`);
            }

            setMessage({ type: 'success', text: `Atividade ${isCloning ? 'clonada' : 'atualizada'} com sucesso!` });
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
        if (!window.confirm(`Tem certeza que deseja excluir a atividade "${atividade.tipo}"? Isso removerá as avaliações associadas.`)) {
            return;
        }
        if (!token || !canOperate) {
            setMessage({ type: 'error', text: 'Permissão negada.' });
            return;
        }

        setLoading(true);
        setMessage(null);
        
        const queryParam = escolaDeOperacao ? `?viewingSchoolId=${escolaDeOperacao}` : '';

        try {
            const response = await fetch(`${API_BASE_URL}/api/atividades/${atividade.id}${queryParam}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Falha ao excluir atividade: ${response.statusText}`);
            }

            setMessage({ type: 'success', text: 'Atividade excluída com sucesso!' });
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

    // Condição para desabilitar campos para Professor ou se não tiver permissão
    const isFieldDisabled = loading || loadingResources || !canOperate;
    const currentProfessorName = professores.find(p => p.id === formData.professorId)?.nome || atividade.professor.nome;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-xl mt-4">
      <h2 className="text-2xl font-bold text-green-500 mb-6 text-center">Detalhes e Edição de Atividade</h2>
      
      {message && (
        <div className={`p-3 mb-4 rounded-lg text-center font-medium ${messageClass}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
        
        {/* Tipo de Atividade */}
        <div>
          <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Atividade</label>
          <select
            id="tipo" name="tipo" value={formData.tipo} onChange={handleChange} required
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
            disabled={isFieldDisabled}
          >
            <option value="">Selecione...</option>
            <option value="Prova">Prova</option>
            <option value="Trabalho de Pesquisa">Trabalho de Pesquisa</option>
            <option value="Lista de Exercícios">Lista de Exercícios</option>
            <option value="Redação">Redação</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        {/* Local, Tempo, Dinâmica */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="local" className="block text-sm font-medium text-gray-700 mb-1">Local</label>
            <select id="local" name="local" value={formData.local} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
              disabled={isFieldDisabled}
            >
              <option value="">Selecione...</option>
              <option value="Em sala">Em sala</option>
              <option value="Em casa">Em casa</option>
              <option value="Em Quadra">Em Quadra</option>
              <option value="Em Laboratório">Em Laboratório</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          <div>
            <label htmlFor="tempoFinalizacao" className="block text-sm font-medium text-gray-700 mb-1">Tempo Finalização</label>
            <input type="text" id="tempoFinalizacao" name="tempoFinalizacao" value={formData.tempoFinalizacao} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
              disabled={isFieldDisabled}
            />
          </div>
          <div>
            <label htmlFor="dinamica" className="block text-sm font-medium text-gray-700 mb-1">Dinâmica</label>
            <select id="dinamica" name="dinamica" value={formData.dinamica} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
              disabled={isFieldDisabled}
            >
              <option value="">Selecione...</option>
              <option value="Individual">Individual</option>
              <option value="Em Dupla">Em Dupla</option>
              <option value="Em Grupo">Em Grupo</option>
            </select>
          </div>
        </div>

        {/* Matéria, Professor e Nota Máxima */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="materiaId" className="block text-sm font-medium text-gray-700 mb-1">Matéria</label>
            <select
              id="materiaId" name="materiaId" value={formData.materiaId} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
              disabled={isFieldDisabled}
            >
              <option value="">Selecione...</option>
              {materias.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="professorId" className="block text-sm font-medium text-gray-700 mb-1">Professor</label>
            <select id="professorId" name="professorId" value={formData.professorId} onChange={handleChange} required
              // Professor só pode selecionar a si mesmo
              disabled={user?.acesso === 'Professor' || !canOperate || loadingResources} 
              className={`w-full px-3 py-2 border rounded-xl shadow-sm focus:ring-green-400 focus:outline-none ${user?.acesso === 'Professor' ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}>
              {professores.map(p => (
                  <option key={p.id} value={p.id}>{p.nome} ({p.registro})</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="notaMaxima" className="block text-sm font-medium text-gray-700 mb-1">Nota Máxima</label>
            <input type="number" id="notaMaxima" name="notaMaxima" value={formData.notaMaxima} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
              disabled={isFieldDisabled}
            />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex gap-8">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="comConsulta" name="comConsulta" checked={formData.comConsulta} onChange={handleChange}
              disabled={isFieldDisabled}
              className="h-4 w-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="comConsulta" className="text-sm font-medium text-gray-700">Com Consulta?</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="liberdadeCriativa" name="liberdadeCriativa" checked={formData.liberdadeCriativa} onChange={handleChange}
              disabled={isFieldDisabled}
              className="h-4 w-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="liberdadeCriativa" className="text-sm font-medium text-gray-700">Liberdade Criativa?</label>
          </div>
        </div>

        {/* Descrição Adicional */}
        <div>
          <label htmlFor="descricaoAdicional" className="block text-sm font-medium text-gray-700 mb-1">Descrição Adicional</label>
          <textarea id="descricaoAdicional" name="descricaoAdicional" value={formData.descricaoAdicional} onChange={handleChange} rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
            disabled={isFieldDisabled}
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 pt-2">
          <div className="flex-1 space-y-2">
            <button
              type="submit"
              disabled={isFieldDisabled}
              className="w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)} // Botão para clonar
              disabled={isFieldDisabled}
              className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-xl shadow hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Clonando...' : 'Salvar como Nova Atividade'}
            </button>
          </div>
          
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={onCancel}
              disabled={isFieldDisabled}
              className="bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-xl shadow hover:bg-gray-400 transition-colors w-full"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-500 text-white font-semibold py-2 px-4 rounded-xl shadow hover:bg-red-600 transition-colors w-full"
            >
              {loading ? 'Excluindo...' : 'Excluir Atividade'}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}