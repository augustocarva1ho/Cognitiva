'use client'
import Image from "next/image";
import Top from "../components/Top";
import Bot from "@/components/Bot";
import { useEffect, useState } from 'react'

export default function Home() {
  const [nomes, setNomes] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/')
      .then(res => res.json())
      .then(data => setNomes(data.map((item: { Nome: string }) => item.Nome)))
      .catch(console.error)
  }, [])

  const scrollToSobreNos = () => {
    const element = document.getElementById("sobre-nos");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (    
    <div className="pt-20 items-center justify-items-center min-h-screen pb-20 gap-16 font-[family-name:var(--font-geist-sans)]">
      <Top/>
      <div id="home" className="flex gap-[32px] row-start-2 items-center sm:items-start mt-16">
          <div>
            <div className="flex gap-3 items-baseline">
              <h1 className="text-4xl text-zinc-700 font-bold">Olá, Bem vindo à</h1>
              <h1 className="text-5xl text-green-300 font-bold">COGNITIVA</h1>
              {/*TESTE DE CONSUMO DA API*/}
              {/* <ul className="list-disc list-inside">
                <p>nomes: </p>
                {nomes.map((nome, idx) => (
                  <li key={idx}>{nome}</li>
                ))}
              </ul> */}
            </div> 
            <div className="flex flex-col w-[560px] mt-4 gap-4 text-zinc-600 font-medium">           
              <p className="px-3 break-words whitespace-normal">A COGNITIVA é uma plataforma inteligente dedicada ao acompanhamento educacional de alunos neurodivergentes. Utilizando inteligência artificial, oferecemos análises personalizadas de desempenho academico e socioemocional, apoiando professores, gestores e famílias com insights precisos e recomendações ficazes. </p>
              <p className="px-3 break-words whitespace-normal">Aqui, a educação se adapta ás necessidades de cada aluno, promovendo inclusão, compreensão e desenvolvimento real.</p>
              <button onClick={scrollToSobreNos} className="bg-zinc-50 text-green-300 border-4 border-green-300 w-40 h-10 rounded-full hover:bg-green-300 hover:text-zinc-50 transition">Saiba Mais</button>
            </div>
          </div>
          <div className="w-[560px] h-[600px] overflow-hidden rounded-3xl">
            <img src='./home-img-1.jpg' className="w-full h-full object-cover object-center"/>
          </div>          
      </div>
      <div id="sobre-nos" className="flex gap-[32px] row-start-2 items-center sm:items-start mt-16">
        <div className="w-[560px] h-[600px] overflow-hidden rounded-3xl">
            <img src='./home-img-1.jpg' className="w-full h-full object-cover object-center"/>
        </div>
        <div>
            <div className="flex gap-3 items-baseline">
              <h1 className="text-4xl text-zinc-700 font-bold">Quem somos?</h1>
            </div> 
            <div className="flex flex-col w-[560px] mt-4 gap-4 text-zinc-600 font-medium">           
              <p className="px-3 break-words whitespace-normal">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus malesuada viverra ipsum sed sollicitudin. Integer non est orci. Proin eu enim placerat lorem auctor ultricies. Phasellus eu elementum erat. Mauris id libero sem. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Praesent ex justo, porta vitae venenatis nec, bibendum et ipsum. Vivamus mi est, auctor a leo sit amet, bibendum condimentum sem. </p>
              <p className="px-3 break-words whitespace-normal">Nullam risus nisi, finibus a libero non, vehicula aliquet risus. Vestibulum sit amet sodales ex. Praesent quis mi aliquam, interdum felis venenatis, malesuada leo. Nunc semper lorem in metus varius vestibulum. Aenean vel scelerisque massa. Praesent lacinia ipsum vitae sollicitudin fringilla. Duis mollis vel massa sit amet vestibulum. Nunc ac ullamcorper ipsum. Suspendisse accumsan vel enim ac venenatis. In hac habitasse platea dictumst. Curabitur porttitor rhoncus felis, id vulputate neque hendrerit quis.</p>
            </div>
          </div>
      </div>
      <div id="noticias" className="gap-[32px] items-center justify-items-center mt-16">
        <div className=" gap-3 items-baseline">
          <h1 className="text-4xl text-zinc-700 font-bold">Notícias e Novidades</h1>
        </div> 
        <div className="w-[1120px] mt-4 gap-4 text-zinc-600 font-medium">           
          <p className="px-3 break-words whitespace-normal">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus malesuada viverra ipsum sed sollicitudin. Integer non est orci. Proin eu enim placerat lorem auctor ultricies. Phasellus eu elementum erat. Mauris id libero sem. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Praesent ex justo, porta vitae venenatis nec, bibendum et ipsum. Vivamus mi est, auctor a leo sit amet, bibendum condimentum sem. </p>
          <p className="px-3 break-words whitespace-normal">Nullam risus nisi, finibus a libero non, vehicula aliquet risus. Vestibulum sit amet sodales ex. Praesent quis mi aliquam, interdum felis venenatis, malesuada leo. Nunc semper lorem in metus varius vestibulum. Aenean vel scelerisque massa. Praesent lacinia ipsum vitae sollicitudin fringilla. Duis mollis vel massa sit amet vestibulum. Nunc ac ullamcorper ipsum. Suspendisse accumsan vel enim ac venenatis. In hac habitasse platea dictumst. Curabitur porttitor rhoncus felis, id vulputate neque hendrerit quis.</p>
        </div>
      </div>
      <div id="contato" className="gap-[32px] items-center justify-items-center mt-16 mb-16">
        <div className=" gap-3 items-baseline">
          <h1 className="text-4xl text-zinc-700 font-bold">Entre em Contato Conosco</h1>
        </div> 
        <div className="w-[1120px] mt-4 gap-4 text-zinc-600 font-medium">           
          <p className="px-3 break-words whitespace-normal">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus malesuada viverra ipsum sed sollicitudin. Integer non est orci. Proin eu enim placerat lorem auctor ultricies. Phasellus eu elementum erat. Mauris id libero sem. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Praesent ex justo, porta vitae venenatis nec, bibendum et ipsum. Vivamus mi est, auctor a leo sit amet, bibendum condimentum sem. </p>
        </div>
      </div>
      <Bot/>
    </div>
  );
}
