import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";

import { LevelSelector } from "@/components/level-selector";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME}: vale a pena ir surfar?`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
};

export const viewport: Viewport = {
  themeColor: "#030d16",
};

function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2">
      <svg
        viewBox="0 0 32 32"
        className="h-8 w-8 transition-transform duration-500 group-hover:-rotate-12"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5ee6d8" />
            <stop offset="1" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="15" fill="url(#logo-gradient)" />
        <path
          d="M5 19c3.5-6 8-8.5 12.5-6.5 2.6 1.2 3.2 3.9 1.6 5.4-1.3 1.2-3.3.8-3.8-.7 3 3.4 7.6 3.1 11.7.6-1.9 5.3-6.4 8.7-11.6 8.7C10.600 26.500 6.500 23.600 5 19Z"
          fill="#030d16"
        />
      </svg>
      <span className="font-display text-xl font-bold tracking-tight text-foam">
        {SITE_NAME}
      </span>
    </Link>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans text-foam">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-abyss/80 backdrop-blur-xl backdrop-saturate-150">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
            <Logo />
            <Link
              href="/como-calculamos"
              className="order-2 text-sm font-medium text-mist transition-colors hover:text-aqua sm:order-3"
            >
              Como calculamos
            </Link>
            <div className="order-3 w-full sm:order-2 sm:ml-auto sm:w-auto sm:min-w-96">
              <LevelSelector />
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="mt-16 border-t border-white/10">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-mist sm:flex-row sm:items-center sm:justify-between">
            <p>
              A nota é uma estimativa, não uma garantia. Confira o mar antes de
              entrar.
            </p>
            <p className="flex gap-4">
              <a
                href="https://open-meteo.com/"
                className="transition-colors hover:text-aqua"
                rel="noreferrer"
                target="_blank"
              >
                Dados: Open-Meteo
              </a>
              <Link
                href="/creditos"
                className="transition-colors hover:text-aqua"
              >
                Créditos das fotos
              </Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
