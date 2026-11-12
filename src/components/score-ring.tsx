"use client";

import { useAnimatedNumber } from "@/hooks/use-animated-number";
import { formatNumber, SCORE_STYLES } from "@/lib/format";
import { scoreLabel } from "@/lib/score";

const SIZES = {
  sm: { box: 52, stroke: 5, text: "text-base" },
  md: { box: 84, stroke: 7, text: "text-2xl" },
  lg: { box: 176, stroke: 12, text: "text-6xl" },
};

interface Props {
  value: number | null;
  size?: keyof typeof SIZES;
  className?: string;
}

/** Nota de 0 a 10 em um anel que se desenha e muda de cor conforme a escala. */
export function ScoreRing({ value, size = "sm", className = "" }: Props) {
  const { box, stroke, text } = SIZES[size];
  const radius = (box - stroke) / 2;
  const length = 2 * Math.PI * radius;
  const animated = useAnimatedNumber(value ?? 0);
  const style = SCORE_STYLES[scoreLabel(value ?? 0)];

  return (
    <div
      className={`relative shrink-0 ${className}`}
      style={{ width: box, height: box }}
      role="img"
      aria-label={
        value === null ? "Sem dados" : `Nota ${formatNumber(value)} de 10`
      }
    >
      {size === "lg" && value !== null && (
        <div
          className="absolute inset-2 animate-glow rounded-full blur-2xl"
          style={{ background: style.hex }}
          aria-hidden="true"
        />
      )}
      <svg
        viewBox={`0 0 ${box} ${box}`}
        className="relative -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="rgb(3 13 22 / 0.55)"
          stroke="rgb(255 255 255 / 0.1)"
          strokeWidth={stroke}
        />
        {value !== null && (
          <circle
            cx={box / 2}
            cy={box / 2}
            r={radius}
            fill="none"
            stroke={style.hex}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={length}
            className="animate-ring"
            style={
              {
                "--ring-length": length,
                strokeDashoffset: length * (1 - Math.max(0.02, value / 10)),
                transition:
                  "stroke-dashoffset 0.7s cubic-bezier(0.22, 1, 0.36, 1), stroke 0.4s ease",
                filter: `drop-shadow(0 0 ${stroke}px ${style.hex}99)`,
              } as React.CSSProperties
            }
          />
        )}
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center font-display font-bold tabular-nums text-foam ${text}`}
      >
        {value === null ? "–" : formatNumber(animated)}
      </span>
    </div>
  );
}
