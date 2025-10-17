// 'use client'

// import { useState } from "react";

// export default function SchoolCreate() {
//   const [formData, setFormData] = useState({
//     nome: "",
//     endereco: "",
//     niveis: [] as string[],
//   });

//   const niveisEnsino = ["Pré-escola", "Fundamental I", "Fundamental II", "Médio"];

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const selected = Array.from(e.target.selectedOptions, (option) => option.value);
//     setFormData((prev) => ({ ...prev, niveis: selected }));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log("Dados enviados:", formData);
//     // Aqui você pode integrar com sua API ou backend futuramente
//     alert("Escola cadastrada com sucesso!");
//     setFormData({ nome: "", endereco: "", niveis: [] }); // reset
//   };

//   return (
//     <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-md p-6">
//       <h2 className="text-2xl font-bold text-green-300 mb-6">Cadastrar Nova Escola</h2>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         {/* Nome da Escola */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Nome da Escola
//           </label>
//           <input
//             type="text"
//             name="nome"
//             value={formData.nome}
//             onChange={handleChange}
//             required
//             className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-300 focus:outline-none"
//           />
//         </div>

//         {/* Endereço */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Endereço da Escola
//           </label>
//           <input
//             type="text"
//             name="endereco"
//             value={formData.endereco}
//             onChange={handleChange}
//             required
//             className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-300 focus:outline-none"
//           />
//         </div>

//         {/* Nível de ensino */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Nível de Ensino
//           </label>
//           <select
//             multiple
//             value={formData.niveis}
//             onChange={handleSelectChange}
//             className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-green-300 focus:outline-none"
//           >
//             {niveisEnsino.map((nivel) => (
//               <option key={nivel} value={nivel}>
//                 {nivel}
//               </option>
//             ))}
//           </select>
//           <p className="text-xs text-gray-500 mt-1">
//             Segure <kbd>Ctrl</kbd> (ou <kbd>Cmd</kbd> no Mac) para selecionar mais de um.
//           </p>
//         </div>

//         {/* Botão salvar */}
//         <button
//           type="submit"
//           className="w-full bg-green-300 text-white font-semibold py-2 px-4 rounded-xl shadow hover:bg-green-600 transition-colors"
//         >
//           Salvar
//         </button>
//       </form>
//     </div>
//   );
// }
