import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { FavoriteButton } from "@/components/favorite-button";
import { SpotForecast } from "@/components/spot-forecast";
import { SpotImage } from "@/components/spot-image";
import { Waves } from "@/components/waves";
import { getForecast } from "@/lib/forecast";
import { compass, TIDE_LABELS } from "@/lib/format";
import { PHOTOS } from "@/lib/photos";
import { FEEDBACK_URL } from "@/lib/site";
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
    <div className="animate-pulse" aria-busy="true">
      <span className="sr-only">Carregando previsão…</span>
      <div className="h-[46svh] min-h-80 bg-white/5" />
      <div className="mx-auto -mt-20 flex w-full max-w-6xl flex-col gap-5 px-4">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="h-56 rounded-3xl bg-white/8" />
          <div className="h-56 rounded-3xl bg-white/8" />
        </div>
        <div className="h-96 rounded-3xl bg-white/8" />
      </div>
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
  const photo = PHOTOS[slug];

  const facts = [
    {
      label: "Swell que entra bem",
      value: `de ${compass(spot.swellWindow.from)} a ${compass(spot.swellWindow.to)}`,
    },
    { label: "Terral", value: `vento ${compass(spot.offshoreWind)}` },
    { label: "Maré preferida", value: TIDE_LABELS[spot.tide] },
    { label: "Fundo", value: spot.bottom },
    { label: "Nível indicado", value: LEVEL_LABELS[spot.level] },
    { label: "Praia virada para", value: compass(spot.coastOrientation) },
  ];

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <SpotImage
            slug={spot.slug}
            name={spot.name}
            sizes="100vw"
            priority
            className="animate-kenburns"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-abyss via-abyss/30 to-abyss/60" />
        </div>

        <div className="mx-auto flex min-h-[min(58svh,34rem)] w-full max-w-6xl flex-col justify-between px-4 pt-6 pb-36">
          <div className="flex animate-fade-up items-start justify-between gap-3">
            <Link
              href="/"
              className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors hover:text-aqua"
            >
              ← Todos os picos
            </Link>
            <FavoriteButton slug={spot.slug} name={spot.name} />
          </div>

          <div>
            <p
              className="animate-fade-up text-sm font-semibold tracking-wider text-aqua uppercase"
              style={{ animationDelay: "80ms" }}
            >
              {REGION_LABELS[spot.region]}
            </p>
            <h1
              className="mt-2 animate-fade-up font-display text-6xl leading-[0.95] font-extrabold tracking-tight text-balance sm:text-7xl lg:text-8xl"
              style={{ animationDelay: "140ms" }}
            >
              {spot.name}
            </h1>
            <p
              className="mt-3 animate-fade-up text-lg text-foam/80"
              style={{ animationDelay: "200ms" }}
            >
              {spot.city}
            </p>
          </div>
        </div>

        {photo &&
          (photo.page ? (
            <a
              href={photo.page}
              target="_blank"
              rel="noreferrer"
              className="absolute right-4 bottom-24 z-10 text-[11px] text-foam/60 transition-colors hover:text-foam"
            >
              Foto: {photo.author} · {photo.license}
            </a>
          ) : (
            <span className="absolute right-4 bottom-24 z-10 text-[11px] text-foam/60">
              Foto: {photo.author} · {photo.license}
            </span>
          ))}
        <Waves className="absolute inset-x-0 bottom-0 h-20" />
      </section>

      <div className="relative z-10 -mt-24">
        {forecast ? (
          <SpotForecast forecast={forecast} spot={spot} />
        ) : (
          <div className="mx-auto w-full max-w-6xl px-4">
            <p className="glass rounded-3xl p-8 text-center text-lg">
              Não foi possível carregar a previsão agora. Tente de novo em
              alguns minutos.
            </p>
          </div>
        )}
      </div>

      <section className="mx-auto mt-5 w-full max-w-6xl px-4">
        <div className="glass rounded-3xl p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-bold">Ficha do pico</h2>
            {!spot.validated && (
              <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-200 ring-1 ring-amber-300/30">
                Ficha em rascunho
              </span>
            )}
          </div>
          {!spot.validated && (
            <p className="mt-2 text-sm text-mist">
              Ainda não foi conferida com quem surfa aqui. A nota pode estar
              descalibrada.{" "}
              <a
                href={`${FEEDBACK_URL}?${new URLSearchParams({
                  title: `Ficha: ${spot.name} (${spot.city})`,
                  body: "A nota bate com o mar? O que está errado nesta ficha (swell, vento, maré, nível)?",
                })}`}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-aqua underline-offset-2 hover:underline"
              >
                Essa ficha está certa? Conte pra gente ↗
              </a>
            </p>
          )}
          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-6">
            {facts.map(({ label, value }) => (
              <div key={label}>
                <dt className="text-[11px] font-semibold tracking-wider text-mist uppercase">
                  {label}
                </dt>
                <dd className="mt-1 font-display text-lg font-bold first-letter:uppercase">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
