import type { Metadata } from "next";

import { SCORE_STYLES } from "@/lib/format";
import { SIZE_RANGES } from "@/lib/score";
import { LEVEL_LABELS, LEVELS } from "@/lib/types";

export const metadata: Metadata = {
  title: "Como calculamos a nota",
  description:
    "De onde vêm os dados, como a nota de 0 a 10 é calculada para cada pico e nível, e quais são os limites da previsão.",
};

const SCALE = [
  { label: "flat", range: "0 a 1,4", text: "Não tem onda para o seu nível." },
  { label: "fraco", range: "1,5 a 3,4", text: "Dá para molhar a prancha, sem expectativa." },
  { label: "surfável", range: "3,5 a 5,4", text: "Vale se estiver perto." },
  { label: "bom", range: "5,5 a 7,4", text: "Vale o deslocamento." },
  { label: "clássico", range: "7,5 a 10", text: "Dia para não perder." },
] as const;

const FACTORS = [
  {
    name: "Tamanho",
    text: "Altura do swell × exposição do pico × encaixe da direção na janela da ficha. O resultado é comparado com a faixa ideal do seu nível. Quando o mar tem mais de um swell, usamos o de maior altura × período, para um swell longo não ficar escondido atrás de um mar curto.",
  },
  {
    name: "Período",
    text: "Abaixo de 7 s é ruim, de 8 a 10 s é ok, de 11 a 14 s é bom e acima de 14 s é excelente.",
  },
  {
    name: "Vento",
    text: "Terral fraco ou sem vento vale o máximo. Lateral tira cerca de 40%, maral fraco tira metade e maral forte derruba a nota. Terral forte demais também perde pontos.",
  },
  {
    name: "Maré",
    text: "A maré preferida do pico vale o máximo; fora dela a nota cai um pouco. O peso é leve porque o dado de maré ainda é aproximado.",
  },
];

const LIMITS = [
  {
    title: "A maré é aproximada",
    text: "Usamos o nível do mar de um modelo, não a tábua oficial da Marinha. Por isso ela pesa pouco na nota.",
  },
  {
    title: "Ilhas e costões fazem sombra",
    text: "O modelo global não enxerga Ilhabela ou a Ilha Grande. Compensamos com um fator de exposição na ficha, que é um ajuste manual.",
  },
  {
    title: "Fundo de areia muda",
    text: "Depois de uma ressaca, o mesmo swell pode quebrar bem diferente. A nota não sabe como está a bancada hoje.",
  },
  {
    title: "As fichas estão em validação",
    text: "Enquanto um pico não for conferido com quem surfa lá, ele aparece marcado como rascunho.",
  },
  {
    title: "A fórmula ainda está sendo calibrada",
    text: "Os pesos são um ponto de partida e mudam conforme comparamos a nota com o mar real.",
  },
  {
    title: "Quanto mais longe, menos certo",
    text: "A previsão para daqui a seis dias erra mais do que a de amanhã.",
  },
];

const meters = (value: number) => value.toLocaleString("pt-BR");

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

export default function HowItWorksPage() {
  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-14 px-4 pt-14 leading-relaxed text-foam/80">
      <header className="animate-fade-up">
        <p className="text-sm font-semibold tracking-wider text-aqua uppercase">
          Método
        </p>
        <h1 className="mt-2 font-display text-5xl leading-none font-extrabold tracking-tight text-foam sm:text-6xl">
          Como calculamos a nota
        </h1>
        <p className="mt-5 text-lg">
          O site responde uma pergunta: vale a pena ir? Em vez de uma tabela de
          números, cada pico recebe uma nota de 0 a 10 para cada horário,
          ajustada ao seu nível.
        </p>
      </header>

      <Section title="De onde vêm os dados">
        <p>
          Modelos atmosféricos globais preveem o vento sobre o oceano. Modelos
          de ondas calculam a energia que esse vento passa para o mar e a
          viagem do swell até a costa. Nós não rodamos modelo próprio:
          consumimos esses dados já processados pela Open-Meteo e os traduzimos
          para a realidade de cada praia.
        </p>
        <p>
          Essa tradução usa a ficha do pico: para onde a praia está virada,
          quais direções de swell entram bem, quanto ilhas e costões fazem
          sombra, qual é o vento terral e qual maré o pico prefere.
        </p>
      </Section>

      <Section title="A fórmula">
        <p className="rounded-3xl bg-gradient-to-r from-aqua/20 via-cyan-400/10 to-transparent p-6 text-center font-display text-xl font-bold text-foam ring-1 ring-aqua/30 sm:text-2xl">
          nota = tamanho × período × vento × maré
        </p>
        <p>
          Os fatores são multiplicados, não somados, porque no surfe um fator
          ruim derruba tudo: swell perfeito com maral forte não vale nada.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {FACTORS.map(({ name, text }, index) => (
            <div key={name} className="glass rounded-3xl p-5">
              <p className="font-display text-sm font-bold text-aqua">
                0{index + 1}
              </p>
              <h3 className="font-display text-xl font-bold text-foam">
                {name}
              </h3>
              <p className="mt-2 text-sm">{text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Ajuste por nível">
        <p>
          O mesmo mar dá notas diferentes para cada nível. Um swell de 2 metros
          pode ser clássico para quem é avançado e nota zero para quem está
          começando.
        </p>
        <div className="glass overflow-hidden rounded-3xl">
          <table className="w-full text-left text-sm">
            <thead className="text-xs tracking-wider text-mist uppercase">
              <tr>
                <th className="px-5 py-3 font-semibold">Nível</th>
                <th className="px-5 py-3 font-semibold">Tamanho ideal</th>
                <th className="px-5 py-3 font-semibold">Nota zera</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {LEVELS.map((level) => {
                const range = SIZE_RANGES[level];
                return (
                  <tr key={level}>
                    <td className="px-5 py-4 font-display text-base font-bold text-foam">
                      {LEVEL_LABELS[level]}
                    </td>
                    <td className="px-5 py-4">
                      {meters(range.idealMin)} a {meters(range.idealMax)} m
                    </td>
                    <td className="px-5 py-4">
                      abaixo de {meters(range.min)} m ou acima de{" "}
                      {meters(range.max)} m
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-mist">
          Tamanho efetivo do swell no pico, não a altura da face da onda.
        </p>
      </Section>

      <Section title="A escala">
        <ul className="flex flex-col gap-3">
          {SCALE.map(({ label, range, text }) => (
            <li
              key={label}
              className="glass flex items-center gap-4 rounded-2xl p-4"
            >
              <span
                className={`w-24 shrink-0 rounded-full px-3 py-1.5 text-center text-sm font-bold ${SCORE_STYLES[label].bg} ${SCORE_STYLES[label].text}`}
              >
                {label}
              </span>
              <span>
                <strong className="font-display text-foam">{range}.</strong>{" "}
                {text}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Os limites da previsão">
        <p>
          A nota é uma boa estimativa, não uma garantia. É melhor você saber
          onde ela pode errar:
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {LIMITS.map(({ title, text }) => (
            <div key={title} className="glass rounded-3xl p-5">
              <h3 className="font-display text-lg font-bold text-foam">
                {title}
              </h3>
              <p className="mt-2 text-sm">{text}</p>
            </div>
          ))}
        </div>
        <p>
          Os dados são atualizados cerca de uma vez por hora. Antes de entrar
          na água, olhe o mar e respeite o seu limite.
        </p>
      </Section>
    </article>
  );
}
