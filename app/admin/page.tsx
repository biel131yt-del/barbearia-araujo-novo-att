"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
const money = (n: number) =>
  (Number(n || 0) / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
export default function Dashboard() {
  const [period, setPeriod] = useState("month"),
    [data, setData] = useState<any>(null),
    [error, setError] = useState("");
  useEffect(() => {
    const c = new AbortController();
    setError("");
    fetch("/api/admin/dashboard?period=" + period, { signal: c.signal })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      });
    return () => c.abort();
  }, [period]);
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Visão geral</h1>
          <p className="text-sm text-gray-500 mt-1">
            Indicadores dos seus atendimentos e recebimentos.
          </p>
        </div>
        <div className="flex gap-2">
          {[
            ["day", "Hoje"],
            ["week", "Esta semana"],
            ["month", "Este mês"],
          ].map(([value, label]) => (
            <button
              key={value}
              aria-pressed={period === value}
              className={period === value ? "admin-primary" : "admin-secondary"}
              onClick={() => setPeriod(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </header>
      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
      {!data && !error ? (
        <p>Carregando indicadores…</p>
      ) : (
        data && (
          <>
            <p className="text-xs text-gray-500">
              Período: {data.start.split("-").reverse().join("/")} a{" "}
              {data.end.split("-").reverse().join("/")}
            </p>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                ["Agendamentos", data.appointments],
                ["Concluídos", data.completed],
                ["Cancelamentos", data.cancelled],
                ["Recebido", money(data.revenue_received)],
                ["Previsto", money(data.revenue_expected)],
                ["Novos clientes", data.new_clients],
                ["Avaliação média", data.avg_rating + " ★"],
                ["Próximos atendimentos", data.upcoming_appointments.length],
              ].map(([label, value]) => (
                <article
                  key={label}
                  className="rounded-2xl border border-gray-200 bg-white p-5"
                >
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    {label}
                  </p>
                  <strong className="text-2xl block mt-3 text-gray-900">
                    {value}
                  </strong>
                </article>
              ))}
            </div>
            <div className="grid lg:grid-cols-2 gap-5">
              <section className="rounded-2xl border bg-white p-5">
                <h2 className="font-bold mb-4">Próximos atendimentos</h2>
                {data.upcoming_appointments.map((a: any) => (
                  <Link
                    key={a.id}
                    href="/admin/agenda"
                    className="block border-t border-gray-200 py-3 text-sm"
                  >
                    <strong>{a.client_name}</strong>
                    <p className="text-gray-500">
                      {a.service_name} ·{" "}
                      {a.appointment_date.split("-").reverse().join("/")} às{" "}
                      {a.appointment_time.slice(0, 5)}
                    </p>
                  </Link>
                ))}
                {!data.upcoming_appointments.length && (
                  <p className="text-sm text-gray-500">
                    Nenhum atendimento agendado.
                  </p>
                )}
              </section>
              <section className="rounded-2xl border bg-white p-5">
                <h2 className="font-bold mb-4">Últimas movimentações</h2>
                {data.recent_financials.map((m: any, i: number) => (
                  <p
                    key={i}
                    className="flex justify-between gap-3 border-t border-gray-200 py-3 text-sm"
                  >
                    <span>{m.name}</span>
                    <strong
                      className={
                        m.type === "saida"
                          ? "text-rose-700"
                          : "text-emerald-700"
                      }
                    >
                      {m.type === "saida" ? "-" : "+"}
                      {money(m.amount_cents)}
                    </strong>
                  </p>
                ))}
                {!data.recent_financials.length && (
                  <p className="text-sm text-gray-500">
                    Nenhuma movimentação no período.
                  </p>
                )}
              </section>
            </div>
          </>
        )
      )}
    </div>
  );
}
