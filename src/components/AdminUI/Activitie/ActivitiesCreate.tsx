'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from "next/navigation";


// Tipos auxiliares (reintroduzidos localmente)
interface Materia { id: string; nome: string; }
// Reintroduzindo a interface Professor
interface Professor { id: string; nome: string; registro: string; } 

interface ActivityCreateProps {
    escolaId: string | null | undefined; // O ID da escola atualmente selecionada pelo Admin ou do usuário
    onCreated: () => void;
    onCancel: () => void;
}

// Tipos para o formulário
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
}

// Estado inicial do formulário
const initialFormData: FormData = {
    tipo: 'Prova',
    local: '',
    tempoFinalizacao: '',
    dinamica: 'Individual',
    comConsulta: false,
    liberdadeCriativa: false,
    descricaoAdicional: '',
    notaMaxima: 10,
    materiaId: '',
    professorId: '',
};

export default function ActivityCreate({ escolaId, onCreated, onCancel }: ActivityCreateProps) {
    const { API_BASE_URL, token, user } = useAuth();
    
    // O ID da escola deve vir da prop, garantindo que o Admin use o viewingSchoolId
    const currentEscolaId = escolaId;
    
    const [formData, setFormData] = useState<FormData>({
        ...initialFormData,
        professorId: user?.acesso === 'Professor' ? (user?.id || '') : initialFormData.professorId // Define o professor logado como padrão se for Professor
    });
    const [materias, setMaterias] = useState<Materia[]>([]);
    const [professores, setProfessores] = useState<Professor[]>([]); // Reintroduzido o estado de professores
    const [loading, setLoading] = useState(false);
    const [loadingResources, setLoadingResources] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const isAdmin = user?.acesso === 'Administrador';
    const isProfessor = user?.acesso === 'Professor'; 

    // Se for professor, ele só pode criar atividades para si mesmo (definição obrigatória)
    useEffect(() => {
        if (isProfessor && user?.id) {
            // Se o usuário é professor, o professorId deve ser o seu próprio ID
            setFormData(prev => ({ ...prev, professorId: user.id }));
        }
    }, [isProfessor, user?.id]);


    const fetchResources = useCallback(async () => {
        if (!token || !currentEscolaId) {
            setLoadingResources(false);
            return;
        }
        
        try {
            // URLs com filtro pela escola atual (viewingSchoolId)
            const materiasUrl = `${API_BASE_URL}/api/materias?viewingSchoolId=${currentEscolaId}`;
            const professoresUrl = `${API_BASE_URL}/api/docentes?viewingSchoolId=${currentEscolaId}`;
            
            const [materiasRes, professoresRes] = await Promise.all([
                fetch(materiasUrl, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(professoresUrl, { headers: { Authorization: `Bearer ${token}` } }),
            ]);

            // 1. Matérias
            if (materiasRes.ok) {
                const fetchedMaterias: Materia[] = await materiasRes.json();
                setMaterias(fetchedMaterias);
                if (fetchedMaterias.length > 0 && !formData.materiaId) {
                    setFormData(prev => ({ ...prev, materiaId: fetchedMaterias[0].id }));
                }
            } else {
                console.error("Erro ao buscar matérias:", materiasRes.status);
            }

            // 2. Professores (Filtrados pela escola)
            if (professoresRes.ok) {
                const fetchedProfessores: Professor[] = await professoresRes.json();
                setProfessores(fetchedProfessores);
                
                // Lógica de seleção: Se não for professor (Admin/Supervisor), tenta selecionar o primeiro
                if (!isProfessor && fetchedProfessores.length > 0 && !formData.professorId) {
                    setFormData(prev => ({ ...prev, professorId: fetchedProfessores[0].id }));
                }
            } else {
                 console.error("Erro ao buscar professores:", professoresRes.status);
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Não foi possível carregar as Matérias/Professores.' });
        } finally {
            setLoadingResources(false);
        }
    }, [API_BASE_URL, token, currentEscolaId, isProfessor, formData.materiaId, formData.professorId]);
    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        setFormData((prev) => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
        }));
        setMessage(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!token || !currentEscolaId) {
            setMessage({ type: 'error', text: 'Selecione uma escola válida para cadastrar.' });
            return;
        }
        
        if (!formData.materiaId || !formData.professorId) {
            setMessage({ type: 'error', text: 'Matéria e Professor Responsável são obrigatórios.' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const payload = {
                ...formData,
                notaMaxima: Number(formData.notaMaxima),
                escolaId: currentEscolaId, // Passando o ID da escola selecionada na prop
            };
            
            // O Admin precisa enviar o viewingSchoolId como query param para o backend validar
            const queryParam = isAdmin ? `?viewingSchoolId=${currentEscolaId}` : '';

            const response = await fetch(`${API_BASE_URL}/api/atividades${queryParam}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro de servidor ao cadastrar atividade: ${response.status}`);
            }

            setMessage({ type: 'success', text: 'Atividade cadastrada com sucesso!' });
            // Não resetamos formData para initialFormData, para manter o professorId (se for professor)
            // mas limpamos os campos específicos da atividade
            setFormData(prev => ({ 
                ...initialFormData, 
                professorId: prev.professorId, 
                materiaId: prev.materiaId // Mantém a matéria selecionada
            })); 
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

    const isFormDisabled = loading || loadingResources || !currentEscolaId;
    const canCreate = !isFormDisabled && (user?.acesso === 'Administrador' || user?.acesso === 'Supervisor' || user?.acesso === 'Professor');

    if (!currentEscolaId) {
        return (
            <div className="w-full max-w-xl mx-auto p-8 bg-white rounded-2xl shadow-xl mt-4 text-center">
                <h2 className="text-2xl font-bold text-red-600 mb-6">Aguardando Seleção</h2>
                <p className="text-gray-700">O Administrador precisa selecionar uma escola para cadastrar atividades.</p>
                <button 
                    onClick={onCancel} 
                    className="mt-4 bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-xl hover:bg-gray-400 transition-colors"
                >
                    Voltar
                </button>
            </div>
        );
    }
  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-4">
      <h2 className="text-2xl font-bold text-green-500 mb-6 text-center">Cadastrar Nova Atividade</h2>
      
      {message && (
        <div className={`p-3 mb-4 rounded-lg text-center font-medium ${messageClass}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Tipo de Atividade */}
        <div>
          <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Atividade</label>
          <select
            id="tipo" name="tipo" value={formData.tipo} onChange={handleChange} required
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
            disabled={isFormDisabled}
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
              disabled={isFormDisabled}
            >
              <option value="">Selecione...</option>
              <option value="Em sala">Em Sala</option>
              <option value="Em casa">Em Casa</option>
              <option value="Em casa">Em Quadra</option>
              <option value="Em casa">Em Laboratório</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          <div>
            <label htmlFor="tempoFinalizacao" className="block text-sm font-medium text-gray-700 mb-1">Tempo Finalização</label>
            <input type="text" id="tempoFinalizacao" name="tempoFinalizacao" value={formData.tempoFinalizacao} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
              disabled={isFormDisabled}
            />
          </div>
          <div>
            <label htmlFor="dinamica" className="block text-sm font-medium text-gray-700 mb-1">Dinâmica</label>
            <select id="dinamica" name="dinamica" value={formData.dinamica} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
              disabled={isFormDisabled}
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
              disabled={isFormDisabled}
            >
              <option value="">Selecione...</option>
              {materias.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="professorId" className="block text-sm font-medium text-gray-700 mb-1">Professor</label>
            <select id="professorId" name="professorId" value={formData.professorId} onChange={handleChange} required
                // Desabilita se for Professor logado (sempre atribui a si mesmo)
                disabled={isProfessor || isFormDisabled} 
                className={`w-full px-3 py-2 border rounded-xl shadow-sm focus:ring-green-400 focus:outline-none ${isProfessor || isFormDisabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}>
                
                <option value="">Selecione o Professor</option>
                {professores.map(p => (
                    <option 
                        key={p.id} 
                        value={p.id}
                    >
                        {p.nome} ({p.registro})
                    </option>
                ))}
            </select>
            {isProfessor && user?.nome && (
              <p className="text-xs text-gray-500 mt-1">Atribuído automaticamente a você.</p>
            )}
          </div>
          <div>
            <label htmlFor="notaMaxima" className="block text-sm font-medium text-gray-700 mb-1">Nota Máxima</label>
            <input type="number" id="notaMaxima" name="notaMaxima" value={formData.notaMaxima} onChange={handleChange} required
              className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
              disabled={isFormDisabled}
            />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex gap-8">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="comConsulta" name="comConsulta" checked={formData.comConsulta} onChange={handleChange}
              disabled={isFormDisabled}
              className="h-4 w-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="comConsulta" className="text-sm font-medium text-gray-700">Com Consulta?</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="liberdadeCriativa" name="liberdadeCriativa" checked={formData.liberdadeCriativa} onChange={handleChange}
              disabled={isFormDisabled}
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
            disabled={isFormDisabled}
          />
        </div>

        <div className="flex justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isFormDisabled}
            className="flex-1 bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-xl shadow hover:bg-gray-400 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isFormDisabled}
            className="flex-1 bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Atividade'}
          </button>
        </div>
      </form>
    </div>
  );
}