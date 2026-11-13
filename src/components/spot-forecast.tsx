"use client";

import { useState } from "react";

import { Compass } from "@/components/compass";
import { FullView } from "@/components/full-view";
import { ScoreRing } from "@/components/score-ring";
import { useLevel } from "@/hooks/use-level";
import { currentIndex, useNow } from "@/hooks/use-now";
import {
  compass,
  dayLabel,
  formatClock,
  formatNumber,
  SCORE_PHRASES,
  SCORE_STYLES,
  TIDE_LABELS,
  windType,
} from "@/lib/format";
import {
  effectiveSize,
  periodFactor,
  scoreLabel,
  sizeFactor,
  tideFactor,
  windFactor,
} from "@/lib/score";
import {
  LEVEL_LABELS,
  type Forecast,
  type ForecastHour,
  type Level,
  type Spot,
} from "@/lib/types";

/** Faixa de horas mostrada no gráfico (cobre o dia claro o ano todo). */
const FIRST_HOUR = 5;
const LAST_HOUR = 19;
const CHART_HOURS = Array.from(
  { length: LAST_HOUR - FIRST_HOUR + 1 },
  (_, index) => FIRST_HOUR + index,
);

/** Notas até esta distância do pico entram na mesma janela. */
const WINDOW_TOLERANCE = 1;
/** Abaixo disso não vale chamar de "melhor janela". */
const MIN_WINDOW_SCORE = 1.5;

interface Props {
  forecast: Forecast;
  spot: Spot;
}

interface BestWindow {
  day: string;
  fromHour: number;
  toHour: number;
  score: number;
  peakTime: number;
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
    peakTime: best.time,
  };
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-white/8 px-3 py-1 text-sm font-medium ring-1 ring-white/10">
      {children}
    </span>
  );
}

function Tile({
  label,
  value,
  note,
}: {
  label: string;
  value: React.ReactNode;
  note?: string;
}) {
  return (
    <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/8 transition-colors hover:bg-white/8">
      <dt className="text-[11px] font-semibold tracking-wider text-mist uppercase">
        {label}
      </dt>
      <dd className="mt-1">
        <span className="block font-display text-2xl font-bold">{value}</span>
        {note && (
          <span className="mt-0.5 block text-xs text-mist">{note}</span>
        )}
      </dd>
    </div>
  );
}

/** Barra que mostra quanto um fator segurou ou derrubou a nota. */
function FactorMeter({
  label,
  factor,
  note,
}: {
  label: string;
  factor: number;
  note: string;
}) {
  const percent = Math.round(factor * 100);
  const color =
    factor >= 0.85 ? "#34d399" : factor >= 0.6 ? "#facc15" : "#fb923c";

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-semibold">{label}</span>
        <span className="text-sm text-mist">{note}</span>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full transition-[width,background-color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              width: `${Math.max(3, percent)}%`,
              background: color,
              boxShadow: `0 0 12px ${color}88`,
            }}
          />
        </div>
        <span className="w-11 text-right font-display text-sm font-bold tabular-nums">
          {percent}%
        </span>
      </div>
    </div>
  );
}

