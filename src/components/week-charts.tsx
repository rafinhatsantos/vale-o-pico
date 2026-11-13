"use client";

import { useEffect, useRef, useState } from "react";

import { dayLabel, SCORE_STYLES } from "@/lib/format";
import { directionFit, scoreLabel } from "@/lib/score";
import type { ForecastHour, Level, ScoreLabel, Spot } from "@/lib/types";

/* -------------------------------------------------------------------------- */
/* Gráfico de linhas da semana                                                */
/* -------------------------------------------------------------------------- */

export interface ChartSeries {
  label: string;
  color: string;
  /** Um valor por horário, na mesma ordem de `hours`. */
  values: (number | null)[];
  kind: "area" | "line" | "dashed";
  /** Eixo usado pela série; o da direita é opcional. */
  axis?: "left" | "right";
  format: (value: number) => string;
}

interface Axis {
  min: number;
  max: number;
  format: (value: number) => string;
}

interface WeekChartProps {
  title: string;
  hours: ForecastHour[];
  series: ChartSeries[];
  left: Axis;
  right?: Axis;
  selectedTime: number;
  currentTime: number;
  today: string;
  tomorrow: string | undefined;
  onSelect: (time: number) => void;
  /** Desenho extra por cima do gráfico (as setas do vento, por exemplo). */
  overlay?: (x: (index: number) => number, top: number) => React.ReactNode;
}

/** Largura de referência: acima dela o desenho só escala; abaixo, ele se ajusta. */
const WIDTH = 720;
const MIN_WIDTH = 280;
const HEIGHT = 220;
const PLOT = { top: 14, bottom: 30 };
const PLOT_HEIGHT = HEIGHT - PLOT.top - PLOT.bottom;
const BASELINE = PLOT.top + PLOT_HEIGHT;

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/** Rótulo curto do dia para telas estreitas: "Hoje" ou o dia da semana. */
function shortDayLabel(day: string, today: string): string {
  if (day === today) return "Hoje";
  return WEEKDAYS[new Date(`${day}T12:00:00Z`).getUTCDay()];
}

/**
 * Largura disponível do contêiner. No celular o gráfico se desenha nessa
 * largura (sem rolagem horizontal) e o texto continua legível.
 */
function useContainerWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(WIDTH);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.round(entry.contentRect.width));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

/**
 * Série ao longo dos 7 dias, com as noites sombreadas, a linha do "agora" e
 * um cursor no horário escolhido. Passar o mouse (ou o dedo) troca o horário.
 */
