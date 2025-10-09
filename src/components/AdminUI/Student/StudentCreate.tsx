'use client'

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// Define a interface para o tipo 'Turma'
interface Turma {
  id: string;
  Nome: string;
}

// Define os tipos esperados pelo StudentManager
interface StudentCreateProps {
  onCreated: () => void;
  onCancel: () => void;
}

// O tipo do formulário
interface FormData {
  Nome: string; // CORRIGIDO: Capitalizado
  Matricula: string; // CORRIGIDO: Capitalizado
  Idade: number | ''; // Capitalizado
  turmaId: string;
  possuiLaudo: boolean;
  descricaoLaudo: string;
}

export default function StudentCreate({ onCreated, onCancel }: StudentCreateProps) {
  const { API_BASE_URL, token } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<FormData>({
    Nome: "",
    Matricula: "",
    Idade: '',
    turmaId: "",
    possuiLaudo: false,
    descricaoLaudo: "",
  });

  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTurmas, setLoadingTurmas] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // UseEffect para buscar as turmas da API
  useEffect(() => {
    const fetchTurmas = async () => {
        setLoadingTurmas(true);
        if (!token) {
          setLoadingTurmas(false);
          return;
        }

        const url = `${API_BASE_URL}/api/turmas`;
        
        try {
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Falha ao buscar turmas');
            }
            const data: Turma[] = await response.json();
            setTurmas(data);
            // Define a primeira turma como padrão, se existir
            if (data.length > 0) {
                setFormData(prev => ({ ...prev, turmaId: data[0].id }));
            }
        } catch (error) {
            console.error('Erro ao buscar turmas:', error);
            setMessage({ type: 'error', text: 'Não foi possível carregar as turmas.' });
        } finally {
            setLoadingTurmas(false);
        }
    };
    fetchTurmas();
  }, [API_BASE_URL, token]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let finalValue: string | number = value;

    if (name === "Idade") {
        finalValue = value === "" ? "" : Number(value);
    }
    
    // CORRIGIDO: o `name` do input corresponde à chave maiúscula
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    setMessage(null);
  };
  
  const handleLaudoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === 'sim';
    setFormData((prev) => ({ 
        ...prev, 
        possuiLaudo: value,
        descricaoLaudo: value ? prev.descricaoLaudo : ""
    }));
    setMessage(null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setMessage({ type: 'error', text: 'Sessão expirada. Faça login novamente.' });
      router.push('/');
      return;
    }
    
    setLoading(true);
    setMessage(null);

    const payload = {
      ...formData,
      // Se não possui laudo, remove o campo da descrição do payload
      ...(formData.possuiLaudo && { laudo: { create: { descricao: formData.descricaoLaudo } } })
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/alunos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro de servidor: ${response.status}`);
      }

      setMessage({ type: 'success', text: 'Aluno cadastrado com sucesso!' });
      
      setFormData({
        Nome: "", Matricula: "", Idade: '', turmaId: turmas[0]?.id || "", possuiLaudo: false, descricaoLaudo: ""
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
    <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-8 mt-4">
      <h2 className="text-2xl font-bold text-green-500 mb-6 text-center">Cadastrar Novo Aluno</h2>
      
      {message && (
        <div className={`p-3 mb-4 rounded-lg text-center font-medium ${messageClass}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Nome */}
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Aluno
          </label>
          <input
            type="text"
            id="nome"
            name="Nome" // CORRIGIDO: Maiúsculo
            value={formData.Nome}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
          />
        </div>

        {/* Matrícula */}
        <div>
          <label htmlFor="matricula" className="block text-sm font-medium text-gray-700 mb-1">
            Matrícula
          </label>
          <input
            type="text"
            id="matricula"
            name="Matricula" // CORRIGIDO: Maiúsculo
            value={formData.Matricula}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
          />
        </div>

        {/* Idade */}
        <div>
          <label htmlFor="idade" className="block text-sm font-medium text-gray-700 mb-1">
            Idade
          </label>
          <input
            type="number"
            id="idade"
            name="Idade" // CORRIGIDO: Maiúsculo
            value={formData.Idade}
            onChange={handleChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
          />
        </div>
        
        {/* Turma */}
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

        {/* --- Lógica Condicional para Laudo --- */}
        <div>
          <label htmlFor="laudo" className="block text-sm font-medium text-gray-700 mb-1">
            Possui laudo de neurodivergência?
          </label>
          <select
            id="laudo"
            name="laudo"
            value={formData.possuiLaudo ? 'sim' : 'nao'}
            onChange={handleLaudoChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
            disabled={loading}
          >
            <option value="nao">Não</option>
            <option value="sim">Sim</option>
          </select>
        </div>
        
        {/* Placeholder condicional */}
        {formData.possuiLaudo && (
          <div className="bg-gray-100 p-4 rounded-xl text-center text-gray-600">
            Placeholder para opções de laudo.
          </div>
        )}

        {/* Botões */}
        <div className="flex justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-xl shadow hover:bg-gray-400 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-500 text-white font-semibold py-2 px-4 rounded-xl shadow hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Aluno'}
          </button>
        </div>
      </form>
    </div>
  );
}