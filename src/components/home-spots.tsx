"use client";

import Link from "next/link";
import { useState } from "react";

import { ScoreBadge } from "@/components/score-badge";
import { useLevel } from "@/hooks/use-level";
import { currentIndex, useNow } from "@/hooks/use-now";
import { normalizeText } from "@/lib/format";
import { scoreLabel } from "@/lib/score";
import {
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
}

interface Props {
  spots: SpotListItem[];
  summaries: (ForecastSummary | null)[];
  /** Instante em que a página foi gerada no servidor. */
  serverNow: number;
}

export function HomeSpots({ spots, summaries, serverNow }: Props) {
  const level = useLevel();
  const now = useNow(serverNow);
  const [query, setQuery] = useState("");

  const rows = spots.map((spot, index) => {
    const summary = summaries[index];
    const hour = summary?.hours[currentIndex(summary.hours, now)];
    return { spot, score: hour ? hour.scores[level] : null };
  });

  const best = rows.reduce<(typeof rows)[number] | null>(
    (top, row) =>
      row.score !== null && (top === null || row.score > (top.score ?? -1))
        ? row
        : top,
    null,
  );

  const search = normalizeText(query);
  const visible = search
    ? rows.filter(({ spot }) =>
        normalizeText(`${spot.name} ${spot.city}`).includes(search),
      )
    : rows;

  return (
    <div className="flex flex-col gap-6">
      {best && best.score !== null && (
        <Link
          href={`/praia/${best.spot.slug}`}
          className="flex items-center gap-4 rounded-2xl bg-sky-900 p-4 text-white shadow-sm transition-colors hover:bg-sky-800"
        >
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold tracking-wide text-sky-200 uppercase">
              Melhor pico agora
            </p>
            <p className="truncate text-2xl font-bold">{best.spot.name}</p>
            <p className="truncate text-sm text-sky-100">
              {best.spot.city} · {scoreLabel(best.score)}
            </p>
          </div>
          <ScoreBadge value={best.score} />
        </Link>
      )}

      <div>
        <label htmlFor="busca" className="sr-only">
          Buscar pico
        </label>
        <input
          id="busca"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar pico ou cidade"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base outline-none placeholder:text-slate-400 focus:border-sky-600 focus:ring-2 focus:ring-sky-200"
        />
      </div>

      {visible.length === 0 && (
        <p className="py-6 text-center text-slate-500">
          Nenhum pico encontrado para “{query}”.
        </p>
      )}

      {REGION_ORDER.map((region) => {
        const regionRows = visible.filter((row) => row.spot.region === region);
        if (regionRows.length === 0) return null;

        return (
          <section key={region}>
            <h2 className="mb-2 text-sm font-semibold tracking-wide text-slate-500 uppercase">
              {REGION_LABELS[region]}
            </h2>
            <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {regionRows.map(({ spot, score }) => (
                <li key={spot.slug}>
                  <Link
                    href={`/praia/${spot.slug}`}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{spot.name}</p>
                      <p className="truncate text-sm text-slate-500">
                        {spot.city}
                        {score !== null && ` · ${scoreLabel(score)}`}
                      </p>
                    </div>
                    <ScoreBadge value={score} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
