'use client'

import Top from "@/components/Top";
import Bot from "@/components/Bot";
import { JSX, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EscolasCreate from "@/components/AdminUI/EscolasCreate";
import ClassUI from "@/components/ClassUI";
import UsersManager from "@/components/AdminUI/Users/UsersManager";
import ClassManager from "@/components/AdminUI/Class/ClassManager";
import StudentManager from "@/components/AdminUI/Student/StudentManager";
import SubjectManager from "@/components/AdminUI/Subject/SubjectManager";
import ActivitiesManager from "@/components/AdminUI/Activitie/ActivitiesManager";

export default function UserInterface() {
  const [selected, setSelected] = useState<string>('Área da Turma');

  // Menu com TODAS as opções (Professor + Supervisor + Admin)
  const menuItems = [
    // Professor
    'Área da Turma',
    'Gerar Insight',
    'Gerir Atividades',
    'Comunicação',

    // Admin / Supervisor
    'Gerenciar Escolas',
    'Gerenciar Docentes',
    'Gerenciar Turmas',
    'Gerenciar Alunos',
    'Gerenciar Matérias',
  ];

  // Conteúdos de cada opção
  const contentMap: Record<string, JSX.Element> = {
    // Professor
    "Área da Turma": <ClassUI/>,
    "Gerar Insight": <div>💡 Ferramenta de Insights</div>,
    "Gerir Atividades": <ActivitiesManager/>,
    "Comunicação": <div>💬 Painel de Comunicação</div>,

    // Admin / Supervisor
    "Gerenciar Escolas": <EscolasCreate/>,
    "Gerenciar Docentes": <UsersManager/>,
    "Gerenciar Turmas": <ClassManager/>,
    "Gerenciar Alunos": <StudentManager/>,
    "Gerenciar Matérias": <SubjectManager/>
  };

  return (  
    <div className="flex flex-col overflow-x-hidden min-h-screen">
      <div className="pt-20 items-center justify-items-center gap-16 font-[family-name:var(--font-geist-sans)]">
        <Top/>
        <div className="flex min-h-[calc(100vh)] bg-zinc-50">
          {/* Menu lateral */}
          <aside className="w-64 bg-white border-r border-zinc-200">
            <nav className="flex flex-col">
              {menuItems.map((item) => (
                <button
                  key={item}
                  onClick={() => setSelected(item)}
                  className={`w-full py-3 px-4 text-left transition-colors duration-200
                    ${
                      selected === item
                        ? "bg-green-300 text-zinc-50 font-semibold"
                        : "bg-white text-zinc-600 hover:bg-green-300 hover:text-zinc-50"
                    }`}
                >
                  {item}
                </button>
              ))}
            </nav>
          </aside>

          {/* Área de conteúdo */}
          <main className="flex-1 p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={selected}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full flex items-center justify-center text-lg text-zinc-700"
              >
                {contentMap[selected]}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>  
      <Bot/>
    </div>
  );
}
