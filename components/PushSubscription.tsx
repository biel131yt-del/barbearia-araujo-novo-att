"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, CheckCircle } from "lucide-react";

export default function PushSubscription() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Verifica suporte ao Push API
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      setSupported(false);
      return;
    }
    setSupported(true);

    // Verifica se já está inscrito
    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager
        .getSubscription()
        .then((sub) => {
          setSubscribed(!!sub);
        })
        .catch(() => setSubscribed(false));
    });
  }, []);

  async function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
      setError("Service Worker não suportado neste navegador");
      return;
    }
    return navigator.serviceWorker.register("/sw.js");
  }

  async function subscribe() {
    setLoading(true);
    setError("");
    try {
      const registration = await registerServiceWorker();
      if (!registration) throw new Error("Service Worker não registrado");

      // Obtém a chave pública VAPID
      const res = await fetch("/api/push/vapid");
      if (!res.ok) throw new Error("VAPID não configurado");
      const { publicKey } = await res.json();

      // Converte a chave para Uint8Array
      const applicationServerKey = urlBase64ToUint8Array(publicKey);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as any,
      });

      // Envia para o backend
      const subRes = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(
              String.fromCharCode(...new Uint8Array(subscription.getKey("p256dh")!))
            ),
            auth: btoa(
              String.fromCharCode(...new Uint8Array(subscription.getKey("auth")!))
            ),
          },
          user_agent: navigator.userAgent,
        }),
      });

      if (!subRes.ok) throw new Error("Falha ao registrar no servidor");

      setSubscribed(true);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Erro ao ativar notificações");
      setLoading(false);
    }
  }

  async function unsubscribe() {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setSubscribed(false);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Erro ao desativar notificações");
      setLoading(false);
    }
  }

  if (supported === false) {
    return (
      <div className="p-4 rounded-xl border border-gray-100 bg-amber-50">
        <p className="text-sm text-amber-800 flex items-center gap-2">
          <BellOff className="h-4 w-4" />
          Notificações push não são suportadas neste navegador/dispositivo.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border border-gray-100 bg-white">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-medium text-gray-900">Notificações Push</p>
          <p className="text-xs text-gray-500">
            Receba alertas de novos agendamentos no seu dispositivo
          </p>
        </div>
      </div>

      {subscribed ? (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <div>
            <p className="text-sm font-medium text-emerald-800">Notificações ativadas</p>
            <p className="text-xs text-emerald-700">
              Você receberá alertas em tempo real
            </p>
          </div>
          <button
            onClick={unsubscribe}
            disabled={loading}
            className="ml-auto text-sm text-rose-600 hover:text-rose-700 font-medium"
          >
            Desativar
          </button>
        </div>
      ) : (
        <button
          onClick={subscribe}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white bg-blue-900 hover:bg-blue-800 disabled:opacity-60 transition-all"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent rounded-full"></span>
              Ativando...
            </>
          ) : (
            <>
              <Bell className="h-4 w-4" />
              Ativar notificações
            </>
          )}
        </button>
      )}

      {error && (
        <div className="mt-3 p-3 rounded-lg border border-rose-100 bg-rose-50">
          <p className="text-sm text-rose-700">{error}</p>
        </div>
      )}
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
