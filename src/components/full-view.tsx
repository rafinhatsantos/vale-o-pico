"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { HeatRibbons } from "@/components/heat-ribbons";
import { ScoreRing } from "@/components/score-ring";
import { SwellRose, WeekChart, WeekDonut } from "@/components/week-charts";
import {
  compass,
  dayLabel,
  formatNumber,
  SCORE_STYLES,
  TIDE_LABELS,
  windType,
} from "@/lib/format";
import { scoreLabel } from "@/lib/score";
import {
  LEVEL_LABELS,
  type ForecastHour,
  type Level,
  type Spot,
} from "@/lib/types";

interface Props {
  spot: Spot;
  hours: ForecastHour[];
  level: Level;
  /** Horário em curso. */
  current: ForecastHour;
  selected: ForecastHour;
  today: string;
  tomorrow: string | undefined;
  onSelect: (time: number | null) => void;
  onClose: () => void;
}

type MetricKey = "nota" | "ondas" | "periodo" | "vento" | "mare";

type Stop = [number, string];

interface Metric {
  key: MetricKey;
  label: string;
  /** Texto curto que explica o que a cor mostra. */
  hint: string;
  value: (hour: ForecastHour, level: Level) => number | null;
  format: (value: number) => string;
  /** Escala de cores; a da maré é montada com o mínimo e o máximo da semana. */
  stops?: Stop[];
}

const METRICS: Metric[] = [
  {
    key: "nota",
    label: "Nota",
    hint: "A nota de 0 a 10 para o seu nível",
    value: (hour, level) => hour.scores[level],
    format: (value) => formatNumber(value),
    stops: [
      [0, "#334155"],
      [1.2, "#64748b"],
      [2.5, "#fb923c"],
      [4.5, "#facc15"],
      [6.5, "#a3e635"],
      [8.5, "#34d399"],
      [10, "#2dd4bf"],
    ],
  },
  {
    key: "ondas",
    label: "Ondas",
    hint: "Altura do swell dominante, em metros",
    value: (hour) => hour.swellHeight,
    format: (value) => `${formatNumber(value)} m`,
    stops: [
      [0, "#0b3558"],
      [0.5, "#1d7fb8"],
      [1, "#22c7b8"],
      [1.5, "#7ddc5a"],
      [2, "#f5d33c"],
      [2.5, "#f58a2c"],
      [3, "#e23a3a"],
    ],
  },
  {
    key: "periodo",
    label: "Período",
    hint: "Período do swell dominante, em segundos",
    value: (hour) => hour.swellPeriod,
    format: (value) => `${Math.round(value)} s`,
    stops: [
      [5, "#241d4a"],
      [8, "#5b3fa8"],
      [11, "#8f5be8"],
      [14, "#d26be8"],
      [18, "#ffd1f5"],
    ],
  },
  {
    key: "vento",
    label: "Vento",
    hint: "Velocidade do vento, em km/h",
    value: (hour) => hour.windSpeed,
    format: (value) => `${Math.round(value)} km/h`,
    stops: [
      [0, "#103a3a"],
      [10, "#1f9d7a"],
      [20, "#e8d43a"],
      [30, "#f08a2c"],
      [45, "#d92f4b"],
    ],
  },
  {
    key: "mare",
    label: "Maré",
    hint: "Nível do mar (aproximado), em metros",
    value: (hour) => hour.seaLevel,
    format: (value) => `${formatNumber(value)} m`,
  },
];

const TIDE_COLORS = ["#0b2742", "#1f6fb5", "#9bd8ff"];
const NO_DATA = "#1e293b";
/** Intervalo entre um horário e o próximo ao reproduzir a semana. */
const PLAY_INTERVAL_MS = 420;

