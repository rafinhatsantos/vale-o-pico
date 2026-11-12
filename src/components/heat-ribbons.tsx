"use client";

import { dayLabel } from "@/lib/format";
import type { ForecastHour } from "@/lib/types";

interface Props {
  /** Todos os horários visíveis, em ordem (para navegar pelo teclado). */
  hours: ForecastHour[];
  days: string[];
  byDay: Map<string, Map<number, ForecastHour>>;
  colorOf: (hour: ForecastHour) => string;
  /** Valor da variável em um horário, ou null sem dado. */
  valueOf: (hour: ForecastHour) => number | null;
  format: (value: number) => string;
  selected: ForecastHour;
  current: ForecastHour;
  today: string;
  tomorrow: string | undefined;
  onSelect: (time: number) => void;
}

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
/** Cada hora ocupa 10 unidades de largura no desenho. */
const UNIT = 10;
const WIDTH = 24 * UNIT;
const HEIGHT = 44;
const MIDDLE = HEIGHT / 2;
/** Meia altura da faixa: cheia com sol, fina à noite. */
const DAY_HALF = 20;
const NIGHT_HALF = 7;
const EMPTY = "#1e293b";

/** Contorno suave da faixa: engrossa no nascer do sol e afina no pôr. */
function ribbonPath(day: Map<number, ForecastHour>): string {
  const raw = HOURS.map((hour) =>
    day.get(hour)?.daylight ? DAY_HALF : NIGHT_HALF,
  );
  const half = raw.map(
    (value, index) =>
      ((raw[index - 1] ?? value) + 2 * value + (raw[index + 1] ?? value)) / 4,
  );

  // Pontos do topo, com uma ponta em cada extremidade.
  const top: [number, number][] = [
    [0, MIDDLE - half[0]],
    ...HOURS.map(
      (hour): [number, number] => [hour * UNIT + UNIT / 2, MIDDLE - half[hour]],
    ),
    [WIDTH, MIDDLE - half[23]],
  ];
  const bottom = top
    .map(([x, y]): [number, number] => [x, HEIGHT - y])
    .reverse();

  // Curva que passa pelos pontos médios, para não formar quinas.
  const smooth = (points: [number, number][]) => {
    let path = "";
    for (let i = 1; i < points.length - 1; i++) {
      const [cx, cy] = points[i];
      const [nx, ny] = points[i + 1];
      path += ` Q ${cx} ${cy.toFixed(2)} ${(cx + nx) / 2} ${((cy + ny) / 2).toFixed(2)}`;
    }
    const [lx, ly] = points[points.length - 1];
    return `${path} L ${lx} ${ly.toFixed(2)}`;
  };

  return `M ${top[0][0]} ${top[0][1].toFixed(2)}${smooth(top)} L ${bottom[0][0]} ${bottom[0][1].toFixed(2)}${smooth(bottom)} Z`;
}

/**
 * Mapa de calor em faixas contínuas, uma por dia: a cor muda suavemente de
 * hora em hora, a faixa é larga nas horas de sol e fina à noite.
 */
