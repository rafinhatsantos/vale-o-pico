import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { SpotForecast } from "@/components/spot-forecast";
import { getForecast } from "@/lib/forecast";
import { compass, TIDE_LABELS } from "@/lib/format";
import { getSpot, SPOTS } from "@/lib/spots";
import { LEVEL_LABELS, REGION_LABELS } from "@/lib/types";

export async function generateStaticParams() {
  return SPOTS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/praia/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const spot = getSpot(slug);
  if (!spot) return {};

  return {
    title: `Previsão de surfe em ${spot.name} (${spot.city})`,
    description: `Vale a pena surfar em ${spot.name} hoje? Nota de 0 a 10 por horário, melhor janela da semana, swell, vento e maré para ${spot.name}, ${spot.city}.`,
  };
}

function SpotSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6" aria-busy="true">
      <span className="sr-only">Carregando previsão…</span>
      <div className="h-16 w-2/3 rounded-xl bg-slate-200" />
      <div className="h-36 rounded-2xl bg-slate-200" />
      <div className="h-24 rounded-2xl bg-slate-200" />
      <div className="h-72 rounded-2xl bg-slate-200" />
    </div>
  );
}

// O slug só existe por URL, então a leitura fica atrás do Suspense para a
// navegação mostrar o esqueleto na hora.
export default function SpotPage({ params }: PageProps<"/praia/[slug]">) {
  return (
    <Suspense fallback={<SpotSkeleton />}>
      <SpotContent params={params} />
    </Suspense>
  );
}

async function SpotContent({
  params,
}: Pick<PageProps<"/praia/[slug]">, "params">) {
  const { slug } = await params;
  const spot = getSpot(slug);
  if (!spot) notFound();

  const forecast = await getForecast(slug);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/" className="text-sm font-medium text-sky-700 hover:underline">
          ← Todos os picos
        </Link>
        <h1 className="mt-2 text-3xl font-bold">{spot.name}</h1>
        <p className="text-slate-600">
          {spot.city} · {REGION_LABELS[spot.region]}
        </p>
      </div>

      {forecast ? (
        <SpotForecast forecast={forecast} offshoreWind={spot.offshoreWind} />
      ) : (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          Não foi possível carregar a previsão agora. Tente de novo em alguns
          minutos.
        </p>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-bold">Ficha do pico</h2>
        {!spot.validated && (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Ficha em rascunho: ainda não foi conferida com quem surfa aqui. A
            nota pode estar descalibrada.
          </p>
        )}
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <dt className="text-slate-500">Swell que entra bem</dt>
            <dd className="font-medium">
              de {compass(spot.swellWindow.from)} a {compass(spot.swellWindow.to)}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Terral</dt>
            <dd className="font-medium">vento {compass(spot.offshoreWind)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Maré preferida</dt>
            <dd className="font-medium">{TIDE_LABELS[spot.tide]}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Fundo</dt>
            <dd className="font-medium capitalize">{spot.bottom}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Nível indicado</dt>
            <dd className="font-medium">{LEVEL_LABELS[spot.level]}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Praia virada para</dt>
            <dd className="font-medium">{compass(spot.coastOrientation)}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
