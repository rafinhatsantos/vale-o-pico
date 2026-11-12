import Image from "next/image";

import { PHOTOS } from "@/lib/photos";

interface Props {
  slug: string;
  name: string;
  /** Mesmo formato do atributo sizes de uma imagem responsiva. */
  sizes: string;
  priority?: boolean;
  className?: string;
}

/** Tons para a arte de reserva, escolhidos de forma estável pelo slug. */
const FALLBACK_HUES = [188, 200, 172, 212, 160];

function hueFor(slug: string): number {
  let sum = 0;
  for (const char of slug) sum += char.charCodeAt(0);
  return FALLBACK_HUES[sum % FALLBACK_HUES.length];
}

/** Foto do pico, ou uma arte de mar quando ainda não há foto livre. */
export function SpotImage({
  slug,
  name,
  sizes,
  priority = false,
  className = "",
}: Props) {
  const photo = PHOTOS[slug];

  if (photo) {
    return (
      <Image
        src={photo.src}
        alt={`Praia: ${name}`}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover ${className}`}
      />
    );
  }

  const hue = hueFor(slug);
  return (
    <div
      className={`absolute inset-0 ${className}`}
      style={{
        background: `linear-gradient(175deg, hsl(${hue} 70% 62%) 0%, hsl(${hue + 12} 75% 38%) 42%, hsl(${hue + 24} 80% 16%) 100%)`,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 400 300"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <circle cx="300" cy="70" r="34" fill="rgb(255 255 255 / 0.35)" />
        <path
          d="M0 170 C 60 150, 120 190, 200 168 S 340 150, 400 172 V 300 H 0 Z"
          fill="rgb(255 255 255 / 0.14)"
        />
        <path
          d="M0 205 C 80 185, 150 228, 240 204 S 350 190, 400 210 V 300 H 0 Z"
          fill="rgb(3 13 22 / 0.28)"
        />
        <path
          d="M0 245 C 70 228, 160 262, 250 242 S 360 232, 400 248 V 300 H 0 Z"
          fill="rgb(3 13 22 / 0.4)"
        />
      </svg>
    </div>
  );
}
