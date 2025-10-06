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
              <p className="px-3 break-words whitespace-normal">A COGNITIVA é uma plataforma inteligente criada para acompanhar, compreender e potencializar o aprendizado de alunos neurodivergentes.
Unimos tecnologia e sensibilidade humana para oferecer uma experiência educacional realmente adaptada às necessidades individuais de cada estudante. <br /> <br />

Por meio de inteligência artificial e análise de dados educacionais, a plataforma interpreta informações acadêmicas e socioemocionais, transformando-as em insights personalizados e recomendações práticas.
</p>
              <p className="px-3 break-words whitespace-normal">Aqui, a educação se molda às necessidades de cada aluno, valorizando a diversidade como base para o aprendizado.
Promovemos inclusão, empatia e equidade, unindo escolas, famílias e tecnologia em uma jornada de ensino mais humana e significativa. <br /><br /> Interessado em nosso serviço? Clique em Saiba Mais, e veja como funciona nossa aplicação!</p>
              <button onClick={scrollToSobreNos} className="bg-zinc-50 text-green-300 border-4 border-green-300 w-40 h-10 rounded-full hover:bg-green-300 hover:text-zinc-50 transition">Saiba Mais</button>
            </div>
          </div>
          <div className="w-[560px] h-[600px] overflow-hidden rounded-3xl">
            <img src='./home-img-1.jpg' className="w-full h-full object-cover object-center"/>
          </div>          
      </div>
      <div id="sobre-nos" className="flex gap-[32px] row-start-2 items-center sm:items-start mt-16">
        <div className="w-[560px] h-[600px] overflow-hidden rounded-3xl">
            <img src='./uma-ilustracao-de-um-grupo-de-pessoas-em-uma-sala-de-aula-com-uma-cadeira-de-rodas-e-um-poster-de-uma-escola-chamada-escola_662214-44434.jpg' className="w-full h-full object-cover object-center"/>
        </div>
        <div>
            <div className="flex gap-3 items-baseline">
              <h1 className="text-4xl text-zinc-700 font-bold">Nossa Missão</h1>
            </div> 
            <div className="flex flex-col w-[560px] mt-4 gap-4 text-zinc-600 font-medium">           
              <p className="px-3 break-words whitespace-normal">A missão da COGNITIVA é promover uma educação verdadeiramente inclusiva e personalizada, apoiando o desenvolvimento integral de alunos neurodivergentes por meio da tecnologia e da inteligência artificial.
Nosso objetivo é transformar dados educacionais em insights práticos que auxiliem professores, gestores, terapeutas e famílias a compreender melhor o perfil e as necessidades de cada estudante.</p> <br />
            </div>
             <div className="flex gap-3 items-baseline">
              <h1 className="text-4xl text-zinc-700 font-bold">Nossa Visão</h1>
            </div> 
            <div className="flex flex-col w-[560px] mt-4 gap-4 text-zinc-600 font-medium">            
              <p className="px-3 break-words whitespace-normal">Ser referência em inteligência artificial aplicada à educação inclusiva, apoiando escolas e instituições a oferecer trilhas de aprendizagem adaptativas, humanas e eficazes para alunos neurodivergentes. </p> <br />
            </div>
            <div className="flex gap-3 items-baseline">
              <h1 className="text-4xl text-zinc-700 font-bold">Nossos Valores</h1> <br />
            </div> 
            <div className="flex flex-col w-[560px] mt-4 gap-4 text-zinc-600 font-medium">           
              <p className="px-3 break-words whitespace-normal">Baseamos nosso trabalho em respeito, empatia e confiança, promovendo colaboração, transparência e compromisso com a inclusão.
Acreditamos que a tecnologia deve servir como ferramenta de equidade, valorizando a diversidade e fortalecendo o aprendizado de cada aluno. </p> <br />
            </div>
            
          </div>
      </div>
      <div id="noticias" className="gap-[32px] items-center justify-items-center mt-16">
        <div className=" gap-3 items-baseline">
          <h1 className="text-4xl text-zinc-700 font-bold">O que é Neurodiversidade?</h1>
        </div> 
        <div className="w-[1120px] mt-4 gap-4 text-zinc-600 font-medium">           
          <p className="px-3 break-words whitespace-normal">A neurodiversidade é a compreensão de que cada pessoa pensa, aprende e sente de maneira única.
Diferenças cognitivas, como autismo, TDAH, dislexia ou altas habilidades, não devem ser vistas como limitações, mas como variações naturais do funcionamento humano — expressões da diversidade que tornam o mundo mais criativo, sensível e plural.
Na COGNITIVA, acreditamos que reconhecer e valorizar essas diferenças é o primeiro passo para uma educação verdadeiramente inclusiva.
Nossa plataforma foi desenvolvida para apoiar escolas, professores e famílias na criação de ambientes de aprendizado adaptados às particularidades de cada estudante, garantindo que todos tenham as mesmas oportunidades de desenvolver seu potencial. </p>
        </div>
      </div>

      <div id="noticias" className="gap-[32px] items-center justify-items-center mt-16">
        <div className=" gap-3 items-baseline">
          <h1 className="text-4xl text-zinc-700 font-bold">Beneficos da Congntiva</h1>
        </div> 
        <div className="w-[1120px] mt-4 gap-4 text-zinc-600 font-medium">           
          <p className="px-3 break-words whitespace-normal">A COGNITIVA traz uma nova perspectiva para a educação inclusiva, combinando tecnologia, empatia e dados para aprimorar o acompanhamento de alunos neurodivergentes e fortalecer o papel do educador.

Entre os principais benefícios estão: <br /><br />
 - Melhoria na comunicação entre escola e família, fortalecendo o vínculo e a colaboração no processo educativo.<br />
 - Maior autonomia para professores, que passam a ter uma visão completa do progresso dos estudantes e podem ajustar suas estratégias de forma rápida e assertiva. <br />
 - Tomada de decisão baseada em dados reais, eliminando suposições e permitindo que intervenções pedagógicas sejam mais concisas. <br /><br />

Com esses benefícios, a COGNITIVA se posiciona como uma ferramenta capaz de tornar a inclusão uma prática concreta, promovendo resultados reais para educadores, estudantes e instituições. </p>
        </div>
      </div>

      <div id="contato" className="gap-[32px] items-center justify-items-center mt-16 mb-16">
        <div className=" gap-3 items-baseline">
          <h1 className="text-4xl text-zinc-700 font-bold">Entre em Contato Conosco</h1>
        </div> 
        <div className="w-[1120px] mt-4 gap-4 text-zinc-600 font-medium">           
          <p className="px-3 break-words whitespace-normal">Quer saber mais sobre a COGNITIVA ou conversar com nossa equipe?
Estamos disponíveis para tirar dúvidas, receber sugestões e compartilhar mais detalhes sobre como a plataforma pode apoiar escolas, professores e famílias.
Preencha o formulário abaixo ou envie uma mensagem — teremos prazer em falar com você!</p> <br />
          <p className="px-3 break-words whitespace-normal"> 📧 contato@cognitiva.com.br | 💬 Formulario: FormsCognitiva.com.br </p>
        </div>
      </div>
      <Bot/>
    </div>
  );
}
