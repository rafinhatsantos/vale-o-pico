import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME}: vale a pena ir surfar?`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
};

export const viewport: Viewport = {
  themeColor: "#0c4a6e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-slate-50 font-sans text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 py-3">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-xl font-bold text-sky-900">
                {SITE_NAME}
              </Link>
              <Link
                href="/como-calculamos"
                className="text-sm font-medium text-sky-700 hover:underline"
              >
                Como calculamos
              </Link>
            </div>
            <LevelSelector />
          </div>
        </header>

        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
          {children}
        </main>

        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto w-full max-w-2xl px-4 py-4 text-xs text-slate-500">
            <p>
              A nota é uma estimativa, não uma garantia. Confira o mar antes de
              entrar.
            </p>
            <p className="mt-1">
              Dados de previsão:{" "}
              <a
                href="https://open-meteo.com/"
                className="underline"
                rel="noreferrer"
                target="_blank"
              >
                Open-Meteo
              </a>
              .
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
