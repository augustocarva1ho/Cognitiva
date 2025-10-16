'use client'

import Top from "@/components/Top";
import Bot from "@/components/Bot";
import { JSX, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EscolasCreate from "@/components/AdminUI/EscolasCreate";
import ClassUI from "@/components/ClassUI";
import UsersManager from "@/components/AdminUI/Users/UsersManager";
import ClassManager from "@/components/AdminUI/Class/ClassManager";
import StudentManager from "@/components/AdminUI/Student/StudentManager";
import SubjectManager from "@/components/AdminUI/Subject/SubjectManager";
import ActivitiesManager from "@/components/AdminUI/Activitie/ActivitiesManager";
import InsightManager from "@/components/AdminUI/Insights/InsightManager";
import { useAuth } from "@/context/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import { useRouter } from "next/navigation";


// Definição dos menus e conteúdos para cada nível de acesso
// Usamos os nomes exatos do banco: "Administrador", "Supervisor", "Professor"
const allMenuItems = [
    // Professor (Nível 3)
    { title: 'Área da Turma', component: <ClassUI />, roles: ['Professor', 'Supervisor', 'Administrador'] },
    { title: 'Gerar Insight', component: <InsightManager />, roles: ['Professor', 'Supervisor', 'Administrador'] },
    { title: 'Gerir Atividades', component: <ActivitiesManager />, roles: ['Professor', 'Supervisor', 'Administrador'] },
    { title: 'Comunicação', component: <div>💬 Painel de Comunicação</div>, roles: ['Professor', 'Supervisor', 'Administrador'] },
    { title: 'Gerenciar Alunos', component: <StudentManager />, roles: ['Professor', 'Supervisor', 'Administrador'] },
    
    // Supervisor (Nível 2)
    { title: 'Gerenciar Docentes', component: <UsersManager />, roles: ['Supervisor', 'Administrador'] },
    { title: 'Gerenciar Turmas', component: <ClassManager />, roles: ['Supervisor', 'Administrador'] },
    { title: 'Gerenciar Matérias', component: <SubjectManager />, roles: ['Supervisor', 'Administrador'] },

    // Admin (Nível 1)
    { title: 'Gerenciar Escolas', component: <EscolasCreate />, roles: ['Administrador'] },
];

function UserInterfaceContent() {
    const { user, isLoadingAuth } = useAuth(); // Assume que useAuth retorna isLoadingAuth
    const [selected, setSelected] = useState<string>('Área da Turma');

    // CORRIGIDO: user.acesso é a string da role ('Administrador', 'Supervisor', etc.)
    const userRole = user?.acesso || '';
    
    // Filtra os itens do menu com base no nível de acesso do usuário
    const filteredMenuItems = userRole ? allMenuItems.filter(item => item.roles.includes(userRole)) : [];
    
    const contentMap = Object.fromEntries(
        filteredMenuItems.map(item => [item.title, item.component])
    );
    
    // Assegura que o item selecionado existe no menu filtrado
    useEffect(() => {
        if (filteredMenuItems.length > 0 && !filteredMenuItems.some(item => item.title === selected)) {
            setSelected(filteredMenuItems[0].title);
        }
    }, [filteredMenuItems, selected]);

    if (isLoadingAuth) {
        // Se ainda estiver carregando a autenticação, mostre um loading para evitar piscar
        return <div className="p-8 text-center text-zinc-500">Aguardando validação de sessão...</div>;
    }

    if (!userRole) {
        // Isso não deve acontecer se o AuthGuard estiver funcionando, mas é uma segurança
        return <div className="p-8 text-center text-red-500">Acesso Negado.</div>;
    }

    return (
        <div className="flex flex-col overflow-x-hidden min-h-screen">
            <div className="pt-20 items-center justify-items-center gap-16 font-[family-name:var(--font-geist-sans)]">
                <Top/>
                <div className="flex min-h-[calc(100vh)] bg-zinc-50">
                    {/* Menu lateral */}
                    <aside className="w-64 bg-white border-r border-zinc-200">
                        <nav className="flex flex-col">
                            {filteredMenuItems.map((item) => (
                                <button
                                    key={item.title}
                                    onClick={() => setSelected(item.title)}
                                    className={`w-full py-3 px-4 text-left transition-colors duration-200
                                        ${
                                            selected === item.title
                                                ? "bg-green-300 text-zinc-50 font-semibold"
                                                : "bg-white text-zinc-600 hover:bg-green-300 hover:text-zinc-50"
                                        }`}
                                >
                                    {item.title}
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
                                className="min-h-[80vh] flex items-start text-lg text-zinc-700"
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

// O componente de página agora usa o AuthGuard para proteção de rota
export default function UserInterface() {
    // Redireciona para o login se não estiver logado
    return <AuthGuard Component={UserInterfaceContent} allowedRoles={['Professor', 'Supervisor', 'Administrador']} />;
}
