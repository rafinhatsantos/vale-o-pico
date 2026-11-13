"use client";

import Link from "next/link";
import { useState } from "react";

import { FavoriteButton } from "@/components/favorite-button";
import { ScoreRing } from "@/components/score-ring";
import { SpotImage } from "@/components/spot-image";
import { SpotMap } from "@/components/spot-map";
import { Waves } from "@/components/waves";
import { useFavorites } from "@/hooks/use-favorites";
import { useLevel } from "@/hooks/use-level";
import { currentIndex, useNow } from "@/hooks/use-now";
import { normalizeText, SCORE_PHRASES, SCORE_STYLES } from "@/lib/format";
import { scoreLabel } from "@/lib/score";
import {
  LEVEL_LABELS,
  REGION_LABELS,
  REGION_ORDER,
  type ForecastSummary,
  type Region,
} from "@/lib/types";

export interface SpotListItem {
  slug: string;
  name: string;
  city: string;
  region: Region;
  latitude: number;
  longitude: number;
}

interface Props {
  spots: SpotListItem[];
  summaries: (ForecastSummary | null)[];
  /** Instante em que a página foi gerada no servidor. */
  serverNow: number;
}

interface Row {
  spot: SpotListItem;
  score: number | null;
  /** Notas das próximas 24 horas, para o gráfico do cartão. */
  trend: number[];
}

type Sort = "regiao" | "nota";

/** Curva das próximas 24 horas, desenhada no canto do cartão. */
function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;

  const width = 96;
  const height = 32;
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = height - 3 - (Math.min(10, value) / 10) * (height - 6);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-8 w-24"
      aria-hidden="true"
    >
      <polygon
        points={`0,${height} ${points.join(" ")} ${width},${height}`}
        fill={color}
        opacity="0.18"
      />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SpotCard({ row, index }: { row: Row; index: number }) {
  const { spot, score, trend } = row;
  const label = score === null ? null : scoreLabel(score);
  const color = label ? SCORE_STYLES[label].hex : "#64748b";

  return (
    <li
      className="relative animate-fade-up"
      style={{ animationDelay: `${Math.min(index, 11) * 55}ms` }}
    >
      <FavoriteButton
        slug={spot.slug}
        name={spot.name}
        className="absolute top-[4.5rem] right-3 z-10"
      />
      <Link
        href={`/praia/${spot.slug}`}
        className="group relative block aspect-[4/3] overflow-hidden rounded-3xl ring-1 ring-white/10 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_-20px] hover:shadow-aqua/40 hover:ring-aqua/60"
      >
        <SpotImage
          slug={spot.slug}
          name={spot.name}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="transition-transform duration-[1200ms] ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-abyss via-abyss/35 to-transparent" />

        <div className="absolute top-3 right-3 left-3 flex items-start justify-between">
          {label ? (
            <span className="glass flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: color, boxShadow: `0 0 8px ${color}` }}
              />
              {label}
            </span>
          ) : (
            <span className="glass rounded-full px-3 py-1 text-xs font-semibold text-mist">
              sem dados
            </span>
          )}
          <ScoreRing value={score} />
        </div>

        <div className="absolute right-4 bottom-4 left-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-display text-2xl leading-tight font-bold">
              {spot.name}
            </p>
            <p className="truncate text-sm text-mist">{spot.city}</p>
          </div>
          <div className="shrink-0 text-right">
            <Sparkline values={trend} color={color} />
            <p className="text-[10px] tracking-wider text-mist uppercase">
              próximas 24 h
            </p>
          </div>
        </div>
      </Link>
    </li>
  );
}

