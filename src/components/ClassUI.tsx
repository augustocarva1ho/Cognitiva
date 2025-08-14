"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ClassUI() {
  const [selectedTurma, setSelectedTurma] = useState("");
  const [selectedAluno, setSelectedAluno] = useState("");
  const [temLaudo, setTemLaudo] = useState("não");
  const [tabela, setTabela] = useState([
    { materia: "", nota1: "", nota2: "", nota3: "", nota4: "" },
  ]);

  // Placeholder - futuramente vindo do banco
  const turmas = ["Turma A", "Turma B", "Turma C"];
  const alunosPorTurma: Record<string, string[]> = {
    "Turma A": ["João Silva", "Maria Souza"],
    "Turma B": ["Carlos Lima", "Fernanda Rocha"],
    "Turma C": ["Pedro Santos", "Ana Paula"],
  };
  const neurodivs = ["TDAH", "TEA", "Dislexia", "Outros"];

  const handleTabelaChange = (index: number, campo: string, valor: string) => {
    const novaTabela = [...tabela];
    // @ts-ignore
    novaTabela[index][campo] = valor;
    setTabela(novaTabela);
  };

  const adicionarLinha = () => {
    setTabela([...tabela, { materia: "", nota1: "", nota2: "", nota3: "", nota4: "" }]);
  };

  const removerLinha = (index: number) => {
    setTabela(tabela.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6">
      {/* Seleção de Turma */}
      <label className="block mb-2 font-bold">Selecione a Turma:</label>
      <select
        value={selectedTurma}
        onChange={(e) => {
          setSelectedTurma(e.target.value);
          setSelectedAluno("");
        }}
        className="border p-2 rounded w-64"
      >
        <option value="">-- Nenhuma --</option>
        {turmas.map((turma) => (
          <option key={turma} value={turma}>{turma}</option>
        ))}
      </select>

      {/* Seleção de Aluno */}
      {selectedTurma && (
        <div className="mt-4">
          <label className="block mb-2 font-bold">Selecione o Aluno:</label>
          <select
            value={selectedAluno}
            onChange={(e) => setSelectedAluno(e.target.value)}
            className="border p-2 rounded w-64"
          >
            <option value="">-- Nenhum --</option>
            {alunosPorTurma[selectedTurma]?.map((aluno) => (
              <option key={aluno} value={aluno}>{aluno}</option>
            ))}
          </select>
        </div>
      )}

      {/* Conteúdo do Aluno */}
      <AnimatePresence>
        {selectedAluno && (
          <motion.div
            className="mt-6 flex gap-8"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
          >
            {/* Coluna Esquerda */}
            <div className="w-1/3 bg-gray-100 p-4 rounded shadow">
              <img
                src="/placeholder-profile.png"
                alt="Foto do aluno"
                className="w-32 h-32 mx-auto rounded-full bg-gray-300"
              />
              <h2 className="text-center font-bold mt-4">{selectedAluno}</h2>

              <label className="block mt-4">Possui laudo?</label>
              <select
                value={temLaudo}
                onChange={(e) => setTemLaudo(e.target.value)}
                className="border p-2 rounded w-full"
              >
                <option value="não">Não</option>
                <option value="sim">Sim</option>
              </select>

              {temLaudo === "sim" && (
                <div className="mt-4">
                  <label className="block mb-2">Tipo de Neurodivergência:</label>
                  <select multiple className="border p-2 rounded w-full h-24">
                    {neurodivs.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Coluna Direita */}
            <div className="w-2/3 bg-white p-4 rounded shadow">
              <table className="w-full border mb-4">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2">Matéria</th>
                    <th className="border p-2">1º Bim</th>
                    <th className="border p-2">2º Bim</th>
                    <th className="border p-2">3º Bim</th>
                    <th className="border p-2">4º Bim</th>
                    <th className="border p-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {tabela.map((linha, index) => (
                    <tr key={index}>
                      {["materia", "nota1", "nota2", "nota3", "nota4"].map((campo) => (
                        <td key={campo} className="border p-2">
                          <input
                            type="text"
                            value={(linha as any)[campo]}
                            onChange={(e) => handleTabelaChange(index, campo, e.target.value)}
                            className="border p-1 w-full"
                          />
                        </td>
                      ))}
                      <td className="border p-2 text-center">
                        <button
                          onClick={() => removerLinha(index)}
                          className="bg-red-500 text-white px-2 py-1 rounded"
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                onClick={adicionarLinha}
                className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
              >
                Adicionar Linha
              </button>

              <label className="block font-bold">Observações:</label>
              <textarea className="border w-full p-2 rounded mb-4" rows={3} />

              <label className="block font-bold">Atribuir Atividade:</label>
              <div className="flex gap-2 mb-4">
                <select className="border p-2 rounded w-1/3">
                  <option value="">Selecione a Matéria</option>
                  <option>Matemática</option>
                  <option>Português</option>
                  <option>Ciências</option>
                </select>
                <input
                  type="number"
                  placeholder="Nota"
                  className="border p-2 rounded w-20"
                />
                <input
                  type="text"
                  placeholder="Avaliação escrita"
                  className="border p-2 rounded flex-1"
                />
              </div>

              {/* Botões */}
              <div className="flex gap-4">
                <button className="bg-purple-500 text-white px-4 py-2 rounded">
                  Gerar Relatório
                </button>
                <button className="bg-yellow-500 text-white px-4 py-2 rounded">
                  Identificar
                </button>
                <button className="bg-green-500 text-white px-4 py-2 rounded">
                  Salvar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
