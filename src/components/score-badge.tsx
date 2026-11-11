import { formatNumber, SCORE_STYLES } from "@/lib/format";
import { scoreLabel } from "@/lib/score";

const SIZES = {
  sm: "h-10 w-12 rounded-lg text-lg",
  lg: "h-28 w-32 rounded-3xl text-6xl",
};

export function ScoreBadge({
  value,
  size = "sm",
}: {
  value: number | null;
  size?: keyof typeof SIZES;
}) {
  if (value === null) {
    return (
      <span
        className={`${SIZES[size]} flex shrink-0 items-center justify-center bg-slate-100 font-semibold text-slate-400`}
        aria-label="Sem dados"
      >
        –
      </span>
    );
  }

  const style = SCORE_STYLES[scoreLabel(value)];
  return (
    <span
      className={`${SIZES[size]} ${style.bg} ${style.text} flex shrink-0 items-center justify-center font-bold tabular-nums`}
    >
      {formatNumber(value)}
    </span>
  );
}
