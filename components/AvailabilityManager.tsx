"use client";
import { useEffect, useState } from "react";
import { localDate, minutes, timeLabel } from "@/lib/availability";

type Period = { start_time: string; end_time: string };
type Saved = Period & { id: number; work_date: string };
function dayAfter(offset: number) {
  const d = new Date(localDate() + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
}
const timeOptions = Array.from({ length: 48 }, (_, i) => timeLabel(i * 30));
function TimeSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="admin-label">
      {label}
      <select
        className="admin-input text-lg"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {[...new Set([...timeOptions, value])].sort().map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </label>
  );
}
export default function AvailabilityManager() {
  const [dates, setDates] = useState<string[]>([dayAfter(0)]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [custom, setCustom] = useState("");
  const [periods, setPeriods] = useState<Period[]>([
    { start_time: "19:00", end_time: "23:00" },
  ]);
  const [saved, setSaved] = useState<Saved[]>([]),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function load() {
    try {
      const r = await fetch("/api/admin/availability");
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setSaved(d.windows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível carregar.");
    }
  }
  useEffect(() => {
    void load();
  }, []);
  function chooseDays(offset: number) {
    setWeekOffset(offset);
    setDates(Array.from({ length: 7 }, (_, i) => dayAfter(offset + i)));
    setMessage("");
  }
  function update(i: number, key: keyof Period, value: string) {
    setPeriods(periods.map((p, n) => (n === i ? { ...p, [key]: value } : p)));
    setMessage("");
  }
  async function save(targetDates = dates, windows = periods) {
    setBusy(true);
    setError("");
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
        windows.length
          ? `Pronto! ${targetDates.length} dia(s) aberto(s), das ${windows.map((w) => w.start_time + " às " + w.end_time).join(" e das ")}.`
          : "Dia fechado para novas reservas.",
      );
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally {
      setBusy(false);
    }
  }
  function addBreak() {
    const last = periods[periods.length - 1];
    const start = minutes(last.start_time),
      end = minutes(last.end_time);
    if (end - start < 90) {
      setError("Escolha um período de pelo menos 1h30 para incluir uma pausa.");
      return;
    }
    const middle = start + Math.floor((end - start - 30) / 60) * 30;
    setPeriods([
      ...periods.slice(0, -1),
      { start_time: last.start_time, end_time: timeLabel(middle) },
      { start_time: timeLabel(middle + 30), end_time: last.end_time },
    ]);
    setError("");
  }
  const shownDates = [
    ...new Set([
      ...Array.from({ length: 7 }, (_, i) => dayAfter(weekOffset + i)),
      ...dates,
    ]),
  ].sort();
  const byDate = saved.reduce<Record<string, Saved[]>>((all, w) => {
    (all[w.work_date] ??= []).push(w);
    return all;
  }, {});
  return (
    <section className="rounded-2xl border bg-white p-5 md:p-6 space-y-6">
      <header>
        <h2 className="text-xl font-bold">Quando você vai atender?</h2>
        <p className="text-sm text-gray-500 mt-1">
          Escolha os dias e diga a que horas começa e termina. O aplicativo
          organiza os atendimentos.
        </p>
      </header>
      <fieldset disabled={busy} className="space-y-4">
        <legend className="font-semibold mb-3">1. Escolha os dias</legend>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="admin-secondary"
            onClick={() => {
              setWeekOffset(0);
              setDates([dayAfter(0)]);
            }}
          >
            Só hoje
          </button>
          <button
            type="button"
            className="admin-secondary"
            onClick={() => {
              setWeekOffset(0);
              setDates([dayAfter(1)]);
            }}
          >
            Só amanhã
          </button>
          <button
            type="button"
            className="admin-secondary"
            onClick={() => chooseDays(0)}
          >
            Próximos 7 dias
          </button>
          <button
            type="button"
            className="admin-secondary"
            onClick={() => chooseDays(7)}
          >
            Semana seguinte
          </button>
          <button
            type="button"
            className="text-sm underline"
            onClick={() => setDates([])}
          >
            Limpar seleção
          </button>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {shownDates.map((date) => (
            <button
              type="button"
              key={date}
              aria-pressed={dates.includes(date)}
              onClick={() => {
                setDates(
                  dates.includes(date)
                    ? dates.filter((d) => d !== date)
                    : [...dates, date],
                );
                setMessage("");
              }}
              className={`rounded-xl border px-2 py-3 text-center ${dates.includes(date) ? "bg-blue-900 text-white" : "border-gray-200 text-gray-700"}`}
            >
              <span className="block text-xs uppercase">
                {new Date(date + "T12:00:00").toLocaleDateString("pt-BR", {
                  weekday: "short",
                })}
              </span>
              <strong className="block text-lg">
                {date.slice(8, 10)}/{date.slice(5, 7)}
              </strong>
            </button>
          ))}
        </div>
        <details>
          <summary className="cursor-pointer text-sm text-blue-700">
            Escolher outra data
          </summary>
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <label className="admin-label">
              Data
              <input
                type="date"
                min={localDate()}
                className="admin-input"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="admin-secondary"
              disabled={
                !custom || custom < localDate() || dates.includes(custom)
              }
              onClick={() => setDates([...dates, custom])}
            >
              Adicionar dia
            </button>
          </div>
        </details>
      </fieldset>
      <fieldset disabled={busy} className="space-y-4">
        <legend className="font-semibold mb-3">
          2. Que horas começa e termina?
        </legend>
        <div className="flex flex-wrap gap-2">
          {[
            ["Manhã", "09:00", "12:00"],
            ["Tarde", "13:00", "18:00"],
            ["Noite", "19:00", "23:00"],
          ].map(([label, start, end]) => (
            <button
              type="button"
              key={label}
              className="admin-secondary"
              onClick={() => {
                setPeriods([{ start_time: start, end_time: end }]);
                setMessage("");
              }}
            >
              {label} · {start}–{end}
            </button>
          ))}
        </div>
        {periods.map((p, i) => (
          <div key={i} className="space-y-2">
            {i > 0 && (
              <p className="text-sm text-gray-500">
                Pausa entre {periods[i - 1].end_time} e {p.start_time}
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <TimeSelect
                label={i ? "Volto a atender às" : "Começo às"}
                value={p.start_time}
                onChange={(v) => update(i, "start_time", v)}
              />
              <TimeSelect
                label="Termino às"
                value={p.end_time}
                onChange={(v) => update(i, "end_time", v)}
              />
            </div>
            {i > 0 && (
              <button
                type="button"
                className="text-sm text-rose-700"
                onClick={() => setPeriods(periods.filter((_, n) => n !== i))}
              >
                Remover este horário
              </button>
            )}
          </div>
        ))}
        <details>
          <summary className="cursor-pointer text-sm text-blue-700">
            Preciso fazer uma pausa
          </summary>
          <div className="mt-3 space-y-2">
            <p className="text-xs text-gray-500">
              Divida o horário e ajuste quando vai parar e voltar.
            </p>
            <button
              type="button"
              className="admin-secondary"
              disabled={periods.length >= 8}
              onClick={addBreak}
            >
              Adicionar pausa de 30 min
            </button>
          </div>
        </details>
      </fieldset>
      <div className="rounded-xl bg-blue-50 p-4 space-y-2">
        <p className="font-semibold text-blue-900">
          {dates.length
            ? `${dates.length} dia(s) selecionado(s) · ${periods.map((p) => p.start_time + "–" + p.end_time).join(" / ")}`
            : "Escolha pelo menos um dia acima."}
        </p>
        <p className="text-sm text-blue-900">
          O tempo de cada atendimento vem do serviço escolhido. Um corte de 1
          hora reserva 1 hora inteira.
        </p>
        <a
          href="/admin/servicos"
          className="inline-block text-sm underline text-blue-700"
        >
          Ajustar duração dos serviços
        </a>
      </div>
      <button
        type="button"
        className="admin-primary w-full text-base py-4"
        disabled={busy || !dates.length}
        onClick={() => save()}
      >
        {busy
          ? "Salvando…"
          : `Salvar horários${dates.length ? " em " + dates.length + " dia(s)" : ""}`}
      </button>
      <p className="text-xs text-gray-500">
        Todos os dias selecionados receberão esse horário. Agendamentos já
        feitos continuam valendo. Horários de Brasília.
      </p>
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 text-red-700 p-3 text-sm"
        >
          {error}
        </p>
      )}
      {message && (
        <p
          role="status"
          className="rounded-xl bg-blue-50 text-blue-900 p-3 text-sm"
        >
          {message}
        </p>
      )}
      <div className="border-t pt-5 space-y-3">
        <h3 className="font-semibold">Dias que já estão abertos</h3>
        {Object.entries(byDate).map(([date, windows]) => (
          <article
            key={date}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3"
          >
            <div>
              <p className="font-semibold">
                {new Date(date + "T12:00:00").toLocaleDateString("pt-BR", {
                  weekday: "short",
                  day: "2-digit",
                  month: "2-digit",
                })}
              </p>
              <p className="text-sm text-gray-500">
                {windows
                  .map(
                    (w) =>
                      w.start_time.slice(0, 5) + "–" + w.end_time.slice(0, 5),
                  )
                  .join(" / ")}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                className="text-sm text-blue-700 font-semibold"
                disabled={busy}
                onClick={() => {
                  setDates([date]);
                  setPeriods(
                    windows.map((w) => ({
                      start_time: w.start_time.slice(0, 5),
                      end_time: w.end_time.slice(0, 5),
                    })),
                  );
                  setMessage(
                    "Dia selecionado. Altere o horário acima e toque em Salvar horários.",
                  );
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Alterar
              </button>
              <button
                type="button"
                className="text-sm text-rose-700"
                disabled={busy}
                onClick={() => {
                  if (
                    window.confirm(
                      "Fechar este dia para novas reservas? Os agendamentos existentes serão mantidos.",
                    )
                  )
                    void save([date], []);
                }}
              >
                Fechar dia
              </button>
            </div>
          </article>
        ))}
        {!saved.length && (
          <p className="text-sm text-gray-500">
            Nenhum dia aberto. Escolha os dias acima e salve.
          </p>
        )}
      </div>
    </section>
  );
}
