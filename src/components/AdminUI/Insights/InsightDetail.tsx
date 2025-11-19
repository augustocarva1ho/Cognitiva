'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface InsightDetailProps {
  insight: any; // O tipo real virá da API, usaremos 'any' por enquanto
  onCancel: () => void;
}

export default function InsightDetail({ insight, onCancel }: InsightDetailProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showJson, setShowJson] = useState(false);

  // Exemplo de como formatar o JSON de entrada para exibição
  const formatJson = (json: any) => {
    return JSON.stringify(json, null, 2);
  };

  if (!insight) {
    return <p className="text-center text-red-500 mt-8">Insight não encontrado.</p>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Detalhes do Insight</h2>
        <button
            onClick={onCancel}
            className="w-full md:w-auto bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-xl shadow-md hover:bg-gray-400 transition-colors"
          >
            Voltar para a Lista
          </button>
        </div>
      <div className="bg-gray-100 p-6 rounded-xl shadow-inner mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Dados de Entrada para a IA</h3>
        <p className="text-sm text-gray-600 mb-4">
          Gerado em: {new Date(insight.dataGeracao).toLocaleDateString()}
        </p>
        <button 
            onClick={() => setShowJson(!showJson)}
            className="mt-4 text-xs text-blue-600 hover:text-blue-800 transition-colors"
        >
            {showJson ? 'Ocultar JSON Completo' : 'Visualizar JSON Completo (Dados Brutos)'}
        </button>
        {showJson && (
          <pre className="bg-gray-800 text-green-300 p-4 rounded-lg overflow-x-auto text-xs mt-3 max-h-64 whitespace-pre-wrap">
            {insight.jsonInput ? formatJson(insight.jsonInput) : 'Nenhum JSON de entrada disponível.'}
          </pre>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Análise da IA Gemini</h3>
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
          <p className="text-gray-800 whitespace-pre-wrap">{insight.textoInsight}</p>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={onCancel}
          className="w-full md:w-auto bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-xl shadow-md hover:bg-gray-400 transition-colors"
        >
          Voltar para a Lista
        </button>
      </div>
    </div>
  );
}