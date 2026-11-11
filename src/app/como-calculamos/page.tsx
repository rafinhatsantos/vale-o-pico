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

const meters = (value: number) => value.toLocaleString("pt-BR");

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

export default function HowItWorksPage() {
  return (
    <article className="flex flex-col gap-8 leading-relaxed text-slate-700">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Como calculamos a nota
        </h1>
        <p className="mt-2">
          O site responde uma pergunta: vale a pena ir? Em vez de uma tabela de
          números, cada pico recebe uma nota de 0 a 10 para cada horário,
          ajustada ao seu nível.
        </p>
      </div>

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
        <p className="rounded-xl bg-white p-4 text-center font-semibold text-slate-900 ring-1 ring-slate-200">
          nota = tamanho × período × vento × maré
        </p>
        <p>
          Os fatores são multiplicados, não somados, porque no surfe um fator
          ruim derruba tudo: swell perfeito com maral forte não vale nada.
        </p>
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>
            <strong>Tamanho:</strong> altura do swell × exposição do pico ×
            encaixe da direção na janela da ficha. O resultado é comparado com
            a faixa ideal do seu nível.
          </li>
          <li>
            <strong>Período:</strong> abaixo de 7 s é ruim, de 8 a 10 s é ok,
            de 11 a 14 s é bom e acima de 14 s é excelente.
          </li>
          <li>
            <strong>Vento:</strong> terral fraco ou sem vento vale o máximo.
            Vento lateral tira cerca de 40%, maral fraco tira metade e maral
            forte derruba a nota. Terral forte demais também perde pontos.
          </li>
          <li>
            <strong>Maré:</strong> a maré preferida do pico vale o máximo; fora
            dela a nota cai um pouco. O peso é leve porque o dado de maré ainda
            é aproximado.
          </li>
        </ul>
      </Section>

      <Section title="Ajuste por nível">
        <p>
          O mesmo mar dá notas diferentes para cada nível. Um swell de 2 metros
          pode ser clássico para quem é avançado e nota zero para quem está
          começando.
        </p>
        <div className="overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-3 py-2 font-semibold">Nível</th>
                <th className="px-3 py-2 font-semibold">Tamanho ideal</th>
                <th className="px-3 py-2 font-semibold">Nota zera</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {LEVELS.map((level) => {
                const range = SIZE_RANGES[level];
                return (
                  <tr key={level}>
                    <td className="px-3 py-2 font-medium text-slate-900">
                      {LEVEL_LABELS[level]}
                    </td>
                    <td className="px-3 py-2">
                      {meters(range.idealMin)} a {meters(range.idealMax)} m
                    </td>
                    <td className="px-3 py-2">
                      abaixo de {meters(range.min)} m ou acima de{" "}
                      {meters(range.max)} m
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-500">
          Tamanho efetivo do swell no pico, não a altura da face da onda.
        </p>
      </Section>

      <Section title="A escala">
        <ul className="flex flex-col gap-2">
          {SCALE.map(({ label, range, text }) => (
            <li key={label} className="flex items-center gap-3">
              <span
                className={`w-24 shrink-0 rounded-lg px-2 py-1 text-center text-sm font-semibold ${SCORE_STYLES[label].bg} ${SCORE_STYLES[label].text}`}
              >
                {label}
              </span>
              <span>
                <strong className="text-slate-900">{range}.</strong> {text}
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
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>
            <strong>A maré é aproximada.</strong> Usamos o nível do mar de um
            modelo, não a tábua oficial da Marinha. Por isso ela pesa pouco na
            nota.
          </li>
          <li>
            <strong>Ilhas e costões fazem sombra.</strong> O modelo global não
            enxerga Ilhabela ou a Ilha Grande. Compensamos com um fator de
            exposição na ficha, que é um ajuste manual.
          </li>
          <li>
            <strong>Fundo de areia muda.</strong> Depois de uma ressaca, o
            mesmo swell pode quebrar bem diferente. A nota não sabe como está a
            bancada hoje.
          </li>
          <li>
            <strong>As fichas estão em validação.</strong> Enquanto um pico não
            for conferido com quem surfa lá, ele aparece marcado como rascunho.
          </li>
          <li>
            <strong>A fórmula ainda está sendo calibrada.</strong> Os pesos são
            um ponto de partida e mudam conforme comparamos a nota com o mar
            real.
          </li>
          <li>
            <strong>Quanto mais longe, menos certo.</strong> A previsão para
            daqui a seis dias erra mais do que a de amanhã.
          </li>
        </ul>
        <p>
          Os dados são atualizados cerca de uma vez por hora. Antes de entrar
          na água, olhe o mar e respeite o seu limite.
        </p>
      </Section>
    </article>
  );
}
