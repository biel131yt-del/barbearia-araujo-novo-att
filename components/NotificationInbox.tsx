"use client";
import { useEffect, useState } from "react";
export default function NotificationInbox({
  audience = "admin",
}: {
  audience?: "admin" | "client";
}) {
  const [rows, setRows] = useState<any[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState<number | null>(null);
  const url =
    audience === "admin"
      ? "/api/admin/notifications"
      : "/api/cliente/notifications";
  async function load() {
    try {
      const r = await fetch(url);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setRows(d.notifications);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Falha ao carregar notificações",
      );
    }
  }
  useEffect(() => {
    load();
  }, [url]);
  async function read(id: number) {
    setBusy(id);
    try {
      const r = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!r.ok) throw new Error("Falha ao marcar como lida");
      setRows(rows.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha");
    } finally {
      setBusy(null);
    }
  }
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 text-gray-900">
      <h2 className="text-lg font-semibold mb-4">Notificações</h2>
      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
      <div className="space-y-3">
        {rows.map((n) => (
          <article
            key={n.id}
            className={`rounded-xl border border-gray-200 p-4 ${n.is_read ? "" : "bg-blue-50"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{n.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(n.created_at).toLocaleString("pt-BR")}
                </p>
                {audience === "admin" && n.push_state && (
                  <p className="text-xs text-gray-500 mt-1">
                    Push:{" "}
                    {(
                      {
                        accepted: "aceito pelo serviço",
                        waiting_subscription: "aparelho não inscrito",
                        failed: "falhou",
                        pending: "aguardando envio",
                        processing: "enviando",
                      } as Record<string, string>
                    )[n.push_state] || n.push_state}
                  </p>
                )}
              </div>
              {!n.is_read && (
                <button
                  disabled={busy === n.id}
                  onClick={() => read(n.id)}
                  className="text-xs font-semibold text-blue-700"
                >
                  Marcar como lida
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
      {!rows.length && !error && (
        <p className="text-sm text-gray-500">Nenhuma notificação.</p>
      )}
    </section>
  );
}