export function WeekChart({
  title,
  hours,
  series,
  left,
  right,
  selectedTime,
  currentTime,
  today,
  tomorrow,
  onSelect,
  overlay,
}: WeekChartProps) {
  const [wrapRef, measured] = useContainerWidth();
  const count = hours.length;
  if (count < 2) return null;

  const width = measured >= WIDTH ? WIDTH : Math.max(MIN_WIDTH, measured);
  const compact = width < 520;
  const side = compact ? 40 : 44;
  const plotLeft = side;
  const plotRight = right || !compact ? side : 12;
  const plotWidth = width - plotLeft - plotRight;

  const x = (index: number) => plotLeft + (index / (count - 1)) * plotWidth;
  const yOf = (value: number, axis: Axis) => {
    const ratio = (value - axis.min) / (axis.max - axis.min || 1);
    return BASELINE - Math.min(1, Math.max(0, ratio)) * PLOT_HEIGHT;
  };

  const selectedIndex = Math.max(
    0,
    hours.findIndex((hour) => hour.time === selectedTime),
  );
  const nowIndex = hours.findIndex((hour) => hour.time === currentTime);

  // Trechos de noite, para sombrear.
  const nights: [number, number][] = [];
  let nightStart: number | null = null;
  hours.forEach((hour, index) => {
    if (!hour.daylight && nightStart === null) nightStart = index;
    if (hour.daylight && nightStart !== null) {
      nights.push([nightStart, index]);
      nightStart = null;
    }
  });
  if (nightStart !== null) nights.push([nightStart, count - 1]);

  const dayStarts = hours
    .map((hour, index) => ({ hour, index }))
    .filter(({ hour, index }) => hour.hour === 0 || index === 0);

  const pathFor = (item: ChartSeries) => {
    const axis = item.axis === "right" && right ? right : left;
    let line = "";
    const segments: string[] = [];
    let first: number | null = null;
    let last = 0;

    const closeSegment = () => {
      if (first === null) return;
      segments.push(
        `${line} L ${x(last).toFixed(1)} ${BASELINE} L ${x(first).toFixed(1)} ${BASELINE} Z`,
      );
    };

    let full = "";
    item.values.forEach((value, index) => {
      if (value === null) {
        closeSegment();
        line = "";
        first = null;
        return;
      }
      const point = `${x(index).toFixed(1)} ${yOf(value, axis).toFixed(1)}`;
      if (first === null) {
        first = index;
        line = `M ${point}`;
        full += ` M ${point}`;
      } else {
        line += ` L ${point}`;
        full += ` L ${point}`;
      }
      last = index;
    });
    closeSegment();
    return { line: full.trim(), area: segments.join(" ") };
  };

  const selectFromPointer = (event: React.PointerEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const px = ((event.clientX - bounds.left) / bounds.width) * width;
    const index = Math.round(((px - plotLeft) / plotWidth) * (count - 1));
    const hour = hours[Math.min(count - 1, Math.max(0, index))];
    if (hour.time !== selectedTime) onSelect(hour.time);
  };

  const ticks = [0, 0.5, 1];
  const gradientId = `fill-${title.replace(/\W+/g, "-")}`;

  return (
    <section className="glass min-w-0 rounded-3xl p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 className="font-display text-lg font-bold">{title}</h3>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {series.map((item) => {
            const value = item.values[selectedIndex];
            return (
              <li key={item.label} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-4 rounded-full"
                  style={{ background: item.color }}
                />
                <span className="text-mist">{item.label}</span>
                <strong className="font-display tabular-nums">
                  {value === null || value === undefined
                    ? "–"
                    : item.format(value)}
                </strong>
              </li>
            );
          })}
        </ul>
      </div>

      <div ref={wrapRef} className="mt-2 min-w-0">
        <svg
          viewBox={`0 0 ${width} ${HEIGHT}`}
          className="w-full cursor-crosshair touch-pan-y select-none"
          onPointerMove={selectFromPointer}
          onPointerDown={selectFromPointer}
          role="img"
          aria-label={`${title} ao longo da semana`}
        >
          <defs>
            {series.map((item, index) => (
              <linearGradient
                key={item.label}
                id={`${gradientId}-${index}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0" stopColor={item.color} stopOpacity="0.45" />
                <stop offset="1" stopColor={item.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>

          {nights.map(([from, to]) => (
            <rect
              key={from}
              x={x(from)}
              y={PLOT.top}
              width={Math.max(0, x(to) - x(from))}
              height={PLOT_HEIGHT}
              fill="#000"
              opacity="0.28"
            />
          ))}

          {ticks.map((tick) => {
            const y = BASELINE - tick * PLOT_HEIGHT;
            return (
              <g key={tick}>
                <line
                  x1={plotLeft}
                  x2={width - plotRight}
                  y1={y}
                  y2={y}
                  stroke="#fff"
                  strokeOpacity="0.08"
                  strokeDasharray={tick === 0 ? undefined : "4 6"}
                />
                <text
                  x={plotLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-mist text-[12px]"
                >
                  {left.format(left.min + tick * (left.max - left.min))}
                </text>
                {right && (
                  <text
                    x={width - plotRight + 8}
                    y={y + 4}
                    className="fill-mist text-[12px]"
                  >
                    {right.format(right.min + tick * (right.max - right.min))}
                  </text>
                )}
              </g>
            );
          })}

          {dayStarts.map(({ hour, index }, position) => {
            const next = dayStarts[position + 1]?.index ?? count - 1;
            return (
              <g key={hour.day}>
                {index > 0 && (
                  <line
                    x1={x(index)}
                    x2={x(index)}
                    y1={PLOT.top}
                    y2={BASELINE}
                    stroke="#fff"
                    strokeOpacity="0.14"
                  />
                )}
                {next - index >= 8 && (
                  <text
                    x={(x(index) + x(next)) / 2}
                    y={HEIGHT - 8}
                    textAnchor="middle"
                    className="fill-mist text-[13px] font-semibold"
                  >
                    {compact
                      ? shortDayLabel(hour.day, today)
                      : dayLabel(hour.day, today, tomorrow)}
                  </text>
                )}
              </g>
            );
          })}

          {series.map((item, index) => {
            const { line, area } = pathFor(item);
            return (
              <g key={item.label}>
                {item.kind === "area" && (
                  <path d={area} fill={`url(#${gradientId}-${index})`} />
                )}
                <path
                  d={line}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={item.kind === "dashed" ? 1.5 : 2.5}
                  strokeDasharray={item.kind === "dashed" ? "5 5" : undefined}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </g>
            );
          })}

          {overlay?.(x, PLOT.top)}

          {nowIndex >= 0 && (
            <g>
              <line
                x1={x(nowIndex)}
                x2={x(nowIndex)}
                y1={PLOT.top}
                y2={BASELINE}
                stroke="#5ee6d8"
                strokeOpacity="0.7"
                strokeDasharray="3 4"
              />
              <text
                x={x(nowIndex) + 5}
                y={PLOT.top + 11}
                className="fill-aqua text-[11px] font-semibold"
              >
                agora
              </text>
            </g>
          )}

          <g
            style={{
              transform: `translateX(${x(selectedIndex)}px)`,
              transition: "transform 0.25s ease-out",
            }}
          >
            <line
              y1={PLOT.top}
              y2={BASELINE}
              stroke="#fff"
              strokeOpacity="0.85"
              strokeWidth="1.5"
            />
            {series.map((item) => {
              const value = item.values[selectedIndex];
              if (value === null || value === undefined) return null;
              const axis = item.axis === "right" && right ? right : left;
              return (
                <circle
                  key={item.label}
                  cy={yOf(value, axis)}
                  r="5"
                  fill={item.color}
                  stroke="#030d16"
                  strokeWidth="2"
                />
              );
            })}
          </g>
        </svg>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Rosa do swell                                                              */