function hexToRgb(hex: string): [number, number, number] {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

/** Cor interpolada em uma escala de pontos [valor, cor]. */
function ramp(stops: Stop[], value: number): string {
  if (value <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    if (value <= stops[i][0]) {
      const [x0, c0] = stops[i - 1];
      const [x1, c1] = stops[i];
      const t = (value - x0) / (x1 - x0);
      const from = hexToRgb(c0);
      const to = hexToRgb(c1);
      const mix = from.map((channel, index) =>
        Math.round(channel + (to[index] - channel) * t),
      );
      return `rgb(${mix.join(" ")})`;
    }
  }
  return stops[stops.length - 1][1];
}

function Arrow({ from }: { from: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="inline-block h-4 w-4 align-[-2px] transition-transform duration-500"
      style={{ transform: `rotate(${from + 180}deg)` }}
      aria-hidden="true"
    >
      <path d="M12 3l6 9h-4v9h-4v-9H6z" fill="currentColor" />
    </svg>
  );
}

function Stat({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-24">
      <p className="text-[10px] font-semibold tracking-wider text-mist uppercase">
        {label}
      </p>
      <p className="font-display text-xl font-bold whitespace-nowrap">
        {children}
      </p>
    </div>
  );
}

/**
 * Tela cheia no estilo "previsão do tempo do jornal": mapa de calor da semana
 * por variável, com reprodução automática hora a hora.
 */
export function FullView({
  spot,
  hours,
  level,
  current,
  selected,
  today,
  tomorrow,
  onSelect,
  onClose,
}: Props) {
  const [metricKey, setMetricKey] = useState<MetricKey>("nota");
  const [playing, setPlaying] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const metric = METRICS.find((item) => item.key === metricKey) ?? METRICS[0];

  // Guarda o onClose mais recente sem refazer o efeito abaixo a cada render.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Ao abrir: foca o botão de fechar, trava a rolagem da página por baixo e
  // passa a fechar com Esc.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Reprodução: avança pelas horas de sol, como a animação do telejornal.
  const playable = hours.filter(
    (hour) => hour.daylight && hour.time >= current.time,
  );
  const selectedTime = selected.time;
  const lastPlayable = playable[playable.length - 1]?.time;
  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      const next = playable.find((hour) => hour.time > selectedTime);
      if (next) onSelect(next.time);
      if (!next || next.time === lastPlayable) setPlaying(false);
    }, PLAY_INTERVAL_MS);
    return () => window.clearTimeout(timer);
    // `playable` é derivado de `hours` e `current`; a lista não muda entre passos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, selectedTime, lastPlayable, onSelect]);

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    // No fim da semana (ou fora das horas de sol), recomeça do início.
    if (!playable.some((hour) => hour.time > selectedTime)) {
      onSelect(playable[0]?.time ?? null);
    }
    setPlaying(true);
  };

  const days = [...new Set(hours.map((hour) => hour.day))].filter(
    (day) => day >= today,
  );
  const byDay = new Map(
    days.map((day) => [
      day,
      new Map(
        hours.filter((hour) => hour.day === day).map((hour) => [hour.hour, hour]),
      ),
    ]),
  );

  const levels = hours
    .map((hour) => hour.seaLevel)
    .filter((value): value is number => value !== null);
  const tideMin = Math.min(...levels);
  const tideMax = Math.max(...levels);
  const tideStops: Stop[] = [
    [tideMin, TIDE_COLORS[0]],
    [(tideMin + tideMax) / 2, TIDE_COLORS[1]],
    [tideMax, TIDE_COLORS[2]],
  ];
  const stops = metric.key === "mare" ? tideStops : metric.stops;

  const colorOf = (hour: ForecastHour): string => {
    const value = metric.value(hour, level);
    if (value === null) return NO_DATA;
    return stops ? ramp(stops, value) : NO_DATA;
  };

  // Dados dos gráficos: a semana a partir de hoje.
  const visible = hours.filter((hour) => hour.day >= today);
  const swellMax = Math.max(
    2,
    Math.ceil(Math.max(...visible.map((hour) => hour.waveHeight)) * 2) / 2,
  );
  const windMax = Math.max(
    30,
    Math.ceil(Math.max(...visible.map((hour) => hour.windGusts)) / 10) * 10,
  );
  const tidePad = Math.max(0.05, (tideMax - tideMin) * 0.15);
  const chartProps = {
    hours: visible,
    selectedTime: selected.time,
    currentTime: current.time,
    today,
    tomorrow,
    onSelect: (time: number) => {
      if (!playing) onSelect(time);
    },
  };
  const WIND_COLORS = { terral: "#34d399", lateral: "#facc15", maral: "#fb923c" };

  const selectedScore = selected.scores[level];
  const selectedLabel = scoreLabel(selectedScore);
  const wind = windType(selected.windDirection, spot.offshoreWind);
  const isNow = selected.time === current.time;

  // Vai direto no body para ficar por cima do cabeçalho fixo do site.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Visão completa de ${spot.name}`}
      className="fixed inset-0 z-50 animate-fade-in overflow-x-hidden overflow-y-auto bg-abyss/95 backdrop-blur-xl [animation-duration:250ms]"
    >
      <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wider text-aqua uppercase">
              Visão completa · {LEVEL_LABELS[level]}
            </p>
            <h2 className="font-display text-4xl leading-none font-extrabold tracking-tight sm:text-5xl">
              {spot.name}
            </h2>
            <p className="mt-1 text-sm text-mist">
              A semana inteira, hora a hora. Troque a variável, passe pelo mapa
              de calor ou reproduza a previsão.
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="glass shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:text-aqua"
          >
            Fechar ✕
          </button>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            role="radiogroup"
            aria-label="Variável do mapa de calor"
            className="flex max-w-full flex-wrap gap-1 rounded-3xl bg-white/5 p-1 ring-1 ring-white/10"
          >
            {METRICS.map((item) => (
              <button
                key={item.key}
                type="button"
                role="radio"
                aria-checked={item.key === metricKey}
                onClick={() => setMetricKey(item.key)}
                className={`rounded-full px-2.5 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors duration-300 sm:px-4 ${
                  item.key === metricKey
                    ? "bg-gradient-to-r from-aqua to-cyan-300 text-abyss"
                    : "text-mist hover:text-foam"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-sm font-semibold ring-1 ring-white/15 transition-colors hover:bg-white/20"
            >
              {playing ? "❚❚ Pausar" : "▶ Reproduzir a semana"}
            </button>
            {!isNow && (
              <button
                type="button"
                onClick={() => {
                  setPlaying(false);
                  onSelect(null);
                }}
                className="rounded-full bg-white/5 px-4 py-2 text-sm font-semibold ring-1 ring-white/10 transition-colors hover:bg-white/15"
              >
                Agora
              </button>
            )}
          </div>
        </div>

        <section className="glass rounded-3xl p-4 sm:p-6">
          <HeatRibbons
            hours={visible}
            days={days}
            byDay={byDay}
            colorOf={colorOf}
            valueOf={(hour) => metric.value(hour, level)}
            format={metric.format}
            selected={selected}
            current={current}
            today={today}
            tomorrow={tomorrow}
            onSelect={(time) => {
              if (!playing) onSelect(time);
            }}
          />

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-mist">
            <p>
              {metric.hint}. A faixa engrossa nas horas de sol e afina à noite;
              o que já passou fica apagado. O número em cada faixa é o pico
              do dia.
            </p>
            {stops && (
              <div className="flex items-center gap-2">
                <span>
                  {metric.key === "nota" ? "flat" : metric.format(stops[0][0])}
                </span>
                <span
                  className="h-2.5 w-44 rounded-full"
                  style={{
                    background: `linear-gradient(to right, ${stops
                      .map(([, color]) => color)
                      .join(", ")})`,
                  }}
                />
                <span>
                  {metric.key === "nota"
                    ? "clássico"
                    : metric.format(stops[stops.length - 1][0])}
                </span>
              </div>
            )}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-aqua/25 via-cyan-500/10 to-transparent p-px">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-5 rounded-[calc(1.5rem-1px)] bg-deep/90 p-5 sm:p-6">
            <div className="flex items-center gap-4">
              <ScoreRing value={selectedScore} size="md" />
              <div>
                <p className="text-xs font-semibold tracking-wider text-mist uppercase">
                  {isNow
                    ? "Agora"
                    : `${dayLabel(selected.day, today, tomorrow)} · ${selected.hour}h`}
                </p>
                <p
                  className={`font-display text-3xl font-extrabold capitalize ${SCORE_STYLES[selectedLabel].ink}`}
                >
                  {selectedLabel}
                </p>
              </div>
            </div>

            <div className="flex flex-1 flex-wrap gap-x-8 gap-y-4">
              <Stat label="Ondas">{formatNumber(selected.swellHeight)} m</Stat>
              <Stat label="Período">{Math.round(selected.swellPeriod)} s</Stat>
              <Stat label="Swell">
                <Arrow from={selected.swellDirection} />{" "}
                {compass(selected.swellDirection)}
              </Stat>
              {selected.otherSwell && (
                <Stat label="Outro swell">
                  {formatNumber(selected.otherSwell.height)} m ·{" "}
                  {Math.round(selected.otherSwell.period)} s{" "}
                  <Arrow from={selected.otherSwell.direction} />{" "}
                  {compass(selected.otherSwell.direction)}
                </Stat>
              )}
              <Stat label={`Vento (${wind})`}>
                <Arrow from={selected.windDirection} />{" "}
                {compass(selected.windDirection)}{" "}
                {Math.round(selected.windSpeed)} km/h
              </Stat>
              <Stat label="Maré">
                {selected.tide ? TIDE_LABELS[selected.tide] : "–"}
              </Stat>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-5">
          <div>
            <h3 className="font-display text-2xl font-bold">
              Gráficos da semana
            </h3>
            <p className="text-sm text-mist">
              Passe o mouse ou o dedo por qualquer gráfico: todos acompanham o
              mesmo horário. As faixas escuras são as noites.
            </p>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <WeekChart
              {...chartProps}
              title="Nota"
              left={{ min: 0, max: 10, format: (value) => formatNumber(value, 0) }}
              series={[
                {
                  label: LEVEL_LABELS[level],
                  color: "#5ee6d8",
                  kind: "area",
                  values: visible.map((hour) => hour.scores[level]),
                  format: (value) => formatNumber(value),
                },
              ]}
            />
            <WeekChart
              {...chartProps}
              title="Ondas e período"
              left={{
                min: 0,
                max: swellMax,
                format: (value) => `${formatNumber(value)} m`,
              }}
              right={{ min: 0, max: 20, format: (value) => `${Math.round(value)} s` }}
              series={[
                {
                  label: "Swell",
                  color: "#38bdf8",
                  kind: "area",
                  values: visible.map((hour) => hour.swellHeight),
                  format: (value) => `${formatNumber(value)} m`,
                },
                {
                  label: "Ondas no total",
                  color: "#94a3b8",
                  kind: "dashed",
                  values: visible.map((hour) => hour.waveHeight),
                  format: (value) => `${formatNumber(value)} m`,
                },
                {
                  label: "Período",
                  color: "#c084fc",
                  kind: "line",
                  axis: "right",
                  values: visible.map((hour) => hour.swellPeriod),
                  format: (value) => `${Math.round(value)} s`,
                },
              ]}
            />
            <WeekChart
              {...chartProps}
              title="Vento"
              left={{
                min: 0,
                max: windMax,
                format: (value) => `${Math.round(value)} km/h`,
              }}
              series={[
                {
                  label: "Vento",
                  color: "#facc15",
                  kind: "area",
                  values: visible.map((hour) => hour.windSpeed),
                  format: (value) => `${Math.round(value)} km/h`,
                },
                {
                  label: "Rajadas",
                  color: "#fb923c",
                  kind: "dashed",
                  values: visible.map((hour) => hour.windGusts),
                  format: (value) => `${Math.round(value)} km/h`,
                },
              ]}
              overlay={(x, top) =>
                visible.map((hour, index) =>
                  index % 6 === 3 ? (
                    <g
                      key={hour.time}
                      transform={`translate(${x(index)} ${top + 14}) rotate(${hour.windDirection + 180})`}
                    >
                      <path
                        d="M0 -8 L6 2 H2.200 V8 H-2.200 V2 H-6 Z"
                        fill={
                          WIND_COLORS[
                            windType(hour.windDirection, spot.offshoreWind)
                          ]
                        }
                      />
                    </g>
                  ) : null,
                )
              }
            />
            <WeekChart
              {...chartProps}
              title="Maré (aproximada)"
              left={{
                min: tideMin - tidePad,
                max: tideMax + tidePad,
                format: (value) => `${formatNumber(value)} m`,
              }}
              series={[
                {
                  label: "Nível do mar",
                  color: "#7dd3fc",
                  kind: "area",
                  values: visible.map((hour) => hour.seaLevel),
                  format: (value) => `${formatNumber(value)} m`,
                },
              ]}
            />
          </div>
          <p className="-mt-2 text-xs text-mist">
            No gráfico de vento, as setas mostram para onde ele sopra: verde é
            terral, amarelo é lateral e laranja é maral.
          </p>

          <div className="grid gap-5 lg:grid-cols-2">
            <SwellRose hours={visible} spot={spot} />
            <WeekDonut hours={visible} level={level} />
          </div>
        </section>

        <section>
          <h3 className="mb-3 font-display text-xl font-bold">
            Resumo dos dias
          </h3>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {days.map((day) => {
              const dayHours = [...(byDay.get(day)?.values() ?? [])];
              const sunny = dayHours.filter((hour) => hour.daylight);
              const upcoming = sunny.filter(
                (hour) => hour.time >= current.time,
              );
              const pool = upcoming.length > 0 ? upcoming : sunny;
              if (pool.length === 0) return null;

              const best = pool.reduce((top, hour) =>
                hour.scores[level] > top.scores[level] ? hour : top,
              );
              const heights = sunny.map((hour) => hour.swellHeight);
              const score = best.scores[level];
              const label = scoreLabel(score);

              return (
                <li key={day}>
                  <button
                    type="button"
                    onClick={() => {
                      setPlaying(false);
                      onSelect(best.time);
                    }}
                    className={`flex w-full flex-col items-center gap-2 rounded-2xl p-4 text-center ring-1 transition-all duration-300 hover:-translate-y-1 ${
                      day === selected.day
                        ? "bg-white/15 ring-aqua/70"
                        : "bg-white/5 ring-white/8 hover:bg-white/10"
                    }`}
                  >
                    <span className="text-sm font-semibold text-mist">
                      {dayLabel(day, today, tomorrow)}
                    </span>
                    <ScoreRing value={score} />
                    <span
                      className={`text-sm font-bold capitalize ${SCORE_STYLES[label].ink}`}
                    >
                      {label}
                    </span>
                    <span className="text-xs text-mist">
                      melhor às {best.hour}h
                      <br />
                      {formatNumber(Math.min(...heights))} a{" "}
                      {formatNumber(Math.max(...heights))} m ·{" "}
                      {Math.round(best.swellPeriod)} s
                      <br />
                      vento {compass(best.windDirection)}{" "}
                      {Math.round(best.windSpeed)} km/h
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>,
    document.body,
  );
}