/** Curva do nível do mar no dia, com o horário escolhido marcado. */
function TideCurve({
  hours,
  selectedHour,
}: {
  hours: ForecastHour[];
  selectedHour: number;
}) {
  const points = hours
    .filter((hour) => hour.seaLevel !== null)
    .map((hour) => ({ hour: hour.hour, level: hour.seaLevel as number }));
  if (points.length < 6) return null;

  const width = 300;
  const height = 72;
  const min = Math.min(...points.map((point) => point.level));
  const max = Math.max(...points.map((point) => point.level));
  const range = Math.max(0.05, max - min);
  const x = (hour: number) => (hour / 23) * width;
  const y = (level: number) =>
    height - 10 - ((level - min) / range) * (height - 22);

  const line = points
    .map((point) => `${x(point.hour).toFixed(1)},${y(point.level).toFixed(1)}`)
    .join(" ");
  const marker = points.find((point) => point.hour === selectedHour);

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label="Curva da maré ao longo do dia"
      >
        <defs>
          <linearGradient id="tide-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#38bdf8" stopOpacity="0.45" />
            <stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points={`0,${height} ${line} ${width},${height}`}
          fill="url(#tide-fill)"
        />
        <polyline
          points={line}
          fill="none"
          stroke="#7dd3fc"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {marker && (
          <g
            style={{
              transform: `translate(${x(marker.hour)}px, ${y(marker.level)}px)`,
              transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <circle r="9" fill="#5ee6d8" opacity="0.25" />
            <circle r="4.5" fill="#5ee6d8" stroke="#030d16" strokeWidth="1.5" />
          </g>
        )}
      </svg>
      <div className="flex justify-between text-[10px] text-mist">
        <span>0h</span>
        <span>6h</span>
        <span>12h</span>
        <span>18h</span>
        <span>23h</span>
      </div>
    </div>
  );
}

export function SpotForecast({ forecast, spot }: Props) {
  const level = useLevel();
  const now = useNow(forecast.generatedAt);
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [scrubbing, setScrubbing] = useState(false);
  const [fullView, setFullView] = useState(false);

  const { hours, days } = forecast;
  const nowIndex = currentIndex(hours, now);
  const current = hours[nowIndex];
  const selected = hours.find((hour) => hour.time === selectedTime) ?? current;
  const isNow = selected.time === current.time;

  const dayKeys = [...new Set(hours.map((hour) => hour.day))];
  const today = current.day;
  const tomorrow = dayKeys[dayKeys.indexOf(today) + 1];
  const visibleDays = dayKeys.filter((day) => day >= today);

  const currentScore = current.scores[level];
  const currentLabel = scoreLabel(currentScore);
  const selectedScore = selected.scores[level];
  const selectedLabel = scoreLabel(selectedScore);
  const bestWindow = findBestWindow(hours, nowIndex, level);

  const dayHours = hours.filter((hour) => hour.day === selected.day);
  const byHour = new Map(dayHours.map((hour) => [hour.hour, hour]));
  const sun = days.find((day) => day.day === selected.day);
  const wind = windType(selected.windDirection, spot.offshoreWind);
  const size = effectiveSize(selected, spot);

  const factors = [
    {
      label: "Tamanho",
      factor: sizeFactor(size, level),
      note: `${formatNumber(size)} m efetivos no pico`,
    },
    {
      label: "Período",
      factor: periodFactor(selected.swellPeriod),
      note: `${Math.round(selected.swellPeriod)} s`,
    },
    {
      label: "Vento",
      factor: windFactor(
        selected.windSpeed,
        selected.windDirection,
        spot.offshoreWind,
      ),
      note: `${wind}, ${Math.round(selected.windSpeed)} km/h`,
    },
    {
      label: "Maré",
      factor: tideFactor(selected.tide, spot.tide),
      note: selected.tide ? TIDE_LABELS[selected.tide].toLowerCase() : "sem dado",
    },
  ];

  /** Melhor horário de sol de um dia, a partir de agora. */
  const bestOfDay = (day: string) => {
    const daylight = hours.filter((hour) => hour.day === day && hour.daylight);
    const upcoming = daylight.filter((hour) => hour.time >= current.time);
    // À noite não sobra hora de sol hoje: mostra como o dia foi.
    const candidates = upcoming.length > 0 ? upcoming : daylight;
    return candidates.reduce<ForecastHour | null>(
      (top, hour) =>
        top === null || hour.scores[level] > top.scores[level] ? hour : top,
      null,
    );
  };

  const selectDay = (day: string) => {
    if (day === today) {
      setSelectedTime(null);
      return;
    }
    const best = bestOfDay(day);
    if (best) setSelectedTime(best.time);
  };

  const selectFromPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - bounds.left) / bounds.width;
    const index = Math.min(
      CHART_HOURS.length - 1,
      Math.max(0, Math.floor(ratio * CHART_HOURS.length)),
    );
    const hour = byHour.get(CHART_HOURS[index]);
    if (hour) setSelectedTime(hour.time);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4">
      {fullView && (
        <FullView
          spot={spot}
          hours={hours}
          level={level}
          current={current}
          selected={selected}
          today={today}
          tomorrow={tomorrow}
          onSelect={setSelectedTime}
          onClose={() => setFullView(false)}
        />
      )}
      <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
        <section className="glass flex animate-fade-up flex-col items-center gap-6 rounded-3xl p-6 sm:flex-row sm:p-8">
          <ScoreRing value={currentScore} size="lg" />
          <div className="min-w-0 text-center sm:text-left">
            <p className="text-xs font-semibold tracking-wider text-mist uppercase">
              Agora · {LEVEL_LABELS[level]}
            </p>
            <p
              className={`font-display text-5xl font-extrabold capitalize ${SCORE_STYLES[currentLabel].ink}`}
            >
              {currentLabel}
            </p>
            <p className="mt-1 text-mist">{SCORE_PHRASES[currentLabel]}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Chip>{formatNumber(current.swellHeight)} m</Chip>
              <Chip>{Math.round(current.swellPeriod)} s</Chip>
              <Chip>swell {compass(current.swellDirection)}</Chip>
              <Chip>
                {windType(current.windDirection, spot.offshoreWind)}{" "}
                {Math.round(current.windSpeed)} km/h
              </Chip>
            </div>
          </div>
        </section>

        <section
          className="relative animate-fade-up overflow-hidden rounded-3xl bg-gradient-to-br from-aqua/25 via-cyan-500/10 to-transparent p-px"
          style={{ animationDelay: "90ms" }}
        >
          <div className="flex h-full flex-col justify-between gap-5 rounded-[calc(1.5rem-1px)] bg-deep/90 p-6 sm:p-8">
            <div>
              <p className="text-xs font-semibold tracking-wider text-aqua uppercase">
                Melhor janela da semana
              </p>
              {bestWindow ? (
                <>
                  <p className="mt-2 font-display text-4xl leading-tight font-extrabold">
                    {dayLabel(bestWindow.day, today, tomorrow)}
                    <span className="text-mist">, </span>
                    {bestWindow.fromHour}h às {bestWindow.toHour}h
                  </p>
                  <p className="mt-2 text-mist">
                    Pico de nota{" "}
                    <span
                      className={`font-semibold ${SCORE_STYLES[scoreLabel(bestWindow.score)].ink}`}
                    >
                      {formatNumber(bestWindow.score)} (
                      {scoreLabel(bestWindow.score)})
                    </span>
                  </p>
                </>
              ) : (
                <p className="mt-2 font-display text-2xl font-bold">
                  Nenhuma janela surfável nos próximos dias para o seu nível.
                </p>
              )}
            </div>
            {bestWindow && (
              <button
                type="button"
                onClick={() => setSelectedTime(bestWindow.peakTime)}
                className="group inline-flex items-center gap-2 self-start rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold ring-1 ring-white/15 transition-all hover:bg-aqua hover:text-abyss"
              >
                Ver esse horário
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>
            )}
          </div>
        </section>
      </div>

      <section
        className="glass animate-fade-up rounded-3xl p-5 sm:p-8"
        style={{ animationDelay: "160ms" }}
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold">Próximos 7 dias</h2>
            <p className="text-sm text-mist">
              Escolha o dia e arraste pelo gráfico para explorar cada hora.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!isNow && (
              <button
                type="button"
                onClick={() => setSelectedTime(null)}
                className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold ring-1 ring-white/15 transition-colors hover:bg-white/20"
              >
                ← Voltar para agora
              </button>
            )}
            <button
              type="button"
              onClick={() => setFullView(true)}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-aqua to-cyan-300 px-4 py-1.5 text-sm font-semibold text-abyss shadow-[0_0_24px_-6px] shadow-aqua/70 transition-transform hover:scale-[1.04]"
            >
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
                <path
                  d="M1 1h4v4H1zM6 1h4v4H6zM11 1h4v4h-4zM1 6h4v4H1zM6 6h4v4H6zM11 6h4v4h-4zM1 11h4v4H1zM6 11h4v4H6zM11 11h4v4h-4z"
                  fill="currentColor"
                />
              </svg>
              Visão completa
            </button>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Dias da previsão"
          className="no-scrollbar -mx-5 mt-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0"
        >
          {visibleDays.map((day) => {
            const best = bestOfDay(day);
            const value = best ? best.scores[level] : null;
            const active = day === selected.day;
            const color =
              value === null ? "#64748b" : SCORE_STYLES[scoreLabel(value)].hex;
            return (
              <button
                key={day}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => selectDay(day)}
                className={`flex min-w-20 flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-3 ring-1 transition-all duration-300 ${
                  active
                    ? "bg-white/15 ring-aqua/70"
                    : "bg-white/5 ring-white/8 hover:bg-white/10"
                }`}
              >
                <span className="text-xs font-semibold whitespace-nowrap text-mist">
                  {dayLabel(day, today, tomorrow)}
                </span>
                <span className="font-display text-xl font-bold tabular-nums">
                  {value === null ? "–" : formatNumber(value)}
                </span>
                <span
                  className="h-1 w-8 rounded-full"
                  style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                />
              </button>
            );
          })}
        </div>

        <div className="mt-8">
          <div
            className={`relative flex h-52 touch-pan-y items-end gap-1 select-none sm:gap-1.5 ${
              scrubbing ? "cursor-grabbing" : "cursor-grab"
            }`}
            onPointerDown={(event) => {
              setScrubbing(true);
              selectFromPointer(event);
            }}
            onPointerMove={(event) => {
              if (scrubbing) selectFromPointer(event);
            }}
            onPointerUp={() => setScrubbing(false)}
            onPointerLeave={() => setScrubbing(false)}
            onPointerCancel={() => setScrubbing(false)}
          >
            {[2.5, 5, 7.5, 10].map((line) => (
              <div
                key={line}
                className="pointer-events-none absolute inset-x-0 border-t border-dashed border-white/8"
                style={{ bottom: `${line * 10}%` }}
              >
                <span className="absolute -top-2 right-0 bg-transparent text-[9px] text-mist/70">
                  {line === 10 ? "10" : formatNumber(line)}
                </span>
              </div>
            ))}

            {CHART_HOURS.map((hourOfDay) => {
              const hour = byHour.get(hourOfDay);
              if (!hour) return <div key={hourOfDay} className="flex-1" />;

              const value = hour.scores[level];
              const color = SCORE_STYLES[scoreLabel(value)].hex;
              const active = hour.time === selected.time;
              const past = hour.time < current.time;

              return (
                <button
                  key={hourOfDay}
                  type="button"
                  onClick={() => setSelectedTime(hour.time)}
                  aria-label={`${hourOfDay}h: nota ${formatNumber(value)}`}
                  aria-pressed={active}
                  className="group relative flex h-full flex-1 items-end outline-none"
                >
                  <span
                    className={`absolute inset-x-0 text-center font-display text-xs font-bold tabular-nums transition-[opacity,bottom] duration-500 ${
                      active ? "opacity-100" : "opacity-0"
                    }`}
                    style={{ bottom: `calc(${Math.max(4, value * 10)}% + 4px)` }}
                  >
                    {formatNumber(value)}
                  </span>
                  <span
                    className={`w-full rounded-t-lg transition-[height,background-color,opacity,box-shadow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100 group-focus-visible:ring-2 group-focus-visible:ring-white ${
                      active ? "opacity-100" : past ? "opacity-25" : "opacity-65"
                    }`}
                    style={{
                      height: `${Math.max(4, value * 10)}%`,
                      background: `linear-gradient(to top, ${color}55, ${color})`,
                      boxShadow: active ? `0 0 22px ${color}aa` : "none",
                    }}
                  />
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex gap-1 text-center text-[10px] text-mist sm:gap-1.5">
            {CHART_HOURS.map((hourOfDay) => (
              <span
                key={hourOfDay}
                className={`flex-1 ${
                  selected.hour === hourOfDay ? "font-bold text-foam" : ""
                }`}
              >
                {hourOfDay}h
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="glass rounded-3xl p-6 lg:col-span-1">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-wider text-mist uppercase">
                {isNow
                  ? "Agora"
                  : `${dayLabel(selected.day, today, tomorrow)}, ${selected.hour}h`}
              </p>
              <h2
                className={`font-display text-3xl font-extrabold capitalize ${SCORE_STYLES[selectedLabel].ink}`}
              >
                {selectedLabel}
              </h2>
            </div>
            <ScoreRing value={selectedScore} size="md" />
          </div>

          <h3 className="mt-6 text-sm font-semibold text-mist">
            Por que essa nota
          </h3>
          <div className="mt-3 flex flex-col gap-4">
            {factors.map((item) => (
              <FactorMeter key={item.label} {...item} />
            ))}
          </div>
          <p className="mt-4 text-xs text-mist">
            Os fatores se multiplicam: um fator baixo derruba a nota inteira.
          </p>
        </section>

        <section className="glass flex flex-col rounded-3xl p-6">
          <h2 className="font-display text-xl font-bold">Swell e vento</h2>
          <div className="mx-auto my-2 aspect-square w-full max-w-64">
            <Compass
              coastOrientation={spot.coastOrientation}
              swellDirection={selected.swellDirection}
              windDirection={selected.windDirection}
            />
          </div>
          <ul className="mt-auto flex flex-col gap-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-6 rounded-full bg-aqua" />
              <span className="text-mist">Swell de</span>
              <strong>
                {compass(selected.swellDirection)} (
                {Math.round(selected.swellDirection)}°)
              </strong>
            </li>
            {selected.otherSwell && (
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-6 rounded-full bg-white/25" />
                <span className="text-mist">Outro swell</span>
                <strong>
                  {formatNumber(selected.otherSwell.height)} m ·{" "}
                  {Math.round(selected.otherSwell.period)} s de{" "}
                  {compass(selected.otherSwell.direction)}
                </strong>
              </li>
            )}
            <li className="flex items-center gap-2">
              <span className="h-0.5 w-6 rounded-full bg-slate-50" />
              <span className="text-mist">Vento de</span>
              <strong>
                {compass(selected.windDirection)}, {wind}
              </strong>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-6 rounded-full bg-[#e7c98f]" />
              <span className="text-mist">Areia: praia virada para</span>
              <strong>{compass(spot.coastOrientation)}</strong>
            </li>
          </ul>
        </section>

        <section className="glass flex flex-col gap-4 rounded-3xl p-6">
          <h2 className="font-display text-xl font-bold">Detalhes</h2>
          <dl className="grid grid-cols-2 gap-3">
            <Tile
              label="Swell"
              value={`${formatNumber(selected.swellHeight)} m`}
              note={`ondas de ${formatNumber(selected.waveHeight)} m no total`}
            />
            <Tile
              label="Período"
              value={`${Math.round(selected.swellPeriod)} s`}
              note={
                selected.otherSwell
                  ? "do swell usado na nota (o dominante)"
                  : undefined
              }
            />
            <Tile
              label="Vento"
              value={`${Math.round(selected.windSpeed)} km/h`}
              note={`rajadas de ${Math.round(selected.windGusts)} km/h`}
            />
            <Tile
              label="Sol"
              value={sun ? formatClock(sun.sunrise) : "–"}
              note={sun ? `se põe às ${formatClock(sun.sunset)}` : undefined}
            />
          </dl>
          <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/8">
            <div className="flex items-baseline justify-between">
              <p className="text-[11px] font-semibold tracking-wider text-mist uppercase">
                Maré
              </p>
              <p className="font-display text-lg font-bold">
                {selected.tide ? TIDE_LABELS[selected.tide] : "Sem dado"}
              </p>
            </div>
            <div className="mt-2">
              <TideCurve hours={dayHours} selectedHour={selected.hour} />
            </div>
            <p className="mt-2 text-xs text-mist">
              Aproximada: nível do mar de modelo, não a tábua oficial.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
