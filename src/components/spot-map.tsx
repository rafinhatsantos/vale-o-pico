"use client";

import "maplibre-gl/dist/maplibre-gl.css";

import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ScoreRing } from "@/components/score-ring";
import { SpotImage } from "@/components/spot-image";
import { SCORE_STYLES } from "@/lib/format";
import { scoreLabel } from "@/lib/score";

export interface MapSpot {
  slug: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  score: number | null;
}

/** Mapa base escuro e gratuito, sem chave de API. */
const MAP_STYLE = "https://tiles.openfreemap.org/styles/dark";
const WORKER_URL = "/maplibre/maplibre-gl-worker.mjs";

type Bounds = [[number, number], [number, number]];
const BRAZIL: Bounds = [
  [-74, -34],
  [-34, 5.5],
];

const NO_DATA_COLOR = "#64748b";

function colorFor(score: number | null): string {
  return score === null ? NO_DATA_COLOR : SCORE_STYLES[scoreLabel(score)].hex;
}

function boundsOf(spots: MapSpot[]): Bounds {
  const lats = spots.map((spot) => spot.latitude);
  const lngs = spots.map((spot) => spot.longitude);
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];
}

interface Hovered {
  slug: string;
  x: number;
  y: number;
}

interface MarkerEntry {
  marker: Marker;
  dot: HTMLSpanElement;
  pulse: HTMLSpanElement;
}

/**
 * Mapa do Brasil com um ponto por pico, colorido pela nota. Passar o mouse
 * (ou tocar) em um ponto mostra a praia; clicar abre a previsão.
 */
