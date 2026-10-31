"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import WhatsAppGate from "@/components/WhatsAppGate";
import OpenDates from "@/components/OpenDates";
import PushSubscription from "@/components/PushSubscription";
import {
  Scissors,
  CheckCircle2,
  ArrowLeft,
  Clock,
  CalendarDays,
} from "lucide-react";
import { localDate } from "@/lib/availability";
type Service = {
  id: number;
  name: string;
  description: string | null;
  price_cents: number;
  duration_minutes: number;
  image_url: string | null;
  is_featured: boolean;
};
type Client = { id: number; name: string; phone: string };
const money = (c: number) =>
  (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export default function Agendar() {
  const [client, setClient] = useState<Client | null>(null),
    [ready, setReady] = useState(false);
  const [services, setServices] = useState<Service[]>([]),
    [service, setService] = useState<Service | null>(null);
  const [date, setDate] = useState(""),
    [time, setTime] = useState(""),
    [times, setTimes] = useState<string[]>([]);
  const [quote, setQuote] = useState<number | null>(null);
  const [step, setStep] = useState(1),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false),
    [saving, setSaving] = useState(false),
    [success, setSuccess] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      fetch("/api/auth/client/me", { signal: controller.signal }).then((r) =>
        r.json(),
      ),
      fetch("/api/services", { signal: controller.signal }).then(async (r) => {
        if (!r.ok) throw new Error("Não foi possível carregar os serviços.");
        return r.json();
      }),
    ])
      .then(([c, s]) => {
        setClient(c.client);
        setServices(s.services);
        setReady(true);
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          setError(e.message);
          setReady(true);
        }
      });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    setTime("");
    setTimes([]);
    setQuote(null);
    if (!service || !date) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetch(`/api/availability?date=${date}&service_id=${service.id}`, {
      signal: controller.signal,
    })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setTimes(d.times);
        setQuote(d.price_cents);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [date, service]);
  async function book() {
    setSaving(true);
    setError("");
    try {
      const r = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: service!.id,
          date,
          time,
          expected_price_cents: quote,
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        if (d.pending)
          window.dispatchEvent(
            new CustomEvent("booking-reserved", { detail: d.pending }),
          );
        if (r.status === 409) {
          setTimes((t) => t.filter((x) => x !== time));
          setTime("");
          setStep(2);
        }
        throw new Error(d.error);
      }
      if (d.pending)
        window.dispatchEvent(
          new CustomEvent("booking-reserved", { detail: d.pending }),
        );
      setSuccess(true);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Falha de conexão. Verifique seus agendamentos antes de tentar novamente.",
      );
    } finally {
      setSaving(false);
    }
  }
  const primary =
    "w-full rounded-xl bg-accent px-5 py-3.5 font-semibold text-white disabled:opacity-40 hover:brightness-110";
  return (
    <WhatsAppGate>
      <main className="min-h-screen bg-brand-950 text-slate-100 py-8 px-4">
        <div className="max-w-xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 mb-8"
          >
            <ArrowLeft size={16} /> Voltar ao site
          </Link>
          <p className="uppercase tracking-[0.25em] text-xs text-red-400 font-bold">
            Barbearia Araújo
          </p>
          <h1 className="font-display text-4xl mt-2 mb-6">
            Seu próximo corte começa aqui.
          </h1>
          {error && (
            <p
              role="alert"
              className="mb-4 border border-red-400/30 bg-red-500/10 text-red-200 rounded-xl p-4 text-sm"
            >
              {error}
            </p>
          )}
          {!ready ? (
            <p role="status">Carregando sua conta…</p>
          ) : success ? (
            <section className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
              <CheckCircle2 size={48} className="text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Horário reservado!</h2>
              <p className="text-slate-300 mt-3">
                {service?.name} ·{" "}
                {new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR")} às{" "}
                {time}
              </p>
              <Link className={`${primary} inline-block mt-6`} href="/cliente">
                Ver meus agendamentos
              </Link>
            </section>
          ) : !client ? (
            <section className="rounded-3xl border border-white/10 bg-white/5 p-7 space-y-4">
              <h2 className="text-xl font-bold">
                Entre uma vez. Agende sempre.
              </h2>
              <p className="text-slate-400 text-sm">
                Crie sua conta para reservar e acompanhar seus horários. Neste
                aparelho, você continua conectado por até 180 dias, salvo se
                sair da conta ou limpar os dados.
              </p>
              <Link
                className={`${primary} block text-center`}
                href="/cliente/cadastro"
              >
                Criar minha conta
              </Link>
              <Link
                className="block text-center rounded-xl border border-white/20 py-3 font-semibold"
                href="/cliente/login"
              >
                Já tenho conta
              </Link>
            </section>
          ) : (
            <section className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-8">
              <p className="text-sm text-slate-400 mb-6">
                Olá,{" "}
                <strong className="text-white">
                  {client.name.split(" ")[0]}
                </strong>
                . Vamos reservar seu horário?
              </p>
              <ol className="flex gap-2 mb-7">
                {["Serviço", "Dia e horário", "Confirmar"].map((name, i) => (
                  <li
                    key={name}
                    className={`flex-1 border-t-2 pt-3 text-xs ${step >= i + 1 ? "border-red-500 text-white" : "border-white/10 text-slate-500"}`}
                  >
                    {i + 1}. {name}
                  </li>
                ))}
              </ol>
              {step === 1 && (
                <div className="space-y-3">
                  <h2 className="text-xl font-bold mb-4">
                    O que vamos fazer hoje?
                  </h2>
                  {services.map((s) => (
                    <button
                      key={s.id}
                      aria-pressed={service?.id === s.id}
                      onClick={() => setService(s)}
                      className={`w-full flex items-center gap-4 text-left p-4 rounded-2xl border ${service?.id === s.id ? "border-red-500 bg-red-500/10" : "border-white/10 hover:bg-white/5"}`}
                    >
                      {s.image_url && (
                        <img
                          src={s.image_url}
                          alt=""
                          className="w-16 h-16 object-cover rounded-xl"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold">{s.name}</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          {s.description}
                        </p>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400 mt-2">
                          <Clock size={12} />
                          {s.duration_minutes} min
                        </span>
                      </div>
                      <strong className="whitespace-nowrap">
                        {money(s.price_cents)}
                      </strong>
                    </button>
                  ))}
                  {!services.length && (
                    <p className="text-slate-400">
                      Os serviços estarão disponíveis em breve.
                    </p>
                  )}
                  <button
                    disabled={!service}
                    className={primary}
                    onClick={() => setStep(2)}
                  >
                    Escolher dia e horário
                  </button>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-bold">Quando fica melhor?</h2>
                  <OpenDates
                    serviceId={service!.id}
                    value={date}
                    onChange={setDate}
                  />
                  <p className="text-xs text-slate-400">
                    Horários de Brasília. Reservamos {service?.duration_minutes}{" "}
                    minutos para {service?.name}.
                  </p>
                  {loading ? (
                    <p role="status">Buscando horários livres…</p>
                  ) : !date ? (
                    <p className="text-sm text-slate-400">
                      Selecione um dia para ver os horários.
                    </p>
                  ) : !times.length ? (
                    <div className="rounded-xl bg-white/5 p-5 text-sm text-slate-300">
                      Sem horários livres neste dia. Tente outra data.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {times.map((t) => (
                        <button
                          key={t}
                          aria-pressed={time === t}
                          onClick={() => setTime(t)}
                          className={`rounded-xl py-3 text-sm border ${time === t ? "bg-accent border-accent text-white" : "border-white/10 text-slate-300"}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    className={primary}
                    disabled={!time || loading || quote === null}
                    onClick={() => setStep(3)}
                  >
                    Revisar agendamento
                  </button>
                  <button
                    className="text-sm text-slate-400"
                    onClick={() => setStep(1)}
                  >
                    Voltar aos serviços
                  </button>
                </div>
              )}
              {step === 3 && (
                <div className="space-y-5">
                  <h2 className="text-xl font-bold">
                    Tudo certo para confirmar?
                  </h2>
                  <dl className="rounded-2xl bg-brand-950/60 p-5 space-y-4">
                    <div>
                      <dt className="text-xs text-slate-500">Serviço</dt>
                      <dd className="font-semibold">{service?.name}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Data e horário</dt>
                      <dd>
                        {new Date(`${date}T12:00:00`).toLocaleDateString(
                          "pt-BR",
                        )}{" "}
                        às {time} · {service?.duration_minutes} min
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-500">Cliente</dt>
                      <dd>
                        {client.name} · {client.phone}
                      </dd>
                    </div>
                    <div className="border-t border-white/10 pt-3 flex justify-between">
                      <dt>Total</dt>
                      <dd className="font-bold text-xl">
                        {money(quote ?? service!.price_cents)}
                      </dd>
                    </div>
                  </dl>
                  <p className="text-xs text-slate-400">
                    Pagamento no atendimento. Seu horário só será reservado após
                    a confirmação abaixo.
                  </p>
                  <button disabled={saving} className={primary} onClick={book}>
                    {saving ? "Reservando…" : "Confirmar meu horário"}
                  </button>
                  <button
                    disabled={saving}
                    className="text-sm text-slate-400"
                    onClick={() => setStep(2)}
                  >
                    Alterar dia ou horário
                  </button>
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </WhatsAppGate>
  );
}
