/**
 * Faixa de ondas animadas para a base dos heróis. Cada camada é um traçado
 * com dois períodos idênticos que desliza meio comprimento, em laço.
 */
const LAYERS = [
  {
    className: "animate-wave-slow opacity-40",
    path: "M0 40 C 150 10, 300 70, 600 40 S 1050 10, 1200 40 S 1650 70, 1800 40 S 2250 10, 2400 40 V 120 H 0 Z",
  },
  {
    className: "animate-wave-fast opacity-70",
    path: "M0 60 C 200 90, 400 30, 600 60 S 1000 90, 1200 60 S 1600 30, 1800 60 S 2200 90, 2400 60 V 120 H 0 Z",
  },
  {
    className: "animate-wave-slow",
    path: "M0 85 C 100 70, 200 100, 300 85 S 500 70, 600 85 S 800 100, 900 85 S 1100 70, 1200 85 S 1400 100, 1500 85 S 1700 70, 1800 85 S 2000 100, 2100 85 S 2300 70, 2400 85 V 120 H 0 Z",
  },
];

export function Waves({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div className="relative h-full w-full">
        {LAYERS.map((layer, index) => (
          <svg
            key={index}
            viewBox="0 0 2400 120"
            preserveAspectRatio="none"
            className={`absolute bottom-0 left-0 h-full w-[200%] fill-abyss ${layer.className}`}
          >
            <path d={layer.path} />
          </svg>
        ))}
      </div>
    </div>
  );
}
