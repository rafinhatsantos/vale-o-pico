import type { Metadata } from "next";
import Link from "next/link";

import { PHOTOS } from "@/lib/photos";
import { SPOTS } from "@/lib/spots";

export const metadata: Metadata = {
  title: "Créditos das fotos",
  description:
    "Autoria e licença das fotos dos picos, todas do Wikimedia Commons.",
};

export default function CreditsPage() {
  const credited = SPOTS.filter((spot) => PHOTOS[spot.slug]);

  return (
    <article className="mx-auto w-full max-w-3xl px-4 pt-14 text-foam/80">
      <p className="text-sm font-semibold tracking-wider text-aqua uppercase">
        Créditos
      </p>
      <h1 className="mt-2 font-display text-5xl leading-none font-extrabold tracking-tight text-foam">
        Fotos dos picos
      </h1>
      <p className="mt-5 text-lg">
        A maioria das fotos vem do Wikimedia Commons e é usada conforme a
        licença de cada uma; algumas foram cedidas ao projeto. Obrigado a quem
        fotografou e compartilhou.
      </p>

      <ul className="glass mt-8 divide-y divide-white/8 rounded-3xl">
        {credited.map((spot) => {
          const photo = PHOTOS[spot.slug];
          return (
            <li
              key={spot.slug}
              className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <Link
                href={`/praia/${spot.slug}`}
                className="font-display text-lg font-bold text-foam transition-colors hover:text-aqua"
              >
                {spot.name}
                <span className="ml-2 text-sm font-normal text-mist">
                  {spot.city}
                </span>
              </Link>
              {photo.page ? (
                <a
                  href={photo.page}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm transition-colors hover:text-aqua"
                >
                  {photo.author} · {photo.license} ↗
                </a>
              ) : (
                <span className="text-sm">
                  {photo.author} · {photo.license}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {credited.length < SPOTS.length && (
        <p className="mt-4 text-sm text-mist">
          Os picos que ainda não têm foto livre usam uma ilustração.
        </p>
      )}
    </article>
  );
}
