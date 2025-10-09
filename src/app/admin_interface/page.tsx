'use client'

import Top from "@/components/Top";
import Bot from "@/components/Bot";
import { JSX, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EscolasCreate from "@/components/AdminUI/EscolasCreate";
import UsersCreate from "@/components/AdminUI/Users/UsersCreate";
import StudentCreate from "@/components/AdminUI/Student/StudentCreate";

export default function UserInterface() {
  const [selected, setSelected] = useState<string>('Área da Turma');

  const menuItems = [
    'Gerenciar Escolas',
    'Gerenciar Docentes',
    'Gerenciar Turmas',
    'Gerenciar Alunos',
  ];
  const contentMap: Record<string, JSX.Element> = {
    "Gerenciar Escolas": <EscolasCreate/>,
    "Gerenciar Docentes": <UsersCreate/>,
    "Gerenciar Turmas": <div>📝 Gerenciar Turmas</div>,
    "Gerenciar Alunos": <StudentCreate/>,
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