export function SpotMap({ spots }: { spots: MapSpot[] }) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef(new Map<string, MarkerEntry>());
  const spotsRef = useRef(spots);
  const hoveredRef = useRef<string | null>(null);

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState<Hovered | null>(null);

  useEffect(() => {
    spotsRef.current = spots;
  }, [spots]);

  // Cria o mapa uma vez. O MapLibre só existe no navegador, então é
  // carregado sob demanda aqui dentro.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let observer: IntersectionObserver | null = null;
    const markers = markersRef.current;

    const place = (slug: string) => {
      const map = mapRef.current;
      const spot = spotsRef.current.find((item) => item.slug === slug);
      if (!map || !spot) return;
      const point = map.project([spot.longitude, spot.latitude]);
      hoveredRef.current = slug;
      setHovered({ slug, x: point.x, y: point.y });
    };

    const clear = () => {
      hoveredRef.current = null;
      setHovered(null);
    };

    const start = () => {
      import("maplibre-gl")
      .then((maplibre) => {
        if (cancelled) return;

        maplibre.setWorkerUrl(WORKER_URL);
        const map = new maplibre.Map({
          container,
          style: MAP_STYLE,
          bounds: BRAZIL,
          fitBoundsOptions: { padding: 24 },
          dragRotate: false,
          // Rolar a página não dá zoom no mapa sem querer.
          cooperativeGestures: true,
          attributionControl: { compact: true },
        });
        mapRef.current = map;
        map.addControl(
          new maplibre.NavigationControl({ showCompass: false }),
          "bottom-right",
        );
        map.on("error", () => setFailed(true));

        const touch = window.matchMedia("(hover: none)").matches;

        for (const spot of spotsRef.current) {
          const element = document.createElement("button");
          element.type = "button";
          element.className = `relative flex cursor-pointer items-center justify-center ${
            touch ? "h-10 w-10" : "h-7 w-7"
          }`;
          element.setAttribute("aria-label", `${spot.name}, ${spot.city}`);

          const pulse = document.createElement("span");
          pulse.className =
            "absolute inline-flex h-5 w-5 animate-ping rounded-full opacity-60";
          const dot = document.createElement("span");
          dot.className =
            "relative h-3.5 w-3.5 rounded-full border-2 border-abyss transition-transform duration-200";
          element.append(pulse, dot);

          element.addEventListener("mouseenter", () => {
            dot.style.transform = "scale(1.5)";
            place(spot.slug);
          });
          element.addEventListener("mouseleave", () => {
            dot.style.transform = "";
            if (!touch) clear();
          });
          element.addEventListener("click", (event) => {
            event.stopPropagation();
            // No toque, o primeiro toque mostra a praia e o segundo abre.
            if (touch && hoveredRef.current !== spot.slug) {
              place(spot.slug);
              return;
            }
            router.push(`/praia/${spot.slug}`);
          });

          const marker = new maplibre.Marker({ element })
            .setLngLat([spot.longitude, spot.latitude])
            .addTo(map);
          markers.set(spot.slug, { marker, dot, pulse });
        }

        map.on("move", () => {
          if (hoveredRef.current) place(hoveredRef.current);
        });
        map.on("click", clear);

        map.on("load", () => {
          if (cancelled) return;
          setReady(true);

          // Quando o mapa aparece na tela, voa do Brasil até o litoral.
          observer = new IntersectionObserver(
            (entries) => {
              if (!entries.some((entry) => entry.isIntersecting)) return;
              observer?.disconnect();
              map.fitBounds(boundsOf(spotsRef.current), {
                padding: 70,
                duration: 3500,
              });
            },
            { threshold: 0.45 },
          );
          observer.observe(container);
        });
      })
      .catch(() => setFailed(true));
    };

    // O MapLibre pesa e o mapa fica abaixo da dobra: só carrega perto da tela.
    let lazyObserver: IntersectionObserver | null = null;
    if (typeof IntersectionObserver === "undefined") {
      start();
    } else {
      lazyObserver = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            lazyObserver?.disconnect();
            start();
          }
        },
        { rootMargin: "600px 0px" },
      );
      lazyObserver.observe(container);
    }

    return () => {
      cancelled = true;
      lazyObserver?.disconnect();
      observer?.disconnect();
      markers.forEach(({ marker }) => marker.remove());
      markers.clear();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [router]);

  // Recolore os pontos quando a nota muda (troca de nível, virada de hora).
  useEffect(() => {
    const best = spots.reduce<MapSpot | null>(
      (top, spot) =>
        spot.score !== null && (top === null || spot.score > (top.score ?? -1))
          ? spot
          : top,
      null,
    );

    for (const spot of spots) {
      const entry = markersRef.current.get(spot.slug);
      if (!entry) continue;
      const color = colorFor(spot.score);
      entry.dot.style.background = color;
      entry.dot.style.boxShadow = `0 0 12px ${color}`;
      entry.pulse.style.background = color;
      entry.pulse.style.display = spot.slug === best?.slug ? "" : "none";
    }
  }, [spots, ready]);

  // Tela cheia (celular): um dedo move o mapa e a página não rola por baixo.
  useEffect(() => {
    const map = mapRef.current;
    if (expanded) map?.cooperativeGestures.disable();
    else map?.cooperativeGestures.enable();
    const frame = requestAnimationFrame(() => map?.resize());
    if (!expanded) return () => cancelAnimationFrame(frame);

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [expanded]);

  const zoomTo = (bounds: Bounds, padding: number) => {
    mapRef.current?.fitBounds(bounds, { padding, duration: 2200 });
  };

  const hoveredSpot = hovered
    ? spots.find((spot) => spot.slug === hovered.slug)
    : undefined;
  const hoveredLabel =
    hoveredSpot && hoveredSpot.score !== null
      ? scoreLabel(hoveredSpot.score)
      : null;

  return (
    <div
      className={
        expanded
          ? "fixed inset-0 z-50 overflow-hidden bg-deep"
          : "relative overflow-hidden rounded-3xl ring-1 ring-white/10"
      }
    >
      <div
        ref={containerRef}
        className={
          expanded ? "h-full w-full bg-deep" : "h-[26rem] w-full bg-deep sm:h-[34rem]"
        }
        aria-label="Mapa dos picos"
      />

      {!ready && !failed && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-deep">
          <p className="animate-pulse text-sm text-mist">Carregando mapa…</p>
        </div>
      )}
      {failed && !ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-deep p-6 text-center">
          <p className="text-sm text-mist">
            Não foi possível carregar o mapa agora. A lista de picos abaixo
            continua funcionando.
          </p>
        </div>
      )}

      <div className="absolute top-3 left-3 flex gap-2">
        <button
          type="button"
          onClick={() => zoomTo(boundsOf(spots), 70)}
          className="glass rounded-full px-4 py-1.5 text-xs font-semibold transition-colors hover:text-aqua"
        >
          Todos os picos
        </button>
        <button
          type="button"
          onClick={() => zoomTo(BRAZIL, 24)}
          className="glass rounded-full px-4 py-1.5 text-xs font-semibold transition-colors hover:text-aqua"
        >
          Brasil
        </button>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-label={expanded ? "Fechar mapa em tela cheia" : "Abrir mapa em tela cheia"}
        className={`glass absolute top-3 right-3 z-10 cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition-colors hover:text-aqua ${
          expanded ? "" : "hidden [@media(hover:none)]:block"
        }`}
      >
        {expanded ? "Fechar ✕" : "Tela cheia ⤢"}
      </button>

      <ul
        className={`glass absolute left-3 flex flex-wrap gap-x-3 gap-y-1 rounded-2xl px-3 py-2 text-[11px] font-medium ${
          expanded ? "bottom-16" : "bottom-3"
        }`}
      >
        {(Object.keys(SCORE_STYLES) as (keyof typeof SCORE_STYLES)[]).map(
          (label) => (
            <li key={label} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: SCORE_STYLES[label].hex }}
              />
              {label}
            </li>
          ),
        )}
      </ul>

      {hovered && hoveredSpot && (
        <Link
          href={`/praia/${hoveredSpot.slug}`}
          className="absolute z-10 w-60 animate-fade-in overflow-hidden rounded-2xl bg-deep shadow-2xl ring-1 shadow-black/60 ring-white/15 [animation-duration:200ms]"
          style={{
            left: `clamp(8rem, ${hovered.x}px, calc(100% - 8rem))`,
            top: hovered.y,
            transform: `translate(-50%, ${
              hovered.y < 230 ? "22px" : "calc(-100% - 22px)"
            })`,
          }}
        >
          <div className="relative h-28">
            <SpotImage
              slug={hoveredSpot.slug}
              name={hoveredSpot.name}
              sizes="240px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-deep to-transparent" />
          </div>
          <div className="flex items-center justify-between gap-3 px-4 pb-4">
            <div className="min-w-0">
              <p className="truncate font-display text-lg leading-tight font-bold">
                {hoveredSpot.name}
              </p>
              <p className="truncate text-xs text-mist">{hoveredSpot.city}</p>
              <p
                className={`mt-1 text-xs font-semibold capitalize ${
                  hoveredLabel ? SCORE_STYLES[hoveredLabel].ink : "text-mist"
                }`}
              >
                {hoveredLabel ?? "sem dados"}
              </p>
            </div>
            <ScoreRing key={hoveredSpot.slug} value={hoveredSpot.score} />
          </div>
        </Link>
      )}
    </div>
  );
}