export function HomeSpots({ spots, summaries, serverNow }: Props) {
  const level = useLevel();
  const now = useNow(serverNow);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("nota");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const favorites = useFavorites();

  const rows: Row[] = spots.map((spot, index) => {
    const summary = summaries[index];
    if (!summary || summary.hours.length === 0) {
      return { spot, score: null, trend: [] };
    }
    const start = currentIndex(summary.hours, now);
    return {
      spot,
      score: summary.hours[start].scores[level],
      trend: summary.hours
        .slice(start, start + 24)
        .map((hour) => hour.scores[level]),
    };
  });

  const best = rows.reduce<Row | null>(
    (top, row) =>
      row.score !== null && (top === null || row.score > (top.score ?? -1))
        ? row
        : top,
    null,
  );

  // Favoritos que apontam para um pico que não existe mais são ignorados.
  const knownSlugs = new Set(spots.map((spot) => spot.slug));
  const favoriteSet = new Set(favorites.filter((slug) => knownSlugs.has(slug)));

  const search = normalizeText(query);
  const pool = onlyFavorites
    ? rows.filter(({ spot }) => favoriteSet.has(spot.slug))
    : rows;
  const visible = search
    ? pool.filter(({ spot }) =>
        normalizeText(`${spot.name} ${spot.city}`).includes(search),
      )
    : pool;

  const ranked = [...visible].sort(
    (a, b) => (b.score ?? -1) - (a.score ?? -1),
  );

  const bestLabel = best?.score != null ? scoreLabel(best.score) : null;

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          {best && (
            <div key={best.spot.slug} className="absolute inset-0 animate-fade-in">
              <SpotImage
                slug={best.spot.slug}
                name={best.spot.name}
                sizes="100vw"
                priority
                className="animate-kenburns"
              />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-abyss via-abyss/70 to-abyss/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-abyss via-transparent to-abyss/50" />
        </div>

        <div className="mx-auto flex min-h-[min(78svh,44rem)] w-full max-w-6xl flex-col justify-center gap-10 px-4 pt-12 pb-28 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h1 className="animate-fade-up font-display text-lg font-medium text-mist">
              Vale a pena ir surfar agora?
            </h1>

            {best && bestLabel ? (
              <>
                <p
                  className="glass mt-5 inline-flex animate-fade-up items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase"
                  style={{ animationDelay: "80ms" }}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aqua opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-aqua" />
                  </span>
                  Melhor pico agora · {LEVEL_LABELS[level]}
                </p>
                <p
                  key={best.spot.slug}
                  className="mt-4 animate-fade-up font-display text-6xl leading-[0.95] font-extrabold tracking-tight text-balance sm:text-7xl lg:text-8xl"
                  style={{ animationDelay: "140ms" }}
                >
                  {best.spot.name}
                </p>
                <p
                  className="mt-4 animate-fade-up text-lg text-mist"
                  style={{ animationDelay: "200ms" }}
                >
                  {best.spot.city} ·{" "}
                  <span className={SCORE_STYLES[bestLabel].ink}>
                    {SCORE_PHRASES[bestLabel]}
                  </span>
                </p>
                <Link
                  href={`/praia/${best.spot.slug}`}
                  className="group mt-8 inline-flex animate-fade-up items-center gap-2 rounded-full bg-gradient-to-r from-aqua to-cyan-300 px-7 py-3.5 font-semibold text-abyss shadow-[0_0_40px_-8px] shadow-aqua/70 transition-all duration-300 hover:scale-[1.03] hover:shadow-aqua"
                  style={{ animationDelay: "260ms" }}
                >
                  Ver previsão completa
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </>
            ) : (
              <p className="mt-4 font-display text-4xl font-bold">
                Previsão indisponível no momento.
              </p>
            )}
          </div>

          {best && bestLabel && (
            <Link
              href={`/praia/${best.spot.slug}`}
              className="flex animate-fade-up flex-col items-center gap-3 self-start md:self-center"
              style={{ animationDelay: "320ms" }}
            >
              <div className="animate-float">
                <ScoreRing value={best.score} size="lg" />
              </div>
              <span
                className={`font-display text-2xl font-bold capitalize ${SCORE_STYLES[bestLabel].ink}`}
              >
                {bestLabel}
              </span>
              <span className="sr-only">em {best.spot.name}</span>
            </Link>
          )}
        </div>

        <Waves className="absolute inset-x-0 bottom-0 h-20" />
      </section>

      <section className="mx-auto mb-16 w-full max-w-6xl px-4">
        <h2 className="font-display text-3xl font-bold tracking-tight">
          Mapa dos picos
        </h2>
        <p className="mb-5 text-sm text-mist">
          Passe o mouse ou toque em um ponto para ver a praia. A cor é a nota
          de agora para o seu nível.
        </p>
        <SpotMap
          spots={rows.map(({ spot, score }) => ({
            slug: spot.slug,
            name: spot.name,
            city: spot.city,
            latitude: spot.latitude,
            longitude: spot.longitude,
            score,
          }))}
        />
      </section>

      <section className="mx-auto w-full max-w-6xl px-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight">
              Todos os picos
            </h2>
            <p className="text-sm text-mist">
              {spots.length} picos do litoral brasileiro
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:justify-end">
            <div className="relative">
              <svg
                viewBox="0 0 24 24"
                className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-mist"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <label htmlFor="busca" className="sr-only">
                Buscar pico
              </label>
              <input
                id="busca"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar pico ou cidade"
                className="glass w-full rounded-full py-2.5 pr-4 pl-11 text-base outline-none transition-shadow placeholder:text-mist/70 focus:ring-2 focus:ring-aqua/60 sm:w-64"
              />
            </div>

            <button
              type="button"
              aria-pressed={onlyFavorites}
              onClick={() => setOnlyFavorites((value) => !value)}
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold whitespace-nowrap ring-1 transition-colors duration-300 ${
                onlyFavorites
                  ? "bg-rose-400/15 text-rose-300 ring-rose-300/40"
                  : "bg-white/5 text-mist ring-white/10 hover:text-foam"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill={onlyFavorites ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 20.5s-7.5-4.6-9.2-9.4C1.7 7.9 3.6 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.4 0 5.3 3.4 4.2 6.6-1.7 4.8-9.2 9.4-9.2 9.4Z" />
              </svg>
              Meus picos ({favoriteSet.size})
            </button>

            <div
              role="radiogroup"
              aria-label="Ordenar picos"
              className="grid grid-cols-2 rounded-full bg-white/5 p-1 text-sm font-semibold ring-1 ring-white/10"
            >
              {(
                [
                  ["nota", "Melhores agora"],
                  ["regiao", "Por região"],
                ] as const
              ).map(([value, text]) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={sort === value}
                  onClick={() => setSort(value)}
                  className={`rounded-full px-4 py-1.5 whitespace-nowrap transition-colors duration-300 ${
                    sort === value
                      ? "bg-white/15 text-foam"
                      : "text-mist hover:text-foam"
                  }`}
                >
                  {text}
                </button>
              ))}
            </div>
          </div>
        </div>

        {onlyFavorites && favoriteSet.size > 0 && (
          <p className="mt-4 text-sm text-mist">Salvos neste aparelho.</p>
        )}

        {visible.length === 0 && (
          <p className="glass mt-8 rounded-3xl py-12 text-center text-mist">
            {onlyFavorites && favoriteSet.size === 0
              ? "Você ainda não favoritou nenhum pico. Toque no coração de um cartão para guardar aqui."
              : `Nenhum pico encontrado${search ? ` para “${query}”` : ""}.`}
          </p>
        )}

        {sort === "nota" ? (
          <ul
            key={`nota-${level}`}
            className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {ranked.map((row, index) => (
              <SpotCard key={row.spot.slug} row={row} index={index} />
            ))}
          </ul>
        ) : (
          REGION_ORDER.map((region) => {
            const regionRows = visible.filter(
              (row) => row.spot.region === region,
            );
            if (regionRows.length === 0) return null;

            return (
              <div key={region} className="mt-10">
                <h3 className="flex items-center gap-3 font-display text-xl font-semibold">
                  {REGION_LABELS[region]}
                  <span className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
                </h3>
                <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {regionRows.map((row, index) => (
                    <SpotCard key={row.spot.slug} row={row} index={index} />
                  ))}
                </ul>
              </div>
            );
          })
        )}
      </section>
    </>
  );
}
