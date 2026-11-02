"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import PushSubscription from "./PushSubscription";
export default function NotificationConsent() {
  const path = usePathname();
  const [visible, setVisible] = useState(false),
    [client, setClient] = useState(false),
    [apple, setApple] = useState(false),
    [installed, setInstalled] = useState(false),
    [allowed, setAllowed] = useState(false),
    [message, setMessage] = useState("");
  useEffect(() => {
    const enabled = () => {
      setVisible(false);
      setAllowed(true);
    };
    window.addEventListener("barbearia-push-enabled", enabled);
    return () => window.removeEventListener("barbearia-push-enabled", enabled);
  }, []);
  useEffect(() => {
    if (path.startsWith("/admin")) {
      setVisible(false);
      return;
    }
    const ios =
      /iPhone|iPad|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setApple(ios);
    setInstalled(
      matchMedia("(display-mode: standalone)").matches ||
        Boolean((navigator as Navigator & { standalone?: boolean }).standalone),
    );
    const permission =
      typeof Notification === "undefined" ? "default" : Notification.permission;
    setAllowed(permission === "granted");
    let dismissed = false;
    try {
      dismissed = Boolean(
        localStorage.getItem("barbearia.notification-consent-dismissed"),
      );
    } catch {}
    setVisible(
      !dismissed &&
        permission === "default" &&
        (ios || "Notification" in window),
    );
    const controller = new AbortController();
    fetch("/api/auth/client/me", { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => setClient(Boolean(d.client)))
      .catch(() => {});
    return () => controller.abort();
  }, [path]);
  if (path.startsWith("/admin")) return null;
  if (!visible)
    return allowed && client ? (
      <div hidden>
        <PushSubscription audience="client" />
      </div>
    ) : null;
  return (
    <aside
      role="region"
      aria-label="Permitir notificações"
      className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-md rounded-2xl border bg-white text-gray-900 p-4 shadow-2xl space-y-3"
    >
      <h2 className="font-bold">Quer receber avisos da barbearia?</h2>
      <p className="text-sm text-gray-600">
        Receba atualizações e, 30 minutos após a conclusão do serviço, um
        convite para avaliar o atendimento.
      </p>
      {client ? (
        <PushSubscription audience="client" />
      ) : apple && !installed ? (
        <p className="text-sm">
          No iPhone, adicione o site à Tela de Início pelo Safari e abra pelo
          ícone para permitir notificações.
        </p>
      ) : (
        <button
          className="admin-primary"
          onClick={async () => {
            if (typeof Notification === "undefined") return;
            try {
              const permission = await Notification.requestPermission();
              setAllowed(permission === "granted");
              if (permission === "granted") {
                setVisible(false);
                setMessage("");
              } else {
                setVisible(false);
              }
            } catch {
              setMessage(
                "Abra pelo aplicativo instalado ou tente outro navegador.",
              );
            }
          }}
        >
          Permitir notificações
        </button>
      )}
      {!client && (
        <p className="text-xs text-gray-500">
          Entre na sua conta para vincular os avisos aos seus agendamentos.
        </p>
      )}
      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}
      <button
        className="text-sm underline"
        onClick={() => {
          setVisible(false);
          try {
            localStorage.setItem(
              "barbearia.notification-consent-dismissed",
              "true",
            );
          } catch {}
        }}
      >
        Agora não
      </button>
    </aside>
  );
}