/* -------------------------------------------------------------------------- */

const SECTORS = 16;
const SECTOR_ANGLE = 360 / SECTORS;
const ROSE_CENTER = 110;
const ROSE_RADIUS = 78;

function polar(angle: number, radius: number): [number, number] {
  const radians = (angle * Math.PI) / 180;
  return [
    ROSE_CENTER + radius * Math.sin(radians),
    ROSE_CENTER - radius * Math.cos(radians),
  ];
}

function wedge(from: number, to: number, radius: number): string {
  const [x0, y0] = polar(from, radius);
  const [x1, y1] = polar(to, radius);
  return `M ${ROSE_CENTER} ${ROSE_CENTER} L ${x0.toFixed(1)} ${y0.toFixed(1)} A ${radius} ${radius} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z`;
}

/**
 * De onde vem o swell na semana: cada fatia soma a altura do swell nas horas
 * de sol que vêm daquela direção. O arco de fora é a janela que o pico aceita.
 */
export function SwellRose({
  hours,
  spot,
}: {
  hours: ForecastHour[];
  spot: Pick<Spot, "swellWindow">;
}) {
  const totals = new Array<number>(SECTORS).fill(0);
  for (const hour of hours) {
    if (!hour.daylight) continue;
    const sector = Math.round(hour.swellDirection / SECTOR_ANGLE) % SECTORS;
    totals[sector] += hour.swellHeight;
  }
  const max = Math.max(...totals, 0.001);

  const { from, to } = spot.swellWindow;
  const sweep = (to - from + 360) % 360;
  const [ax, ay] = polar(from, ROSE_RADIUS + 12);
  const [bx, by] = polar(to, ROSE_RADIUS + 12);

  return (
    <section className="glass flex flex-col rounded-3xl p-4 sm:p-5">
      <h3 className="font-display text-lg font-bold">
        De onde vem o swell na semana
      </h3>
      <svg
        viewBox="0 0 220 220"
        className="mx-auto my-2 w-full max-w-72"
        role="img"
        aria-label="Rosa das direções do swell na semana"
      >
        {[0.33, 0.66, 1].map((ring) => (
          <circle
            key={ring}
            cx={ROSE_CENTER}
            cy={ROSE_CENTER}
            r={ROSE_RADIUS * ring}
            fill="none"
            stroke="#fff"
            strokeOpacity="0.1"
          />
        ))}
        {totals.map((total, sector) => {
          if (total === 0) return null;
          const angle = sector * SECTOR_ANGLE;
          const fits = directionFit(angle, spot.swellWindow) === 1;
          return (
            <path
              key={sector}
              d={wedge(
                angle - SECTOR_ANGLE / 2 + 1,
                angle + SECTOR_ANGLE / 2 - 1,
                Math.max(6, (total / max) * ROSE_RADIUS),
              )}
              fill={fits ? "#5ee6d8" : "#64748b"}
              opacity={fits ? 0.9 : 0.6}
            />
          );
        })}
        <path
          d={`M ${ax.toFixed(1)} ${ay.toFixed(1)} A ${ROSE_RADIUS + 12} ${ROSE_RADIUS + 12} 0 ${sweep > 180 ? 1 : 0} 1 ${bx.toFixed(1)} ${by.toFixed(1)}`}
          fill="none"
          stroke="#5ee6d8"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.9"
        />
        {(
          [
            ["N", 0],
            ["L", 90],
            ["S", 180],
            ["O", 270],
          ] as const
        ).map(([label, angle]) => {
          const [tx, ty] = polar(angle, ROSE_RADIUS + 26);
          return (
            <text
              key={label}
              x={tx}
              y={ty + 4}
              textAnchor="middle"
              className="fill-mist text-[11px] font-semibold"
            >
              {label}
            </text>
          );
        })}
      </svg>
      <p className="mt-auto text-xs text-mist">
        Fatias em verde-água vêm de direções que entram bem no pico (o arco de
        fora). As cinzas chegam de lado ou são barradas.
      </p>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Rosca: como a semana se divide                                             */
/* -------------------------------------------------------------------------- */

const LABELS: ScoreLabel[] = ["clássico", "bom", "surfável", "fraco", "flat"];
const DONUT_RADIUS = 70;
const DONUT_LENGTH = 2 * Math.PI * DONUT_RADIUS;

/** Quantas horas de sol da semana caem em cada faixa da nota. */
export function WeekDonut({
  hours,
  level,
}: {
  hours: ForecastHour[];
  level: Level;
}) {
  const sunny = hours.filter((hour) => hour.daylight);
  const counts = new Map<ScoreLabel, number>(LABELS.map((label) => [label, 0]));
  for (const hour of sunny) {
    const label = scoreLabel(hour.scores[level]);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  const total = Math.max(1, sunny.length);
  const worthIt =
    (counts.get("clássico") ?? 0) +
    (counts.get("bom") ?? 0) +
    (counts.get("surfável") ?? 0);

  // Cada fatia começa onde a anterior terminou.
  const arcs = LABELS.reduce<
    { label: ScoreLabel; length: number; offset: number }[]
  >((list, label) => {
    const previous = list[list.length - 1];
    const offset = previous ? previous.offset + previous.length : 0;
    const length = ((counts.get(label) ?? 0) / total) * DONUT_LENGTH;
    return [...list, { label, length, offset }];
  }, []);

  return (
    <section className="glass flex flex-col rounded-3xl p-4 sm:p-5">
      <h3 className="font-display text-lg font-bold">
        Como a semana se divide
      </h3>
      <div className="my-2 flex flex-1 flex-wrap items-center justify-center gap-6">
        <div className="relative h-48 w-48 shrink-0">
          <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90">
            <circle
              cx="90"
              cy="90"
              r={DONUT_RADIUS}
              fill="none"
              stroke="#fff"
              strokeOpacity="0.08"
              strokeWidth="18"
            />
            {arcs.map(({ label, length, offset }) =>
              length > 0 ? (
                <circle
                  key={label}
                  cx="90"
                  cy="90"
                  r={DONUT_RADIUS}
                  fill="none"
                  stroke={SCORE_STYLES[label].hex}
                  strokeWidth="18"
                  strokeDasharray={`${Math.max(0, length - 2)} ${DONUT_LENGTH}`}
                  strokeDashoffset={-offset}
                  style={{
                    transition:
                      "stroke-dasharray 0.6s ease, stroke-dashoffset 0.6s ease",
                  }}
                />
              ) : null,
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-display text-4xl font-extrabold tabular-nums">
              {Math.round((worthIt / total) * 100)}%
            </span>
            <span className="text-[11px] leading-tight text-mist">
              das horas de sol
              <br />
              surfáveis ou melhor
            </span>
          </div>
        </div>

        <ul className="flex flex-col gap-2 text-sm">
          {LABELS.map((label) => (
            <li key={label} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-sm"
                style={{ background: SCORE_STYLES[label].hex }}
              />
              <span className="w-20 capitalize">{label}</span>
              <strong className="font-display tabular-nums">
                {counts.get(label) ?? 0} h
              </strong>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-xs text-mist">
        Conta só as horas de sol, de hoje até o fim da previsão.
      </p>
    </section>
  );
}
