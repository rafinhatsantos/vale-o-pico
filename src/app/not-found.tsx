import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-start px-4 pt-24 pb-10">
      <p className="text-sm font-semibold tracking-wider text-aqua uppercase">
        Erro 404
      </p>
      <h1 className="mt-2 font-display text-5xl leading-none font-extrabold tracking-tight sm:text-6xl">
        Essa onda não quebrou aqui
      </h1>
      <p className="mt-5 max-w-xl text-lg text-foam/80">
        Não encontramos a página que você procurou. O pico pode ter mudado de
        nome ou o endereço pode estar errado.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-aqua px-6 py-2.5 font-semibold text-abyss transition-transform hover:scale-105"
      >
        Ver todos os picos
      </Link>
    </section>
  );
}
