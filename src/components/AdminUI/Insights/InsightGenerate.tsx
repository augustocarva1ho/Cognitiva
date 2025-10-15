'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// A API retorna o objeto Aluno completo, então a interface deve refletir isso
interface AlunoComDadosCompletos {
  id: string;
  Nome: string;
  Matricula: string;
  Idade: number | null;
  turma: { Nome: string; id: string; };
  condicao: { // CORRIGIDO: A interface reflete o nome da sua model (singular)
    id: string;
    nomeCondicao: string;
    statusComprovacao: string;
    descricaoAdicional: string;
  }[];
  notasBimestrais: any[];
  avaliacoes: any[];
  observacoes: any[];
}


interface InsightGenerateProps {
  alunoId: string;
  onSaved: () => void;
  onCancel: () => void;
}

export default function InsightGenerate({ alunoId, onSaved, onCancel }: InsightGenerateProps) {
  const { API_BASE_URL, token, user } = useAuth();
  const router = useRouter();
  // O estado agora armazena o objeto Aluno completo diretamente
  const [alunoData, setAlunoData] = useState<AlunoComDadosCompletos | null>(null);
  const [prompt, setPrompt] = useState('Analise o histórico de desempenho e condições do aluno. Forneça um resumo dos pontos fortes e fracos e três sugestões específicas para o professor adaptar as atividades e o ambiente de aprendizagem.');
  
  const [loadingData, setLoadingData] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [insightText, setInsightText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);

  const fetchAlunoData = async () => {
    if (!token || !alunoId) return;
    setLoadingData(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/alunos/${alunoId}/full-data`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Falha ao buscar dados do aluno para insight.');
      
      const data: AlunoComDadosCompletos = await response.json();
      // CORRIGIDO: O estado é definido diretamente com a resposta da API
      setAlunoData(data);
    } catch (err) {
      setError('Falha ao carregar dados do aluno.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchAlunoData();
  }, [alunoId, token]);

  const handleGenerate = async () => {
    if (!alunoData || generating) return;
    setGenerating(true);
    setError(null);
    setInsightText('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/insights/aluno/${alunoId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt: prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao gerar insight na API.');
      }

      const result = await response.json();
      
      setInsightText(result.insight.textoInsight);

    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  if (loadingData) return <p className="text-center mt-8">A carregar dados do aluno...</p>;
  if (error) return <p className="text-center text-red-500 mt-8">Erro: {error}</p>;
  // Agora a verificação é sobre o estado geral, não uma propriedade
  if (!alunoData) return <p className="text-center text-gray-500 mt-8">Aluno não encontrado.</p>;

  // Função utilitária para formatar o JSON (o JSON que a API USARIA)
  const formatJson = () => {
    // A API envia os dados completos, então formatamos a partir do estado
    const fullJson = {
        aluno: {
            Nome: alunoData.Nome,
            Matricula: alunoData.Matricula,
            Idade: alunoData.Idade,
            turma: alunoData.turma.Nome,
        },
        dados_academicos: { notas: alunoData.notasBimestrais, avaliacoes: alunoData.avaliacoes },
        laudos_e_observacoes: { condicao: alunoData.condicao, observacao_professor: alunoData.observacoes }
    };
    return JSON.stringify(fullJson, null, 2);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-4">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6">Gerar Insight Personalizado para {alunoData.Nome}</h2>

      {/* Seção de Dados para Conferência */}
      <div className="bg-gray-100 p-6 rounded-xl shadow-inner mb-6 border-b">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Dados de Entrada (JSON)</h3>
        <p className="text-sm text-gray-600 mb-4">
          Confirme que os dados abaixo estão atualizados. Estes são os dados que o Gemini irá analisar.
        </p>

        {/* Exibição resumida dos dados */}
        <div className="text-sm space-y-1">
            <p><strong>Matrícula:</strong> {alunoData.Matricula}</p>
            <p><strong>Turma:</strong> {alunoData.turma.Nome}</p>
            <p><strong>Condições Cadastradas:</strong> {alunoData.condicao?.length || 0} {alunoData.condicao?.length === 1 ? 'condição' : 'condições'}</p>
            <p><strong>Total de Avaliações:</strong> {alunoData.avaliacoes?.length || 0}</p>
        </div>

        <button 
            onClick={() => setShowJson(!showJson)}
            className="mt-4 text-xs text-blue-600 hover:text-blue-800 transition-colors"
        >
            {showJson ? 'Ocultar JSON Completo' : 'Visualizar JSON Completo (Dados Brutos)'}
        </button>
        {showJson && (
            <pre className="bg-gray-800 text-green-300 p-4 rounded-lg overflow-x-auto text-xs mt-3 max-h-64 whitespace-pre-wrap">
              {formatJson()}
            </pre>
        )}
      </div>

      {/* Seção de Prompt e Geração */}
      <div className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-lg font-medium text-gray-700 mb-1">Instrução Personalizada para a IA</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-400 focus:outline-none"
            disabled={generating}
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleGenerate}
            disabled={generating || !token}
            className="flex-1 bg-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {generating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Gerando Insight...
              </>
            ) : 'Gerar Insight Personalizado'}
          </button>
          <button
            onClick={onCancel}
            disabled={generating}
            className="bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl shadow-md hover:bg-gray-400 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* Resultado da IA */}
      {insightText && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Análise Concluída</h3>
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <p className="text-gray-800 whitespace-pre-wrap">{insightText}</p>
          </div>
          <button
            onClick={onSaved} // Redireciona de volta para a lista e aciona o refresh
            className="w-full bg-green-500 text-white font-semibold py-3 px-6 rounded-xl shadow-md mt-4 hover:bg-green-600 transition-colors"
          >
            Salvar e Voltar ao Histórico
          </button>
        </div>
      )}
    </div>
  );
}