"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};
export default function InstallApp() {
  const pathname = usePathname();
  const adminArea = pathname.startsWith("/admin");
  const [adminAllowed, setAdminAllowed] = useState(false);
  useEffect(() => {
    setPrompt(null);
    setGuide(false);
    setAdminAllowed(false);
    if (!adminArea || pathname === "/admin/login") return;
    const controller = new AbortController();
    fetch("/api/auth/me", { cache: "no-store", signal: controller.signal })
      .then((r) => r.json())
      .then((d) => setAdminAllowed(d.user?.role === "admin"))
      .catch(() => {});
    return () => controller.abort();
  }, [pathname, adminArea]);
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
    setIos(
      /iPhone|iPad|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1),
    );
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
  if (
    installed ||
    (adminArea && (!adminAllowed || pathname === "/admin/login"))
  )
    return null;
  return (
    <aside className="mx-auto my-6 max-w-xl rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-950">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <strong className="text-sm">
            {adminArea
              ? "Painel administrativo no iPhone"
              : "Sua barbearia na tela inicial"}
          </strong>
          <p className="text-xs mt-1">
            {adminArea
              ? "Instale Araújo Admin para gerenciar a barbearia. Acesso exclusivo do administrador."
              : "Acesse sua conta e seus horários como um aplicativo."}
          </p>
        </div>
        <button
          className="rounded-xl bg-blue-900 px-4 py-2 text-sm text-white"
          onClick={async () => {
            if (prompt) {
              try {
                await prompt.prompt();
                const choice = await prompt.userChoice;
                if (choice.outcome === "accepted") setPrompt(null);
              } catch {
                setGuide(true);
              }
            } else setGuide(!guide);
          }}
        >
          {adminArea ? "Instalar app admin" : "Instalar aplicativo"}
        </button>
      </div>
      {guide && (
        <p className="text-sm mt-3">
          {ios
            ? adminArea
              ? "No Safari, com sua conta admin conectada, abra esta página. Toque em Compartilhar → Adicionar à Tela de Início → Adicionar. Confira o nome Araújo Admin. Se aparecer “Abrir como App”, mantenha ativado. Abra o novo ícone; entre novamente como admin se solicitado. O app de clientes pode continuar instalado."
              : "No Safari, toque em Compartilhar e depois em “Adicionar à Tela de Início”."
            : "Abra o menu do navegador e procure “Instalar aplicativo” ou “Adicionar à tela inicial”. Se a opção não aparecer, use Chrome ou Edge atualizado."}
        </p>
      )}
    </aside>
  );
}
