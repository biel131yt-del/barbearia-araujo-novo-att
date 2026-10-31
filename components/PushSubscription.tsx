"use client";
import { useEffect, useState } from "react";
export default function PushSubscription({
  audience = "admin",
}: {
  audience?: "admin" | "client";
}) {
  const [supported, setSupported] = useState(false),
    [installed, setInstalled] = useState(true),
    [ios, setIos] = useState(false),
    [subscribed, setSubscribed] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  useEffect(() => {
    const apple =
      /iPhone|iPad|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIos(apple);
    setInstalled(
      matchMedia("(display-mode: standalone)").matches ||
        Boolean((navigator as any).standalone),
    );
    setSupported(
      "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window,
    );
    if ("serviceWorker" in navigator)
      navigator.serviceWorker
        .register("/sw.js")
        .then(async (reg) => {
          const sub = await reg.pushManager.getSubscription();
          if (sub) {
            const r = await fetch("/api/push/subscribe?audience=" + audience);
            if (r.ok) {
              const d = await r.json();
              setSubscribed(d.endpoints.includes(sub.endpoint));
            }
          }
        })
        .catch(() => {});
  }, [audience]);
  async function subscribe() {
    setBusy(true);
    setMessage("");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted")
        throw new Error(
          "Permissão não concedida. Ative as notificações nos ajustes do aparelho para este aplicativo.",
        );
      const r = await fetch("/api/push/vapid");
      const d = await r.json();
      if (!r.ok)
        throw new Error(
          "O serviço de notificações ainda precisa ser configurado pelo administrador.",
        );
      await navigator.serviceWorker.register("/sw.js");
      const reg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<never>((_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(
                  "O aplicativo ainda está atualizando. Reabra e tente novamente.",
                ),
              ),
            10000,
          ),
        ),
      ]);
      const key = Uint8Array.from(
        atob(d.publicKey.replace(/-/g, "+").replace(/_/g, "/")),
        (c) => c.charCodeAt(0),
      );
      const sub =
        (await reg.pushManager.getSubscription()) ||
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: key,
        }));
      const body = {
        ...sub.toJSON(),
        audience,
        user_agent: navigator.userAgent,
      };
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubscribed(true);
      setMessage(
        "Notificações ativadas neste aparelho. Use o teste abaixo para conferir.",
      );
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Falha ao ativar notificações",
      );
    } finally {
      setBusy(false);
    }
  }
  async function unsubscribe() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const r = await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audience, endpoint: sub.endpoint }),
        });
        if (!r.ok) throw new Error("Não foi possível desativar.");
        await sub.unsubscribe();
      }
      setSubscribed(false);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Falha de conexão");
    } finally {
      setBusy(false);
    }
  }
  async function test() {
    setBusy(true);
    try {
      const r = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audience }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setMessage(d.message);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Não foi possível testar");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="rounded-2xl border border-gray-200 bg-white text-gray-900 p-4 space-y-3">
      <h3 className="font-semibold">Notificações neste aparelho</h3>
      <p className="text-sm text-gray-500">
        {audience === "admin"
          ? "Receba alertas de novos agendamentos e alterações."
          : "Receba atualizações do seu agendamento."}
      </p>
      {ios && !installed ? (
        <div className="rounded-xl bg-blue-50 p-3 text-sm text-blue-900">
          No iPhone: abra pelo Safari, toque em Compartilhar → Adicionar à Tela
          de Início. Abra pelo novo ícone e toque em Ativar notificações. Requer
          iOS 16.4 ou superior.
        </div>
      ) : !supported ? (
        <p className="text-sm text-gray-500">
          Este navegador não oferece Web Push. As notificações continuam
          disponíveis dentro do aplicativo.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            className={subscribed ? "admin-secondary" : "admin-primary"}
            disabled={busy}
            onClick={subscribed ? unsubscribe : subscribe}
          >
            {busy
              ? "Aguarde…"
              : subscribed
                ? "Desativar notificações"
                : "Ativar notificações"}
          </button>
          {subscribed && (
            <button className="admin-secondary" disabled={busy} onClick={test}>
              Enviar teste para este aparelho
            </button>
          )}
        </div>
      )}
      {message && (
        <p role="status" className="text-sm text-blue-700">
          {message}
        </p>
      )}
      <p className="text-xs text-gray-500">
        A entrega depende da permissão, conexão e modo Foco do aparelho. Uma
        mensagem aceita pelo serviço push pode ainda não ter sido exibida.
      </p>
    </section>
  );
}
