"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/** Evento do Chrome e do Android que permite abrir o convite de instalação. */
interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
}

const noopSubscribe = () => () => {};

/** iPhone e iPad: não há convite automático, a instalação é pelo menu Compartilhar. */
function isIosNotInstalled(): boolean {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const standalone =
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return ios && !standalone;
}

const buttonClass =
  "cursor-pointer font-medium text-aqua transition-colors hover:underline";

/**
 * "Instalar app": abre o convite quando o navegador oferece (Chrome, Android,
 * desktop) e, no iPhone, explica o caminho pelo menu Compartilhar. Não
 * aparece se o site já está instalado.
 */
export function InstallButton() {
  const [event, setEvent] = useState<InstallPromptEvent | null>(null);
  const [showHint, setShowHint] = useState(false);
  const ios = useSyncExternalStore(noopSubscribe, isIosNotInstalled, () => false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as InstallPromptEvent);
    };
    const onInstalled = () => setEvent(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (event) {
    return (
      <button
        type="button"
        className={buttonClass}
        onClick={async () => {
          await event.prompt();
          setEvent(null);
        }}
      >
        Instalar app
      </button>
    );
  }

  if (ios) {
    return (
      <span className="flex flex-col gap-1">
        <button
          type="button"
          className={buttonClass}
          aria-expanded={showHint}
          onClick={() => setShowHint((value) => !value)}
        >
          Instalar app
        </button>
        {showHint && (
          <span className="max-w-60 text-xs text-mist">
            No Safari, toque em Compartilhar e depois em &ldquo;Adicionar à
            Tela de Início&rdquo;.
          </span>
        )}
      </span>
    );
  }

  return null;
}
