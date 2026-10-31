"use client";
import { useEffect, useState } from "react";
import { localDate } from "@/lib/availability";
type Period = { start_time: string; end_time: string };
type Saved = Period & { id: number; work_date: string };
export default function AvailabilityManager() {
  const [start, setStart] = useState(localDate());
  const [end, setEnd] = useState(localDate());
  const [days, setDays] = useState([0, 1, 2, 3, 4, 5, 6]);
  const [periods, setPeriods] = useState<Period[]>([
    { start_time: "19:00", end_time: "23:00" },
  ]);
  const [saved, setSaved] = useState<Saved[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function load() {
    try {
      const r = await fetch("/api/admin/availability");
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Erro ao carregar horários");
      setSaved(d.windows);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erro de conexão");
    }
  }
  useEffect(() => {
    load();
  }, []);
  const dates: string[] = [];
  for (
    let d = new Date(`${start}T12:00:00`);
    d <= new Date(`${end}T12:00:00`) && dates.length < 63;
    d.setDate(d.getDate() + 1)
  ) {
    if (days.includes(d.getDay()))
      dates.push(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      );
    if (new Date(`${end}T12:00:00`).getTime() - d.getTime() > 62 * 86400000)
      break;
  }
  async function save(targetDates = dates, windows = periods) {
    setBusy(true);
    setMessage("");
    try {
      const r = await fetch("/api/admin/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dates: targetDates, windows }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setMessage(
        `${targetDates.length} dia(s) atualizado(s). Os agendamentos existentes foram preservados.`,
      );
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Não foi possível salvar");
    } finally {
      setBusy(false);
    }
  }
  const byDate = saved.reduce<Record<string, Saved[]>>((all, w) => {
    (all[w.work_date] ??= []).push(w);
    return all;
  }, {});
  return (
    <section className="rounded-2xl border border-blue-100 bg-white p-5 md:p-6 space-y-5">
      <div>
        <p className="text-xs uppercase tracking-widest text-blue-700 font-semibold">
          Sua rotina, seus horários
        </p>
        <h2 className="text-xl font-bold mt-1">Abrir disponibilidade</h2>
        <p className="text-sm text-gray-500 mt-1">
          Aplique os mesmos períodos em vários dias. Dias sem períodos ficam
          fechados.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {["Próximos 7 dias", "7 dias seguintes"].map((label, i) => (
          <button
            key={label}
            className="admin-secondary"
            onClick={() => {
              const d = new Date(`${localDate()}T12:00:00`);
              if (i) d.setDate(d.getDate() + 7);
              const last = new Date(d);
              last.setDate(last.getDate() + 6);
              setStart(localDate(d));
              setEnd(localDate(last));
              setPeriods([{ start_time: "19:00", end_time: "23:00" }]);
            }}
          >
            {label} · 19h–23h
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="admin-label">
          De
          <input
            className="admin-input"
            type="date"
            min={localDate()}
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </label>
        <label className="admin-label">
          Até
          <input
            className="admin-input"
            type="date"
            min={start}
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((label, i) => (
          <button
            key={label}
            aria-pressed={days.includes(i)}
            onClick={() =>
              setDays(
                days.includes(i) ? days.filter((d) => d !== i) : [...days, i],
              )
            }
            className={`rounded-xl px-3 py-2 text-sm border ${days.includes(i) ? "bg-blue-900 text-white border-blue-900" : "border-gray-200"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {periods.map((period, i) => (
          <div key={i} className="flex flex-wrap items-end gap-3">
            <label className="admin-label">
              Início
              <input
                aria-label={`Início do período ${i + 1}`}
                className="admin-input"
                type="time"
                value={period.start_time}
                onChange={(e) =>
                  setPeriods(
                    periods.map((p, n) =>
                      n === i ? { ...p, start_time: e.target.value } : p,
                    ),
                  )
                }
              />
            </label>
            <label className="admin-label">
              Fim
              <input
                aria-label={`Fim do período ${i + 1}`}
                className="admin-input"
                type="time"
                value={period.end_time}
                onChange={(e) =>
                  setPeriods(
                    periods.map((p, n) =>
                      n === i ? { ...p, end_time: e.target.value } : p,
                    ),
                  )
                }
              />
            </label>
            <button
              className="admin-secondary"
              onClick={() => setPeriods(periods.filter((_, n) => n !== i))}
            >
              Remover período
            </button>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          disabled={periods.length >= 8}
          className="admin-secondary"
          onClick={() =>
            setPeriods([...periods, { start_time: "09:00", end_time: "12:00" }])
          }
        >
          + Adicionar período
        </button>
        <button
          className="admin-primary"
          disabled={busy || !dates.length || !periods.length}
          onClick={() => save()}
        >
          {busy ? "Salvando…" : `Aplicar em ${dates.length} dia(s)`}
        </button>
      </div>
      <p className="text-xs text-gray-500">
        Aplicar substitui os períodos dos dias selecionados. Para criar uma
        pausa, cadastre um período antes e outro depois dela. Atendimentos já
        marcados continuam válidos.
      </p>
      {message && (
        <p
          role="status"
          className="rounded-xl bg-blue-50 p-3 text-sm text-blue-900"
        >
          {message}
        </p>
      )}
      <div className="border-t pt-4">
        <h3 className="font-semibold mb-3">Dias abertos</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {Object.entries(byDate).map(([date, windows]) => (
            <div
              key={date}
              className="rounded-xl border border-gray-200 p-3 flex items-center justify-between gap-3"
            >
              <div>
                <p className="font-semibold text-sm">
                  {new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", {
                    weekday: "short",
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </p>
                <p className="text-sm text-gray-500">
                  {windows
                    .map(
                      (w) =>
                        `${w.start_time.slice(0, 5)}–${w.end_time.slice(0, 5)}`,
                    )
                    .join(" / ")}
                </p>
              </div>
              <button
                className="text-xs text-rose-700"
                disabled={busy}
                onClick={() => {
                  if (
                    window.confirm(
                      `Fechar ${date}? Atendimentos já marcados serão mantidos.`,
                    )
                  )
                    save([date], []);
                }}
              >
                Fechar dia
              </button>
            </div>
          ))}
        </div>
        {!saved.length && (
          <p className="text-sm text-gray-500">
            Nenhum dia aberto. Defina acima quando você pode atender.
          </p>
        )}
      </div>
    </section>
  );
}
