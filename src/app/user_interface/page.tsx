    'use client'

    import Top from "@/components/Top";
    import Bot from "@/components/Bot";
    import { JSX, useState, useEffect, useCallback } from "react"; // Adicionado useCallback
    import { motion, AnimatePresence } from "framer-motion";
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
    import SchoolView from "@/components/AdminUI/Schools/SchoolView";
    import SchoolManager from "@/components/AdminUI/Schools/SchoolManager";

    // Definição da interface Escola
    interface Escola {
        id: string;
        nome: string;
    }

    // Definição dos menus e conteúdos para cada nível de acesso
    // Usamos os nomes exatos do banco: "Administrador", "Supervisor", "Professor"
    const allMenuItems = [
        // Professor (Nível 3)
        { title: 'Área da Turma', component: <ClassUI />, roles: ['Professor', 'Supervisor', 'Administrador'] },
        { title: 'Gerar Insight', component: <InsightManager />, roles: ['Professor', 'Supervisor', 'Administrador'] },
        { title: 'Gerir Atividades', component: <ActivitiesManager />, roles: ['Professor', 'Supervisor', 'Administrador'] },
        { title: 'Gerenciar Alunos', component: <StudentManager />, roles: ['Professor', 'Supervisor', 'Administrador'] },
        
        // Supervisor (Nível 2)
        { title: 'Gerenciar Docentes', component: <UsersManager />, roles: ['Supervisor', 'Administrador'] },
        { title: 'Gerenciar Turmas', component: <ClassManager />, roles: ['Supervisor', 'Administrador'] },
        { title: 'Gerenciar Matérias', component: <SubjectManager />, roles: ['Supervisor', 'Administrador'] },
        { title: 'Gerenciar Escolas', component: <SchoolView />, roles: ['Supervisor', 'Professor']},

        // Admin (Nível 1)
        { title: 'Gerenciar Escolas', component: <SchoolManager />, roles: ['Administrador'] },
    ];

    function UserInterfaceContent() {
        // É CRUCIAL que o useAuth forneça viewingSchoolId e setViewingSchoolId.
        // Usaremos estados locais como placeholder, mas você deve movê-los para o AuthContext.
        const { user, isLoadingAuth, token, API_BASE_URL } = useAuth(); 
        const [selected, setSelected] = useState<string>('Área da Turma');

        // ESTADOS PARA A GESTÃO DE ESCOLA PELO ADMIN
        const [escolas, setEscolas] = useState<Escola[]>([]);
        const [loadingSchools, setLoadingSchools] = useState(false);
        const { viewingSchoolId, setViewingSchoolId } = useAuth();
        const [currentSchoolName, setCurrentSchoolName] = useState('...');

        const userRole = user?.acesso || '';
        const isAdmin = userRole === 'Administrador';
        
        // 1. Fetch Escolas se for Admin
        useEffect(() => {
            if (isAdmin && token) {
                setLoadingSchools(true);
                fetch(`${API_BASE_URL}/api/escolas`, { headers: { Authorization: `Bearer ${token}` } })
                    .then(res => res.json())
                    .then((data: Escola[]) => {
                        setEscolas(data);
                        // Inicializa a escola de visualização com a escola do Admin logado, se disponível
                        const initialSchoolId = user?.escolaId || data[0]?.id || null;
                        if (initialSchoolId) {
                            setViewingSchoolId(initialSchoolId);
                        }
                    })
                    .catch(err => console.error("Erro ao buscar escolas:", err))
                    .finally(() => setLoadingSchools(false));
            } else if (user?.escolaId) {
                // Garante que o nome da escola do usuário não-admin seja carregado, se não estiver no token
                setViewingSchoolId(user.escolaId);
            }
        }, [isAdmin, token, API_BASE_URL, user?.escolaId]);

        // 2. Atualiza o nome da escola
        useEffect(() => {
            let name = 'Carregando...';
            if (viewingSchoolId) {
                const school = escolas.find(e => e.id === viewingSchoolId);
                if (school) {
                    name = school.nome;
                } else if (!isAdmin && user?.escolaNome) { 
                    // Assumindo que o nome da escola do usuário logado virá no AuthContext
                    name = user.escolaNome;
                } else if (viewingSchoolId && !loadingSchools) {
                    // Se o nome não foi encontrado na lista (ex: Admin vendo escola que ainda não foi carregada)
                    name = `Escola ID: ${viewingSchoolId}`; 
                }
            }
            setCurrentSchoolName(name);
        }, [viewingSchoolId, escolas, isAdmin, loadingSchools, user?.escolaNome]);


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
            return <div className="p-8 text-center text-zinc-500">Aguardando validação de sessão...</div>;
        }

        if (!userRole) {
            return <div className="p-8 text-center text-red-500">Acesso Negado.</div>;
        }

        return (
            <div className="flex flex-col min-h-screen">
                <div className="pt-20 gap-16 font-[family-name:var(--font-geist-sans)]">
                    <Top/>                
                    

                    <div className="flex bg-zinc-50">
                        {/* Menu lateral */}
                        <aside className="w-64 bg-white flex flex-col border-r border-zinc-200">
                            {/* NOVO ELEMENTO DE SELEÇÃO DE ESCOLA */}
                            <div className="p-6 bg-white border-b border-zinc-200">
                                <h1 className="text-xl font-bold text-center text-green-400 mb-2">
                                    {currentSchoolName}
                                </h1>
                                
                                {/* DROP DOWN SÓ PARA ADMIN */}
                                {isAdmin && (
                                    <div className="flex justify-center mt-2">
                                        <select
                                            value={viewingSchoolId || ''}
                                            // AQUI: Esta mudança DEVE ser refletida globalmente via useAuth!
                                            onChange={(e) => setViewingSchoolId(e.target.value)} 
                                            disabled={loadingSchools}
                                            className="px-4 py-2 border bg-gray-50 text-gray-700 shadow-sm focus:ring-green-500 focus:border-green-500"
                                        >
                                            <option value="" disabled>
                                                {loadingSchools ? 'A carregar escolas...' : '-- Selecione a Escola --'}
                                            </option>
                                            {escolas.map(escola => (
                                                <option key={escola.id} value={escola.id}>
                                                    {escola.nome}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                
                                {/* Mensagem para não-Admin */}
                                {!isAdmin && (
                                    <p className="text-center text-sm text-gray-500 mt-1">
                                        Visualizando dados da sua escola.
                                    </p>
                                )}
                            </div>
                            {/* FIM NOVO ELEMENTO */}
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
                                    className="min-h-[80vh] min-w-[40hv] flex items-start text-lg text-zinc-700"
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