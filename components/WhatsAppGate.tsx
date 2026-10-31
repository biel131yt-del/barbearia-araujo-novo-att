"use client";
import { useEffect, useRef, useState } from "react";
import PushSubscription from "./PushSubscription";
type Pending = {
  id: number;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  price_cents: number;
  whatsapp_url: string;
  whatsapp_opened_at: string | null;
};
export default function WhatsAppGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pending, setPending] = useState<Pending | null>(null),
    [opened, setOpened] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const panel = useRef<HTMLElement>(null);
  const pendingId = pending?.id;
  useEffect(() => {
    if (!pendingId) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = Array.from(
        panel.current?.querySelectorAll<HTMLElement>(
          'a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),[tabindex="0"]',
        ) || [],
      );
      const first = items[0],
        last = items[items.length - 1];
      if (!first) {
        event.preventDefault();
        return;
      }
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === panel.current)
      ) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", trap);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", trap);
      previous?.focus();
    };
  }, [pendingId]);
  useEffect(() => {
    fetch("/api/cliente/whatsapp")
      .then((r) => r.json())
      .then((d) => {
        setPending(d.pending);
        setOpened(Boolean(d.pending?.whatsapp_opened_at));
      })
      .catch(() => {});
    const show = (e: Event) => {
      const p = (e as CustomEvent).detail;
      setPending(p);
      setOpened(Boolean(p.whatsapp_opened_at));
    };
    window.addEventListener("booking-reserved", show);
    return () => window.removeEventListener("booking-reserved", show);
  }, []);
  async function mark(action: string) {
    if (!pending) return;
    setError("");
    setBusy(true);
    try {
      const r = await fetch("/api/cliente/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pending.id, action }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      if (action === "opened") setOpened(true);
      else setPending(null);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Não foi possível registrar. Tente novamente.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div inert={Boolean(pending)}>{children}</div>
      {pending && (
        <div
          className="fixed inset-0 z-[60] overflow-y-auto bg-brand-950/95 p-4 flex items-start justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="whatsapp-title"
        >
          <section
            ref={panel}
            tabIndex={-1}
            className="my-8 w-full max-w-lg rounded-3xl border border-white/20 bg-brand-950 p-6 text-slate-100 space-y-5 shadow-2xl"
          >
            <p className="text-xs uppercase tracking-widest text-green-400 font-bold">
              Falta uma etapa
            </p>
            <h2 id="whatsapp-title" className="text-2xl font-bold">
              Envie sua reserva ao barbeiro
            </h2>
            <p className="text-sm text-slate-300">
              Seu horário está reservado no aplicativo. Para concluir o fluxo,
              abra o WhatsApp e envie a mensagem pronta ao dono da barbearia.
            </p>
            <div className="rounded-xl border border-white/20 p-4">
              <strong>{pending.service_name}</strong>
              <p className="text-sm mt-1">
                {pending.appointment_date
                  .slice(0, 10)
                  .split("-")
                  .reverse()
                  .join("/")}{" "}
                às {pending.appointment_time.slice(0, 5)}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Agendamento #{pending.id}
              </p>
            </div>
            <a
              href={pending.whatsapp_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                void mark("opened");
              }}
              className="block text-center rounded-xl bg-green-600 text-white font-semibold p-4"
            >
              1. Abrir mensagem no WhatsApp
            </a>
            <p className="text-xs text-slate-400">
              Toque em Enviar dentro do WhatsApp e volte aqui. O aplicativo não
              consegue enviar a mensagem nem verificar o envio por você.
            </p>
            <button
              disabled={!opened || busy}
              onClick={() => mark("reported_sent")}
              className="w-full rounded-xl bg-accent p-4 font-semibold disabled:opacity-40"
            >
              2. Já enviei a mensagem
            </button>
            {error && (
              <p role="alert" className="text-red-400 text-sm">
                {error}
              </p>
            )}
            <PushSubscription audience="client" />
          </section>
        </div>
      )}
    </>
  );
}
