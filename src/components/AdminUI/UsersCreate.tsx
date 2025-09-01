'use client'

import { useState } from "react";

export default function UsersCreate() {
  const [formData, setFormData] = useState({
    codigo: "",
    nome: "",
    email: "",
    cpf: "",
    senha: "",
    materia: "",
    turmas: [] as string[],
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
      codigo: "",
      nome: "",
      email: "",
      cpf: "",
      senha: "",
      materia: "",
      turmas: [],
    }); // reset
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-green-300 mb-6">Cadastrar Novo Docente</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Código de Funcionário */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Código de Funcionário
          </label>
          <input
            type="text"
            name="codigo"
            value={formData.codigo}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
          />
        </div>

        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Docente
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

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
          />
        </div>

        {/* CPF */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CPF
          </label>
          <input
            type="text"
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
          />
        </div>

        {/* Senha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Senha
          </label>
          <input
            type="password"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
          />
        </div>

        {/* Matéria */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Matéria
          </label>
          <input
            type="text"
            name="materia"
            value={formData.materia}
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
            value={formData.turmas}
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
