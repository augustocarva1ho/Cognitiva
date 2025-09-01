'use client'

import { useState } from "react";

export default function UsersCreate() {
  const [formData, setFormData] = useState({
    matricula: "",
    nome: "",
    idade: "",
    laudo: "",
    descrição: "",
    turma: [] as string[],
  });

  const turmasPlaceholder = ["Turma A", "Turma B", "Turma C"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData((prev) => ({ ...prev, turmas: selected }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Docente cadastrado:", formData);
    alert("Docente cadastrado com sucesso!");
    setFormData({
        matricula: "",
        nome: "",
        idade: "",
        laudo: "",
        descrição: "",
        turma: [],
    }); // reset
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-green-300 mb-6">Cadastrar Novo Aluno</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Código de Funcionário */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Matrícula do Aluno
          </label>
          <input
            type="text"
            name="codigo"
            value={formData.matricula}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
          />
        </div>

        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Aluno
          </label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
          />
        </div>

        {/* Idade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Idade do Aluno
          </label>
          <input
            type="text"
            name="idade"
            value={formData.idade}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
          />
        </div>

        {/* Laudo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Possui Laudo?
          </label>
          <input
            type="text"
            name="laudo"
            value={formData.laudo}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
          />
        </div>

        {/* descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <input
            type="password"
            name="descrição"
            value={formData.descrição}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
          />
        </div>

        {/* Turmas atribuídas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Turmas atribuídas
          </label>
          <select
            multiple
            value={formData.turma}
            onChange={handleSelectChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
          >
            {turmasPlaceholder.map((turma) => (
              <option key={turma} value={turma}>
                {turma}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Segure <kbd>Ctrl</kbd> (ou <kbd>Cmd</kbd> no Mac) para selecionar mais de um.
          </p>
        </div>

        {/* Botão salvar */}
        <button
          type="submit"
          className="w-full bg-green-300 text-white font-semibold py-2 px-4 rounded-xl shadow hover:bg-green-600 transition-colors"
        >
          Salvar
        </button>
      </form>
    </div>
  );
}
