"use client";
import { useEffect, useState } from "react";
import { localDate } from "@/lib/availability";
export default function OpenDates({
  serviceId,
  value,
  onChange,
}: {
  serviceId: number;
  value: string;
  onChange: (date: string) => void;
}) {
  const [month, setMonth] = useState(localDate().slice(0, 7)),
    [months, setMonths] = useState<string[]>([]),
    [dates, setDates] = useState<{ date: string; count: number }[]>([]),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    onChange("");
    setDates([]);
    setLoading(true);
    setError("");
    const controller = new AbortController();
    fetch(`/api/availability?month=${month}&service_id=${serviceId}`, {
      signal: controller.signal,
    })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Falha ao consultar os dias");
        setMonths(d.months);
        if (d.months.length && !d.months.includes(month)) {
          setMonth(d.months[0]);
          return;
        }
        setDates(d.dates);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [month, serviceId]);
  const options = [...new Set([month, ...months])].sort();
  return (
    <section className="space-y-4">
      <label className="block text-sm font-medium">
        Mês do atendimento
        <select
          aria-label="Mês do atendimento"
          className="mt-2 w-full rounded-xl border border-white/20 bg-brand-900 px-4 py-3"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        >
          {options.map((m) => (
            <option key={m} value={m}>
              {new Date(m + "-15T12:00:00").toLocaleDateString("pt-BR", {
                month: "long",
                year: "numeric",
              })}
            </option>
          ))}
        </select>
      </label>
      <p className="text-xs text-slate-400">
        Somente dias abertos com tempo livre para este serviço.
      </p>
      {loading ? (
        <p role="status" className="text-sm text-slate-400">
          Consultando dias disponíveis…
        </p>
      ) : error ? (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      ) : !dates.length ? (
        <p className="rounded-xl border border-white/10 p-4 text-sm text-slate-400">
          Nenhum dia disponível neste mês.
          {months.length
            ? " Escolha outro mês."
            : " O barbeiro ainda não abriu novos dias."}
        </p>
      ) : (
        <div
          role="group"
          aria-label="Dias disponíveis"
          className="grid grid-cols-3 sm:grid-cols-4 gap-2"
        >
          {dates.map((d) => (
            <button
              key={d.date}
              type="button"
              aria-pressed={value === d.date}
              onClick={() => onChange(d.date)}
              className={`rounded-2xl border p-3 text-center ${value === d.date ? "bg-accent border-transparent" : "border-white/20 hover:bg-white/10"}`}
            >
              <span className="block text-xs uppercase">
                {new Date(d.date + "T12:00:00").toLocaleDateString("pt-BR", {
                  weekday: "short",
                })}
              </span>
              <strong className="block text-2xl my-1">{d.date.slice(8)}</strong>
              <span className="text-[10px]">{d.count} horários</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
