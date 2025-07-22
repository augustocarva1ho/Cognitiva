import Image from "next/image";
import Top from "../components/Top";
import Bot from "@/components/Bot";

export default function Home() {
  return (    
    <div className=" items-center justify-items-center min-h-screen pb-20 gap-16 font-[family-name:var(--font-geist-sans)]">
      <Top/>
      <main className="flex gap-[32px] row-start-2 items-center sm:items-start mt-16">
          <div>
            <div className="flex gap-3 items-baseline">
              <h1 className="text-4xl text-zinc-700 font-bold">Olá, Bem vindo à</h1>
              <h1 className="text-5xl text-green-300 font-bold">COGNITIVA</h1>
            </div> 
            <div className="flex flex-col w-[560px] mt-4 gap-4 text-zinc-600 font-medium">           
              <p className="px-3 break-words whitespace-normal">A COGNITIVA é uma plataforma inteligente dedicada ao acompanhamento educacional de alunos neurodivergentes. Utilizando inteligência artificial, oferecemos análises personalizadas de desempenho academico e socioemocional, apoiando professores, gestores e famílias com insights precisos e recomendações ficazes. </p>
              <p className="px-3 break-words whitespace-normal">Aqui, a educação se adapta ás necessidades de cada aluno, promovendo inclusão, compreensão e desenvolvimento real.</p>
              <button className="bg-zinc-50 text-green-300 border-4 border-green-300 w-40 h-10 rounded-full hover:bg-green-100 transition">Saiba Mais</button>
            </div>
          </div>
          <div className="w-[560px] h-[660px] overflow-hidden rounded-3xl">
            <img src='./home-img-1.jpg' className="w-full h-full object-cover object-center"/>
          </div>
      </main>
      <Bot/>
    </div>
  );
}