export function HeatRibbons({
  hours,
  days,
  byDay,
  colorOf,
  valueOf,
  format,
  selected,
  current,
  today,
  tomorrow,
  onSelect,
}: Props) {
  const selectFromPointer = (
    event: React.PointerEvent<HTMLDivElement>,
    day: string,
  ) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - bounds.left) / bounds.width;
    const hourOfDay = Math.min(23, Math.max(0, Math.floor(ratio * 24)));
    const hour = byDay.get(day)?.get(hourOfDay);
    if (hour && hour.time !== selected.time) onSelect(hour.time);
  };

  const label = (hour: ForecastHour) => {
    const value = valueOf(hour);
    return value === null ? "sem dado" : format(value);
  };

  /** Horário de sol com o maior valor do dia, olhando daqui para a frente. */
  const peakOf = (dayHours: Map<number, ForecastHour>) => {
    const sunny = [...dayHours.values()].filter((hour) => hour.daylight);
    const upcoming = sunny.filter((hour) => hour.time >= current.time);
    const pool = upcoming.length > 0 ? upcoming : sunny;
    return pool.reduce<ForecastHour | null>(
      (top, hour) =>
        top === null || (valueOf(hour) ?? -Infinity) > (valueOf(top) ?? -Infinity)
          ? hour
          : top,
      null,
    );
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const steps: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -24,
      ArrowDown: 24,
    };
    const step = steps[event.key];
    if (step === undefined) return;
    event.preventDefault();
    const index = hours.findIndex((hour) => hour.time === selected.time);
    const next = hours[Math.min(hours.length - 1, Math.max(0, index + step))];
    if (next) onSelect(next.time);
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={onKeyDown}
      aria-label="Mapa de calor da semana. Use as setas para mudar de horário."
      className="rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-aqua/60"
    >
      <div className="flex items-end pb-2 pl-14 sm:pl-20">
        {HOURS.map((hour) => (
          <span
            key={hour}
            className={`flex-1 text-center text-[10px] transition-colors sm:text-xs ${
              hour === selected.hour ? "font-bold text-foam" : "text-mist"
            }`}
          >
            {hour % 3 === 0 ? `${hour}h` : ""}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-2.5 sm:gap-3">
        {days.map((day) => {
          const dayHours = byDay.get(day);
          if (!dayHours) return null;

          const gradientId = `ribbon-${day}`;
          const path = ribbonPath(dayHours);
          const isSelected = day === selected.day;
          const peak = peakOf(dayHours);

          return (
            <div key={day} className="flex items-center">
              <span
                className={`w-14 shrink-0 text-xs font-semibold transition-colors sm:w-20 sm:text-sm ${
                  isSelected ? "text-foam" : "text-mist"
                }`}
              >
                {dayLabel(day, today, tomorrow)}
              </span>

              <div
                className="relative h-11 flex-1 cursor-crosshair touch-pan-y select-none sm:h-12"
                onPointerMove={(event) => selectFromPointer(event, day)}
                onPointerDown={(event) => selectFromPointer(event, day)}
              >
                {/* Mesma faixa desfocada por baixo, para dar o brilho. */}
                <svg
                  viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                  preserveAspectRatio="none"
                  className="absolute inset-0 h-full w-full opacity-45 blur-md"
                  aria-hidden="true"
                >
                  <path d={path} fill={`url(#${gradientId})`} />
                </svg>
                <svg
                  viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                  preserveAspectRatio="none"
                  className="absolute inset-0 h-full w-full"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
                      {HOURS.map((hourOfDay) => {
                        const hour = dayHours.get(hourOfDay);
                        return (
                          <stop
                            key={hourOfDay}
                            offset={(hourOfDay + 0.5) / 24}
                            stopColor={hour ? colorOf(hour) : EMPTY}
                            stopOpacity={
                              hour && hour.time < current.time ? 0.3 : 1
                            }
                            style={{ transition: "stop-color 0.5s ease" }}
                          />
                        );
                      })}
                    </linearGradient>
                  </defs>
                  <path d={path} fill={`url(#${gradientId})`} />
                  {/* Riscos a cada 3 horas, para alinhar o olho com o eixo. */}
                  {[3, 6, 9, 12, 15, 18, 21].map((hourOfDay) => (
                    <line
                      key={hourOfDay}
                      x1={hourOfDay * UNIT}
                      x2={hourOfDay * UNIT}
                      y1="0"
                      y2={HEIGHT}
                      stroke="#030d16"
                      strokeOpacity="0.35"
                      strokeWidth="1"
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                </svg>

                {peak && peak.time !== selected.time && (
                  <span
                    className="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-abyss/75 px-2 py-0.5 font-display text-[11px] font-bold whitespace-nowrap ring-1 ring-white/20"
                    style={{ left: `${((peak.hour + 0.5) / 24) * 100}%` }}
                  >
                    {label(peak)}
                  </span>
                )}

                {day === current.day && (
                  <span
                    className="pointer-events-none absolute inset-y-0 w-px bg-aqua"
                    style={{ left: `${((current.hour + 0.5) / 24) * 100}%` }}
                    aria-hidden="true"
                  />
                )}

                {isSelected && (
                  <span
                    className="pointer-events-none absolute -inset-y-1 z-10 rounded-lg bg-white/10 ring-2 ring-white transition-[left] duration-200 ease-out"
                    style={{
                      left: `${(selected.hour / 24) * 100}%`,
                      width: `${100 / 24}%`,
                    }}
                  >
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 rounded-full bg-foam px-2.5 py-0.5 font-display text-xs font-bold whitespace-nowrap text-abyss shadow-lg">
                      {label(selected)}
                    </span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
