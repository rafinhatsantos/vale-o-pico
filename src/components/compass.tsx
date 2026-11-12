interface Props {
  /** Para onde a praia está virada (lado do mar). */
  coastOrientation: number;
  /** De onde vem o swell. */
  swellDirection: number;
  /** De onde vem o vento. */
  windDirection: number;
}

const CENTER = 100;
const RADIUS = 78;

const CARDINALS = [
  { label: "N", x: CENTER, y: 13 },
  { label: "L", x: 190, y: CENTER + 4 },
  { label: "S", x: CENTER, y: 195 },
  { label: "O", x: 10, y: CENTER + 4 },
];

/** Seta que nasce na borda, na direção de origem, e aponta para o centro. */
function Arrow({
  from,
  color,
  width,
  start,
}: {
  from: number;
  color: string;
  width: number;
  start: number;
}) {
  const tip = CENTER - 18;
  return (
    <g
      style={{
        transform: `rotate(${from}deg)`,
        transformOrigin: `${CENTER}px ${CENTER}px`,
        transition: "transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <line
        x1={CENTER}
        y1={start}
        x2={CENTER}
        y2={tip - 8}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
      />
      <path
        d={`M ${CENTER - width * 1.8} ${tip - 10} L ${CENTER} ${tip} L ${CENTER + width * 1.8} ${tip - 10} Z`}
        fill={color}
      />
    </g>
  );
}

/** Bússola com a praia, o swell e o vento, para ver de relance o encaixe. */
export function Compass({
  coastOrientation,
  swellDirection,
  windDirection,
}: Props) {
  return (
    <svg
      viewBox="0 0 200 200"
      className="h-full w-full"
      role="img"
      aria-label="Bússola com a direção do swell e do vento em relação à praia"
    >
      <defs>
        <radialGradient id="compass-sea" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#0e7490" stopOpacity="0.55" />
          <stop offset="1" stopColor="#0c4a6e" stopOpacity="0.25" />
        </radialGradient>
        <clipPath id="compass-clip">
          <circle cx={CENTER} cy={CENTER} r={RADIUS} />
        </clipPath>
      </defs>

      <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="url(#compass-sea)" />

      {/* Terra: a metade oposta ao lado para onde a praia está virada. */}
      <g
        clipPath="url(#compass-clip)"
        style={{
          transform: `rotate(${coastOrientation}deg)`,
          transformOrigin: `${CENTER}px ${CENTER}px`,
        }}
      >
        <rect
          x="0"
          y={CENTER + 26}
          width="200"
          height="100"
          fill="#e7c98f"
          opacity="0.85"
        />
        <path
          d={`M 0 ${CENTER + 26} Q 50 ${CENTER + 16} 100 ${CENTER + 26} T 200 ${CENTER + 26}`}
          fill="none"
          stroke="#fff"
          strokeOpacity="0.7"
          strokeWidth="2"
        />
      </g>

      <circle
        cx={CENTER}
        cy={CENTER}
        r={RADIUS}
        fill="none"
        stroke="rgb(255 255 255 / 0.25)"
        strokeWidth="1.5"
      />
      {Array.from({ length: 24 }, (_, index) => (
        <line
          key={index}
          x1={CENTER}
          y1={CENTER - RADIUS}
          x2={CENTER}
          y2={CENTER - RADIUS + (index % 6 === 0 ? 9 : 5)}
          stroke="rgb(255 255 255 / 0.4)"
          strokeWidth={index % 6 === 0 ? 2 : 1}
          transform={`rotate(${index * 15} ${CENTER} ${CENTER})`}
        />
      ))}
      {CARDINALS.map(({ label, x, y }) => (
        <text
          key={label}
          x={x}
          y={y}
          textAnchor="middle"
          className="fill-mist text-[11px] font-semibold"
        >
          {label}
        </text>
      ))}

      <Arrow from={windDirection} color="#f8fafc" width={2.5} start={CENTER - RADIUS + 14} />
      <Arrow from={swellDirection} color="#5ee6d8" width={5} start={CENTER - RADIUS + 4} />
      <circle cx={CENTER} cy={CENTER} r="4" fill="#fff" />
    </svg>
  );
}
