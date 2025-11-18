'use client';
import { useState, useEffect, useCallback, Fragment } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

// --- INTERFACES DE DADOS ---
interface Turma { id: string; Nome: string; escolaId: string; } // Adicionado escolaId
interface Materia { id: string; nome: string; }
interface Atividade { id: string; tipo: string; materia: Materia; notaMaxima: number; }
interface Observacao { id: string; texto: string; professorId: string; data: string; }
interface CondicaoAluno {
  id: string;
  nomeCondicao: string;
  statusComprovacao: string;
}

interface Aluno {
  id: string; Nome: string; Matricula: string; Idade: number; turmaId: string;
  turma: { Nome: string; id: string; };
  condicao: CondicaoAluno[];
}

interface NotaBimestral {
  bimestre: number;
  nota: number;
  recuperacao: boolean;
  materiaId: string;
  alunoId: string;
  materia: Materia;
}

interface Avaliacao {
  id: string;
  notaNumerica: number;
  avaliacaoEscrita: string | null;
  observacaoPrazo: string | null; 
  atividadeId: string;
  alunoId: string;
  atividade: Atividade;
}

// O componente principal
export default function ClassUI() {
  // Inclui viewingSchoolId para filtro e user
  const { API_BASE_URL, token, user, viewingSchoolId } = useAuth(); 
  const router = useRouter();

  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  
  // ESTADO FIXO E SELECIONADO: IDs e Objeto Aluno
  const [selectedTurmaId, setSelectedTurmaId] = useState('');
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingAlunoData, setLoadingAlunoData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [notasBimestrais, setNotasBimestrais] = useState<NotaBimestral[]>([]);
  const [observacaoTexto, setObservacaoTexto] = useState('');
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  
  const [novaAvaliacao, setNovaAvaliacao] = useState({
    atividadeId: '',
    notaNumerica: '' as number | '',
    avaliacaoEscrita: '',
    observacaoPrazo: '',
    error: '',
    loading: false,
  });

   // Função centralizada de busca (agora usa o viewingSchoolId)
  const fetchDependencies = useCallback(async () => {
    if (!token) return;

    // 1. Determina o ID de filtro
    const escolaIdParaFiltrar = user?.acesso === 'Administrador' ? viewingSchoolId : user?.escolaId;

    // Se o ID de filtro não for válido, bloqueia a busca (Admin sem seleção)
    if (!escolaIdParaFiltrar) {
        setTurmas([]);
        setAlunos([]);
        setMaterias([]);
        setAtividades([]);
        setLoading(false);
        return;
    }
    
    setLoading(true);
    setError(null);
    try {
      // Monta a URL de filtro para Turmas, Alunos, Matérias e Atividades
      const urlQuery = `?viewingSchoolId=${escolaIdParaFiltrar}`;
      const turmaUrl = `${API_BASE_URL}/api/turmas${urlQuery}`;
      const alunosUrl = `${API_BASE_URL}/api/alunos${urlQuery}`;
      const materiasUrl = `${API_BASE_URL}/api/materias${urlQuery}`;
      // CORRIGIDO: Adicionando o filtro de escola para a rota de Atividades
      const atividadesUrl = `${API_BASE_URL}/api/atividades${urlQuery}`; 

      const [turmasRes, alunosRes, materiasRes, atividadesRes] = await Promise.all([
        fetch(turmaUrl, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(alunosUrl, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(materiasUrl, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(atividadesUrl, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (turmasRes.ok) setTurmas(await turmasRes.json());
      if (alunosRes.ok) setAlunos(await alunosRes.json());
      if (materiasRes.ok) setMaterias(await materiasRes.json());
      if (atividadesRes.ok) setAtividades(await atividadesRes.json());
      
      // Reseta a seleção se a turma atual não pertencer à nova lista (após o Admin trocar de escola)
      if (selectedTurmaId && !turmas.some(t => t.id === selectedTurmaId)) {
          setSelectedTurmaId('');
          setSelectedAluno(null);
      }

    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError('Falha ao carregar dados iniciais.');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token, user?.acesso, user?.escolaId, viewingSchoolId, selectedTurmaId]); // Dependências

  // Re-executa o fetchDependencies sempre que o token ou o filtro de escola mudar
  useEffect(() => { fetchDependencies(); }, [fetchDependencies]);

  const fetchAlunoData = useCallback(async (alunoId: string) => {
    if (!token || !alunoId) return;
    setLoadingAlunoData(true);
    try {
      const [notasRes, observacoesRes, avaliacoesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/notasBimestrais/aluno/${alunoId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/observacoes/aluno/${alunoId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/avaliacoes/aluno/${alunoId}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (notasRes.ok) setNotasBimestrais(await notasRes.json());
      if (observacoesRes.ok) {
        const obsData = await observacoesRes.json();
        setObservacaoTexto(obsData?.texto || '');
      }
      if (avaliacoesRes.ok) setAvaliacoes(await avaliacoesRes.json());
    } catch (err) {
      console.error('Erro ao buscar dados do aluno:', err);
      setError('Falha ao carregar dados do aluno.');
    } finally {
      setLoadingAlunoData(false);
    }
  }, [API_BASE_URL, token]);

  useEffect(() => { if (selectedAluno) fetchAlunoData(selectedAluno.id); }, [selectedAluno, fetchAlunoData]);


  // ----------------------------------------------------
  // II. FUNÇÕES DE SALVAMENTO
  // ----------------------------------------------------
  
  const handleNotaChange = (materiaId: string, bimestre: number, field: 'nota' | 'recuperacao', value: any) => {
    const notaValue = field === 'nota' ? (value === '' ? undefined : parseFloat(value)) : undefined;
    
    setNotasBimestrais(prev => {
      const existingIndex = prev.findIndex(n => n.materiaId === materiaId && n.bimestre === bimestre);
      
      if (existingIndex > -1) {
        return prev.map((n, i) => i === existingIndex ? { ...n, [field]: field === 'nota' ? notaValue : value } : n);
      } else {
        const newNota: NotaBimestral = { 
          bimestre, materiaId, alunoId: selectedAluno!.id, 
          materia: materias.find(m => m.id === materiaId)!, 
          nota: 0, recuperacao: false 
        } as NotaBimestral;
        
        return [...prev, { ...newNota, [field]: field === 'nota' ? notaValue : value } as NotaBimestral];
      }
    });
  };

  const handleSalvarNotas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAluno) return;
    
    const notasToSave = notasBimestrais.filter(n => n.alunoId === selectedAluno.id);
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/notasBimestrais/salvarLote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ alunoId: selectedAluno.id, notas: notasToSave })
        });

        if (!response.ok) throw new Error("Erro ao salvar notas.");

        alert("Notas Bimestrais salvas com sucesso!");
        fetchAlunoData(selectedAluno.id);
    } catch (err) {
        alert("Falha ao salvar notas: " + (err as Error).message);
    }
  };

  const handleSalvarObservacao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAluno || !observacaoTexto) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/observacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          alunoId: selectedAluno.id, 
          professorId: user?.id,
          texto: observacaoTexto 
        })
      });
      if (!response.ok) throw new Error("Erro ao salvar observação.");

      alert("Observação salva com sucesso!");
      fetchAlunoData(selectedAluno.id);
    } catch (err) {
      alert("Falha ao salvar observação: " + (err as Error).message);
    }
  };

  const handleAvaliacaoSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const atividadeId = e.target.value;
    
    // 1. Busca a avaliação existente para esta atividade e aluno
    const avaliacaoExistente = avaliacoes.find(a => a.atividadeId === atividadeId);
    
    // 2. Reseta o formulário OU preenche com dados existentes
    if (avaliacaoExistente) {
      // Preenche com dados existentes
      setNovaAvaliacao(prev => ({
        ...prev,
        atividadeId: avaliacaoExistente.atividadeId,
        notaNumerica: avaliacaoExistente.notaNumerica,
        avaliacaoEscrita: avaliacaoExistente.avaliacaoEscrita || '',
        observacaoPrazo: avaliacaoExistente.observacaoPrazo || '',
        error: '',
        loading: false,
      }));
    } else {
      // Reseta para o estado inicial, mantendo apenas o ID da atividade
      setNovaAvaliacao(prev => ({
        ...prev,
        atividadeId: atividadeId,
        notaNumerica: '' as number | '',
        avaliacaoEscrita: '',
        observacaoPrazo: '', 
        error: '',
        loading: false,
      }));
    }
  };

  const handleSalvarAvaliacao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAluno || !novaAvaliacao.atividadeId || novaAvaliacao.notaNumerica === '') return;
    
    const payload = {
        alunoId: selectedAluno.id,
        atividadeId: novaAvaliacao.atividadeId,
        notaNumerica: Number(novaAvaliacao.notaNumerica),
        avaliacaoEscrita: novaAvaliacao.avaliacaoEscrita,
        observacaoPrazo: novaAvaliacao.observacaoPrazo, 
        professorId: user?.id,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/avaliacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Erro ao atribuir avaliação.");
      
      alert("Avaliação atribuída/atualizada com sucesso!");
      setNovaAvaliacao(prev => ({ ...prev, atividadeId: '', notaNumerica: '', avaliacaoEscrita: '', observacaoPrazo: '' }));
      fetchAlunoData(selectedAluno.id);
    } catch (err) {
      alert("Falha ao salvar avaliação: " + (err as Error).message);
    }
  };


  // ----------------------------------------------------
  // III. LÓGICA DE RENDERIZAÇÃO
  // ----------------------------------------------------

  const alunosDaTurma = selectedTurmaId
    ? alunos.filter((aluno) => aluno.turmaId === selectedTurmaId)
    : [];

  const handleTurmaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedTurmaId(e.target.value);
      setSelectedAluno(null); // Reseta o aluno selecionado
  };

  const handleSelectAluno = (alunoId: string) => {
    const aluno = alunos.find((a) => a.id === alunoId);
    setSelectedAluno(aluno || null);
  };

  const getNota = (materiaId: string, bimestre: number): Partial<NotaBimestral> => {
    return notasBimestrais.find(n => n.materiaId === materiaId && n.bimestre === bimestre) || { nota: undefined, recuperacao: false } as Partial<NotaBimestral>;
  }

  if (loading) { return <p className="text-center p-8">A carregar dados...</p>; }
  if (error) { return <p className="text-center p-8 text-red-500">Erro: {error}</p>; }

  return (
    <div className="w-full max-w-screen mx-auto p-6 bg-white rounded-2xl shadow-xl mt-4">
      {/* CABEÇALHO FIXO: Seleção de Turma e Aluno */}
      <div className="top-0 z-10 bg-white p-4 mb-6 border-b shadow-sm">
        <div className="flex gap-4 items-center px-6 "> 
          
          {/* Seleção de Turma */}
          <div>
            <label className="block mb-1 text-sm font-bold">Turma:</label>
            <select
              value={selectedTurmaId}
              onChange={handleTurmaChange}
              className="border p-2 rounded w-48"
            >
              <option value="">-- Selecione --</option>
              {turmas.map((turma) => (
                <option key={turma.id} value={turma.id}>
                  {turma.Nome}
                </option>
              ))}
            </select>
          </div>

          {/* Seleção de Aluno */}
          { (
            <div>
              <label className="block mb-1 text-sm font-bold">Aluno:</label>
              <select
                value={selectedAluno?.id || ''}
                onChange={(e) => handleSelectAluno(e.target.value)}
                className="border p-2 rounded w-48"
                disabled={loadingAlunoData || alunosDaTurma.length === 0}
              >
                <option value="">-- Selecione --</option>
                {alunosDaTurma.map((aluno) => (
                  <option key={aluno.id} value={aluno.id}>
                    {aluno.Nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Exibição do Nome do Aluno Selecionado (Simplesmente para fixar a informação) */}
          {selectedAluno && (
              <h2 className="ml-auto text-2xl font-extrabold text-green-400 border-b shadow-sm px-6">
                  {selectedAluno.Nome}
              </h2>
          )}
        </div>
      </div>
      {/* FIM CABEÇALHO FIXO */}

      {/* Conteúdo do Aluno */}
      <AnimatePresence>
        {selectedAluno ? (
          <motion.div
            className="p-6 flex gap-8" // Adicionado p-6 aqui para o conteúdo
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
          >
            {/* Coluna Esquerda: Dados do Aluno */}
            <div className="w-1/3 bg-gray-100 p-4 rounded shadow">
              <h2 className="text-center font-bold text-xl mt-4">{selectedAluno.Nome}</h2>
              <p className="text-center text-sm text-gray-600">Matrícula: {selectedAluno.Matricula}</p>
              <p className="text-center text-sm text-gray-600">Idade: {selectedAluno.Idade || 'N/A'}</p>
              
              <hr className="my-4"/>
              
              {/* Lógica de Observações */}
              <h3 className="font-bold">Observações do Professor</h3>
              <form onSubmit={handleSalvarObservacao}>
                <textarea 
                  className="border w-full p-2 rounded mt-2 mb-2" 
                  rows={4}
                  value={observacaoTexto}
                  onChange={(e) => setObservacaoTexto(e.target.value)}
                  disabled={loadingAlunoData}
                />
                <button type="submit" className="bg-green-500 text-white w-full px-4 py-2 rounded" disabled={loadingAlunoData}>
                  Salvar Observação
                </button>
              </form>
              
              {/* Lógica de Laudos */}
              <hr className="my-4"/>
              <h3 className="font-bold">Condições Médicas</h3>
              
              {selectedAluno.condicao && selectedAluno.condicao.length > 0 ? (
                  <div className="space-y-2 mt-2">
                      {selectedAluno.condicao.map((condicao) => (
                          <div key={condicao.id} className="p-3 bg-gray-200 rounded-lg">
                              <p className="font-medium">{condicao.nomeCondicao}</p>
                              <p className="text-xs text-gray-600">Status: {condicao.statusComprovacao}</p>
                          </div>
                      ))}
                  </div>
              ) : (
                  <p className="text-sm text-gray-500 mt-2">Nenhuma condição cadastrada.</p>
              )}
            </div>

            {/* Coluna Direita: Notas e Atividades */}
            <div className="w-2/3 bg-white p-4 rounded shadow">
              <h3 className="font-bold mb-2">Notas Bimestrais</h3>
              <form onSubmit={handleSalvarNotas}>
                <div className="overflow-x-auto">
                    <table className="w-full border mb-4 table-fixed text-sm">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="border p-2 w-[150px] text-left">Matéria</th>
                          <th className="border p-2 w-[80px] text-center">1º Bim</th>
                          <th className="border p-2 w-[50px] text-center">Rec.</th>
                          <th className="border p-2 w-[80px] text-center">2º Bim</th>
                          <th className="border p-2 w-[50px] text-center">Rec.</th>
                          <th className="border p-2 w-[80px] text-center">3º Bim</th>
                          <th className="border p-2 w-[50px] text-center">Rec.</th>
                          <th className="border p-2 w-[80px] text-center">4º Bim</th>
                          <th className="border p-2 w-[50px] text-center">Rec.</th>
                        </tr>
                      </thead>

                      <tbody>
                        {materias.map((materia) => (
                          <tr key={materia.id}>
                            <td className="border p-2 font-medium">{materia.nome}</td>
                            {[1, 2, 3, 4].map(bimestre => {
                              const nota = getNota(materia.id, bimestre);
                              return (
                                <Fragment key={bimestre}>
                                  <td className="border p-1 text-center">
                                    <input
                                      type="number"
                                      min="0" max="10" step="0.1"
                                      className="border p-1 w-12 text-sm"
                                      value={nota.nota || ''}
                                      onChange={(e) => handleNotaChange(materia.id, bimestre, 'nota', e.target.value)}
                                      disabled={loadingAlunoData}
                                    />
                                  </td>
                                  <td className="border p-1 text-center">
                                    <input
                                      type="checkbox"
                                      className="h-4 w-4"
                                      checked={nota.recuperacao || false}
                                      onChange={(e) => handleNotaChange(materia.id, bimestre, 'recuperacao', e.target.checked)}
                                      disabled={loadingAlunoData}
                                    />
                                  </td>
                                </Fragment>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded" disabled={loadingAlunoData}>
                  Salvar Notas Bimestrais
                </button>
              </form>
              
              <hr className="my-6"/>
              
              <h3 className="font-bold mb-2">Atribuição de Atividade</h3>
              <form onSubmit={handleSalvarAvaliacao}>
                {/* Seleção de atividade */}
                <div className="flex gap-2 mb-2">
                  <select 
                    className="border p-2 rounded flex-1"
                    value={novaAvaliacao.atividadeId}
                    onChange={handleAvaliacaoSelectChange}
                    disabled={loadingAlunoData}
                    required
                  >
                    <option value="">Selecione a Atividade</option>
                    {atividades.map(ativ => (
                      <option key={ativ.id} value={ativ.id}>{ativ.tipo} - {ativ.materia.nome} (Max: {ativ.notaMaxima})</option>
                    ))}
                  </select>
                  <input 
                    type="number" 
                    placeholder="Nota" 
                    className="border p-2 rounded w-20" 
                    value={novaAvaliacao.notaNumerica}
                    onChange={(e) => setNovaAvaliacao(prev => ({ ...prev, notaNumerica: Number(e.target.value) }))}
                    disabled={loadingAlunoData}
                    required
                    min="0"
                    max={atividades.find(a => a.id === novaAvaliacao.atividadeId)?.notaMaxima || 10}
                    step="0.1"
                  />
                </div>
                
                {/* Avaliação escrita */}
                <textarea 
                  className="border w-full p-2 rounded mb-2" 
                  rows={2} 
                  placeholder="Avaliação escrita"
                  value={novaAvaliacao.avaliacaoEscrita}
                  onChange={(e) => setNovaAvaliacao(prev => ({ ...prev, avaliacaoEscrita: e.target.value }))}
                  disabled={loadingAlunoData}
                ></textarea>
                
                {/* Campo "Observações sobre o Prazo/Entrega" */}
                <div className="flex flex-col gap-1 mb-4">
                  <label htmlFor="observacaoPrazo" className="text-sm font-medium">Observações sobre o Prazo/Entrega:</label>
                  <textarea 
                    id="observacaoPrazo"
                    placeholder="Ex: Entregue com 1 dia de atraso. Baseado neste campo, o sistema deduz se foi entregue no prazo."
                    value={novaAvaliacao.observacaoPrazo}
                    onChange={(e) => setNovaAvaliacao(prev => ({ ...prev, observacaoPrazo: e.target.value }))}
                    disabled={loadingAlunoData}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
                    rows={1}
                  />
                </div>

                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded" disabled={loadingAlunoData}>
                  Salvar Avaliação
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
             <p className="mt-8 text-lg text-gray-600 text-center">
                 Selecione uma turma e um aluno acima para visualizar e gerenciar os dados.
             </p>
        )}
      </AnimatePresence>
    </div>
  );
}
