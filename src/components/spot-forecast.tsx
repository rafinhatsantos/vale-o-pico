"use client";

import { useState } from "react";

import { ScoreBadge } from "@/components/score-badge";
import { useLevel } from "@/hooks/use-level";
import { currentIndex, useNow } from "@/hooks/use-now";
import {
  compass,
  formatClock,
  formatDay,
  formatNumber,
  SCORE_STYLES,
  TIDE_LABELS,
  windType,
} from "@/lib/format";
import { scoreLabel } from "@/lib/score";
import {
  LEVEL_LABELS,
  type Forecast,
  type ForecastHour,
  type Level,
} from "@/lib/types";

/** Faixa de horas mostrada na linha do tempo (cobre o dia claro o ano todo). */
const FIRST_HOUR = 5;
const LAST_HOUR = 19;
const TIMELINE_HOURS = Array.from(
  { length: LAST_HOUR - FIRST_HOUR + 1 },
  (_, index) => FIRST_HOUR + index,
);

/** Notas até esta distância do pico entram na mesma janela. */
const WINDOW_TOLERANCE = 1;
/** Abaixo disso não vale chamar de "melhor janela". */
const MIN_WINDOW_SCORE = 1.5;

interface Props {
  forecast: Forecast;
  offshoreWind: number;
}

interface BestWindow {
  day: string;
  fromHour: number;
  toHour: number;
  score: number;
}

function findBestWindow(
  hours: ForecastHour[],
  startIndex: number,
  level: Level,
): BestWindow | null {
  let peak = -1;
  for (let i = startIndex; i < hours.length; i++) {
    if (!hours[i].daylight) continue;
    if (peak === -1 || hours[i].scores[level] > hours[peak].scores[level]) {
      peak = i;
    }
  }
  if (peak === -1 || hours[peak].scores[level] < MIN_WINDOW_SCORE) return null;

  const best = hours[peak];
  const belongs = (hour: ForecastHour | undefined) =>
    hour !== undefined &&
    hour.day === best.day &&
    hour.daylight &&
    hour.scores[level] >= best.scores[level] - WINDOW_TOLERANCE;

  let from = peak;
  while (from - 1 >= startIndex && belongs(hours[from - 1])) from--;
  let to = peak;
  while (belongs(hours[to + 1])) to++;

  return {
    day: best.day,
    fromHour: hours[from].hour,
    toHour: hours[to].hour + 1,
    score: best.scores[level],
  };
}

