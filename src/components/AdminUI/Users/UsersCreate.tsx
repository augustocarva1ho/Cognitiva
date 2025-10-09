'use client'

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// Define os tipos esperados pelo UsersManager (para feedback e navegação)
interface UsersCreateProps {
  onCreated: () => void;
  onCancel: () => void;
}

// O tipo do formulário é uma parte da interface Docente
interface FormData {
  codigo: string;
  nome: string;
  email: string;
  // cpf: string;
  senha: string;
  // materia: string;
  // turmas: string[];
  nivelAcesso: string;
}

interface Acesso {
  id: string;
  nome: string;
}

export default function UsersCreate({ onCreated, onCancel }: UsersCreateProps) {
  const { API_BASE_URL, token } = useAuth();
  const router = useRouter();
  const [acessos, setAcessos] = useState<Acesso[]>([]);
  const [acessoId, setAcessoId] = useState('');
  const [loadingAcessos, setLoadingAcessos] = useState(true);

  useEffect(() => {
    const fetchAcessos = async () => {
        setLoadingAcessos(true);
        if (!token) {
          setLoadingAcessos(false);
          return;
        }

        const url = `${API_BASE_URL}/api/docentes/acessos`;

        try {
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Falha ao buscar níveis de acesso');
            }
            const data: Acesso[] = await response.json();
            setAcessos(data);
            if (data.length > 0) {
                setFormData(prev => ({ ...prev, nivelAcesso: data[0].id }));
            }
        } catch (error) {
            console.error('Erro ao buscar níveis de acesso:', error);
            setMessage({ type: 'error', text: 'Não foi possível carregar os níveis de acesso.' });
        } finally {
            setLoadingAcessos(false);
        }
    };
    fetchAcessos();
}, [API_BASE_URL, token]);
  
  const [formData, setFormData] = useState<FormData>({
    codigo: "",
    nome: "",
    email: "",
    // cpf: "",
    senha: "",
    // materia: "",
    // turmas: [],
    nivelAcesso: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Placeholder para simular turmas
  const turmasPlaceholder = ["Turma A", "Turma B", "Turma C", "Turma D"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage(null);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, selectedOptions } = e.target;
    const selectedValues = Array.from(selectedOptions, (option) => option.value);
    setFormData((prev) => ({ ...prev, [name]: selectedValues }));
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

    const payload = {
      registro: formData.codigo,
      nome: formData.nome,
      email: formData.email,
      // cpf: formData.cpf,
      senha: formData.senha,
      // materia: formData.materia,
      // turmas: formData.turmas, 
      acessoId: formData.nivelAcesso, // Defina um valor de nível de acesso padrão para novos docentes
    };
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/docentes`, {
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

      setMessage({ type: 'success', text: 'Docente cadastrado com sucesso!' });
      
      setFormData({
        codigo: "", nome: "", email: "",  senha: "", nivelAcesso: acessos[0]?.id || ""
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
      <h2 className="text-2xl font-bold text-green-500 mb-6 text-center">Cadastrar Novo Docente</h2>
      
      {message && (
        <div className={`p-3 mb-4 rounded-lg text-center font-medium ${messageClass}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Código de Funcionário */}
        <div>
          <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-1">
            Código de Funcionário (Registro)
          </label>
          <input
            type="text"
            id="codigo"
            name="codigo"
            value={formData.codigo}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
          />
        </div>

        {/* Nome */}
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Docente
          </label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
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
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
          />
        </div>

        {/* CPF 
        <div>
          <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
            CPF
          </label>
          <input
            type="text"
            id="cpf"
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
          />
        </div>*/}

        {/* Senha */}
        <div>
          <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
            Senha (Será criptografada no servidor)
          </label>
          <input
            type="password"
            id="senha"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
          />
        </div>

        {/* Matéria 
        <div>
          <label htmlFor="materia" className="block text-sm font-medium text-gray-700 mb-1">
            Matéria
          </label>
          <input
            type="text"
            id="materia"
            name="materia"
            value={formData.materia}
            onChange={handleChange}
            required
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
          />
        </div>*/}

        {/* Turmas atribuídas 
        <div>
          <label htmlFor="turmas" className="block text-sm font-medium text-gray-700 mb-1">
            Turmas atribuídas
          </label>
          <select
            multiple
            id="turmas"
            value={formData.turmas}
            onChange={handleSelectChange}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none h-32"
          >
            {turmasPlaceholder.map((turma) => (
              <option key={turma} value={turma}>
                {turma}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Segure <kbd>Ctrl</kbd> (ou <kbd>Cmd</kbd> no Mac) para selecionar mais de uma.
          </p>
        </div>*/}

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
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
            required
            disabled={loadingAcessos || loading}
          >
            <option value="" disabled>
              {loadingAcessos ? 'A carregar...' : 'Selecione um nível de acesso'}
            </option>
            {acessos.map((acesso) => (
              <option key={acesso.id} value={acesso.id}>
                {acesso.nome}
              </option>
            ))}
          </select>
        </div>

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
            {loading ? 'Salvando...' : 'Salvar Docente'}
          </button>
        </div>
      </form>
    </div>
  );
}
