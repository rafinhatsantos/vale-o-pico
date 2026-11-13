"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-start px-4 pt-24 pb-10">
      <p className="text-sm font-semibold tracking-wider text-aqua uppercase">
        Algo deu errado
      </p>
      <h1 className="mt-2 font-display text-5xl leading-none font-extrabold tracking-tight sm:text-6xl">
        O mar ficou mexido demais
      </h1>
      <p className="mt-5 max-w-xl text-lg text-foam/80">
        Não conseguimos carregar esta página agora. Pode ser uma falha
        passageira da fonte de dados. Tente de novo em instantes.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="cursor-pointer rounded-full bg-aqua px-6 py-2.5 font-semibold text-abyss transition-transform hover:scale-105"
        >
          Tentar de novo
        </button>
        <Link
          href="/"
          className="rounded-full px-6 py-2.5 font-medium text-mist ring-1 ring-white/15 transition-colors hover:text-foam"
        >
          Voltar ao início
        </Link>
      </div>
    </section>
  );
}