function dayName(day: string, today: string, tomorrow: string | undefined) {
  if (day === today) return "Hoje";
  if (day === tomorrow) return "Amanhã";
  const { weekday, date } = formatDay(day);
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${date}`;
}

/** Seta apontando para onde o swell ou o vento está indo. */
function DirectionArrow({ from }: { from: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="inline-block h-4 w-4 align-[-2px]"
      style={{ transform: `rotate(${from + 180}deg)` }}
      aria-hidden="true"
    >
      <path
        d="M12 3l6 9h-4v9h-4v-9H6z"
        fill="currentColor"
      />
    </svg>
  );
}

function Detail({
  label,
  children,
  note,
}: {
  label: string;
  children: React.ReactNode;
  note?: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <dt className="text-xs font-medium tracking-wide text-slate-500 uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-lg font-semibold">{children}</dd>
      {note && <p className="text-xs text-slate-500">{note}</p>}
    </div>
  );
}

export function SpotForecast({ forecast, offshoreWind }: Props) {
  const level = useLevel();
  const now = useNow(forecast.generatedAt);
  const [selectedTime, setSelectedTime] = useState<number | null>(null);

  const { hours, days } = forecast;
  const nowIndex = currentIndex(hours, now);
  const current = hours[nowIndex];
  const selected =
    hours.find((hour) => hour.time === selectedTime) ?? current;
  const isNow = selected.time === current.time;

  const dayKeys = [...new Set(hours.map((hour) => hour.day))];
  const today = current.day;
  const tomorrow = dayKeys[dayKeys.indexOf(today) + 1];
  const visibleDays = dayKeys.filter((day) => day >= today);

  const bestWindow = findBestWindow(hours, nowIndex, level);
  const currentScore = current.scores[level];
  const selectedScore = selected.scores[level];
  const sun = days.find((day) => day.day === selected.day);
  const wind = windType(selected.windDirection, offshoreWind);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
        <ScoreBadge value={currentScore} size="lg" />
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Agora · {LEVEL_LABELS[level]}
          </p>
          <p className="text-3xl font-bold capitalize">
            {scoreLabel(currentScore)}
          </p>
          <p className="text-sm text-slate-600">
            {formatNumber(current.swellHeight)} m ·{" "}
            {Math.round(current.swellPeriod)} s ·{" "}
            {compass(current.swellDirection)}
            <br />
            vento {compass(current.windDirection)}{" "}
            {Math.round(current.windSpeed)} km/h (
            {windType(current.windDirection, offshoreWind)})
          </p>
        </div>
      </section>

      <section className="rounded-2xl bg-sky-900 p-4 text-white">
        <p className="text-xs font-semibold tracking-wide text-sky-200 uppercase">
          Melhor janela da semana
        </p>
        {bestWindow ? (
          <div className="mt-1 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-2xl font-bold">
                {dayName(bestWindow.day, today, tomorrow)},{" "}
                {bestWindow.fromHour}h às {bestWindow.toHour}h
              </p>
              <p className="text-sm text-sky-100">
                Pico de nota {formatNumber(bestWindow.score)} (
                {scoreLabel(bestWindow.score)})
              </p>
            </div>
            <ScoreBadge value={bestWindow.score} />
          </div>
        ) : (
          <p className="mt-1 text-lg font-semibold">
            Nenhuma janela surfável nos próximos dias para o seu nível.
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold tracking-wide text-slate-500 uppercase">
          Próximos 7 dias
        </h2>
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <div className="flex items-center gap-2 pb-1">
            <span className="w-14 shrink-0" />
            <div className="grid flex-1 grid-cols-15 gap-0.5 text-center text-[10px] text-slate-400">
              {TIMELINE_HOURS.map((hour) => (
                <span key={hour}>{hour % 3 === 0 ? `${hour}h` : ""}</span>
              ))}
            </div>
          </div>

          {visibleDays.map((day) => {
            const byHour = new Map(
              hours
                .filter((hour) => hour.day === day)
                .map((hour) => [hour.hour, hour]),
            );
            return (
              <div key={day} className="flex items-center gap-2 py-0.5">
                <span className="w-14 shrink-0 text-xs font-medium text-slate-600 capitalize">
                  {dayName(day, today, tomorrow)}
                </span>
                <div className="grid flex-1 grid-cols-15 gap-0.5">
                  {TIMELINE_HOURS.map((hourOfDay) => {
                    const hour = byHour.get(hourOfDay);
                    if (!hour) return <span key={hourOfDay} className="h-8" />;

                    const value = hour.scores[level];
                    const past = hour.time < current.time;
                    const active = hour.time === selected.time;
                    return (
                      <button
                        key={hourOfDay}
                        type="button"
                        onClick={() => setSelectedTime(hour.time)}
                        aria-label={`${dayName(day, today, tomorrow)} ${hourOfDay}h: nota ${formatNumber(value)}`}
                        aria-pressed={active}
                        className={`h-8 rounded-sm ${SCORE_STYLES[scoreLabel(value)].bg} ${
                          past ? "opacity-30" : ""
                        } ${
                          active
                            ? "ring-2 ring-sky-900 ring-offset-1"
                            : "hover:brightness-95"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}

          <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
            {(Object.keys(SCORE_STYLES) as (keyof typeof SCORE_STYLES)[]).map(
              (label) => (
                <li key={label} className="flex items-center gap-1">
                  <span
                    className={`h-3 w-3 rounded-sm ${SCORE_STYLES[label].bg}`}
                  />
                  {label}
                </li>
              ),
            )}
          </ul>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Toque em um horário para ver os detalhes.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold capitalize">
              {isNow
                ? "Agora"
                : `${dayName(selected.day, today, tomorrow)}, ${selected.hour}h`}
            </h2>
            <p className="text-sm text-slate-500">
              {scoreLabel(selectedScore)} para {LEVEL_LABELS[level].toLowerCase()}
            </p>
          </div>
          {!isNow && (
            <button
              type="button"
              onClick={() => setSelectedTime(null)}
              className="rounded-lg px-2 py-1 text-sm font-medium text-sky-700 hover:bg-sky-50"
            >
              Voltar para agora
            </button>
          )}
          <ScoreBadge value={selectedScore} />
        </div>

        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Detail
            label="Swell"
            note={`ondas de ${formatNumber(selected.waveHeight)} m no total`}
          >
            {formatNumber(selected.swellHeight)} m
          </Detail>
          <Detail label="Período">
            {Math.round(selected.swellPeriod)} s
          </Detail>
          <Detail
            label="Direção do swell"
            note={`${Math.round(selected.swellDirection)}°`}
          >
            <DirectionArrow from={selected.swellDirection} />{" "}
            {compass(selected.swellDirection)}
          </Detail>
          <Detail
            label="Vento"
            note={`${wind}, rajadas de ${Math.round(selected.windGusts)} km/h`}
          >
            <DirectionArrow from={selected.windDirection} />{" "}
            {compass(selected.windDirection)} {Math.round(selected.windSpeed)}{" "}
            km/h
          </Detail>
          <Detail label="Maré" note="aproximada (nível do mar modelado)">
            {selected.tide ? TIDE_LABELS[selected.tide] : "Sem dado"}
          </Detail>
          <Detail
            label="Nascer do sol"
            note={sun ? `pôr do sol às ${formatClock(sun.sunset)}` : undefined}
          >
            {sun ? formatClock(sun.sunrise) : "–"}
          </Detail>
        </dl>
      </section>
    </div>
  );
}
