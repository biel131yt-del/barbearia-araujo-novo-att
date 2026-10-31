"use client";
import { useEffect, useState } from "react";
type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};
export default function InstallApp() {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null),
    [ios, setIos] = useState(false),
    [installed, setInstalled] = useState(true),
    [guide, setGuide] = useState(false);
  useEffect(() => {
    if ("serviceWorker" in navigator)
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    setInstalled(
      window.matchMedia("(display-mode: standalone)").matches ||
        Boolean((navigator as Navigator & { standalone?: boolean }).standalone),
    );
    setIos(/iPhone|iPad|iPod/.test(navigator.userAgent));
    const before = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallEvent);
    };
    const done = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", before);
    window.addEventListener("appinstalled", done);
    return () => {
      window.removeEventListener("beforeinstallprompt", before);
      window.removeEventListener("appinstalled", done);
    };
  }, []);
  if (installed) return null;
  return (
    <aside className="mx-auto my-6 max-w-xl rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-950">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <strong className="text-sm">Sua barbearia na tela inicial</strong>
          <p className="text-xs mt-1">
            Acesse sua conta e seus horários como um aplicativo.
          </p>
        </div>
        <button
          className="rounded-xl bg-blue-900 px-4 py-2 text-sm text-white"
          onClick={async () => {
            if (prompt) {
              await prompt.prompt();
              const choice = await prompt.userChoice;
              if (choice.outcome === "accepted") setPrompt(null);
            } else setGuide(!guide);
          }}
        >
          Instalar aplicativo
        </button>
      </div>
      {guide && (
        <p className="text-sm mt-3">
          {ios
            ? "No Safari, toque em Compartilhar e depois em “Adicionar à Tela de Início”."
            : "Abra o menu do navegador e procure “Instalar aplicativo” ou “Adicionar à tela inicial”. Se a opção não aparecer, use Chrome ou Edge atualizado."}
        </p>
      )}
    </aside>
  );
}
