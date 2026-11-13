import type { Metadata } from "next";

import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sobre o projeto",
  description:
    "Por que o Vale o Pico existe e as decisões de projeto por trás da nota de 0 a 10: um projeto de portfólio.",
};

const DECISIONS = [
  {
    title: "O nível do surfista é um dado, não um filtro",
    text: "O mesmo mar dá notas diferentes para iniciante, intermediário e avançado. Um swell de 2 metros é clássico para um e perigoso para o outro, então a escolha do nível muda a nota de todos os picos na hora.",
  },
  {
    title: "Uma nota, uma função",
    text: "A nota é tamanho × período × vento × maré, numa função pura e testada. Os fatores se multiplicam: um fator ruim derruba tudo. Sem ramificações por pico, fica fácil testar, explicar e calibrar.",
  },
  {
    title: "A fonte de dados fica atrás de um contrato",
    text: "Só um arquivo conhece a Open-Meteo. Páginas e componentes pedem a previsão por uma interface e nunca sabem de onde ela veio. Trocar de fonte, ou de back-end, é escrever outro provider.",
  },
  {
    title: "Uma chamada para todos os picos",
    text: "A previsão dos 100 picos vem em duas chamadas à API (ondas e vento), guardadas por cerca de 1 hora no servidor. Nenhum visitante dispara chamada direta, e o site respeita o plano gratuito.",
  },
  {
    title: "Sem login, de propósito",
    text: "Nível e favoritos ficam no navegador. É simples e gratuito, mas não acompanha a pessoa entre aparelhos, e o código trata isso: formato versionado, valores inválidos descartados, abas sincronizadas. Conta e sincronização ficam para a próxima fase.",
  },
  {
    title: "Limites à vista",
    text: "A nota é uma estimativa e as fichas dos picos ainda são rascunho. Isso aparece na página de cada pico, com um link para quem surfa no lugar dizer o que está errado.",
  },
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-3xl font-bold tracking-tight text-foam">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function AboutPage() {
  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-14 px-4 pt-14 leading-relaxed text-foam/80">
      <header className="animate-fade-up">
        <p className="text-sm font-semibold tracking-wider text-aqua uppercase">
          Sobre
        </p>
        <h1 className="mt-2 font-display text-5xl leading-none font-extrabold tracking-tight text-foam sm:text-6xl">
          Sobre o projeto
        </h1>
        <p className="mt-5 text-lg">
          O {SITE_NAME} é um projeto de portfólio: uma previsão de surfe do Sul
          ao Nordeste do Brasil que responde uma pergunta só, <em>vale a pena
          ir?</em>
        </p>
      </header>

      <Section title="O problema">
        <p>
          Os sites de previsão de surfe mostram tabelas de altura, período,
          direção e vento. Para quem já surfa há anos, isso basta. Para quem
          está começando, é um monte de números sem resposta, e as mesmas
          condições que animam um surfista avançado podem ser perigosas para um
          iniciante.
        </p>
        <p>
          A ideia foi trocar a tabela por uma nota de 0 a 10 para cada pico e
          cada horário, ajustada ao nível de quem está olhando, e mostrar de
          onde a nota veio para ela poder ser contestada.
        </p>
      </Section>

      <Section title="Decisões de projeto">
        <div className="grid gap-4 sm:grid-cols-2">
          {DECISIONS.map(({ title, text }) => (
            <div key={title} className="glass rounded-3xl p-5">
              <h3 className="font-display text-xl font-bold text-foam">
                {title}
              </h3>
              <p className="mt-2 text-sm">{text}</p>
            </div>
          ))}
        </div>
      </Section>
    </article>
  );
}
