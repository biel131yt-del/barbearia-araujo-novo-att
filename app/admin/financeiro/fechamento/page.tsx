"use client";
import { useEffect, useState } from "react";
import { localDate } from "@/lib/availability";
const money = (n: number) =>
  (n / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export default function Page() {
  const [date, setDate] = useState(localDate()),
    [rows, setRows] = useState<any[]>([]),
    [totals, setTotals] = useState<any[]>([]),
    [adjust, setAdjust] = useState("0"),
    [note, setNote] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function load() {
    try {
      const r = await fetch("/api/admin/financeiro/fechamentos");
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setRows(d.fechamentos);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao carregar");
    }
  }
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    const c = new AbortController();
    fetch("/api/admin/financeiro/fechamentos?date=" + date, {
      signal: c.signal,
    })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setTotals(d.totals);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      });
    return () => c.abort();
  }, [date]);
  async function close(e: React.FormEvent) {
    e.preventDefault();
    if (
      !confirm(
        "Registrar o fechamento deste dia? Esse registro não pode ser fechado novamente.",
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/admin/financeiro/fechamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          closure_date: date,
          adjustments_cents: Math.round(Number(adjust) * 100),
          adjustments_note: note,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setError("Fechamento registrado.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao fechar");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Fechamento diário</h1>
      <form
        onSubmit={close}
        className="bg-white border rounded-2xl p-5 space-y-4"
      >
        <label className="admin-label">
          Data
          <input
            required
            type="date"
            max={localDate()}
            className="admin-input max-w-xs"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <p className="text-sm text-gray-500">
          Recebimentos registrados:{" "}
          <strong>
            {money(totals.reduce((n, t) => n + Number(t.total), 0))}
          </strong>
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="admin-label">
            Ajuste do caixa (R$; negativo para saída)
            <input
              required
              type="number"
              step=".01"
              className="admin-input"
              value={adjust}
              onChange={(e) => setAdjust(e.target.value)}
            />
          </label>
          <label className="admin-label">
            Observação
            <input
              className="admin-input"
              maxLength={300}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
        </div>
        <button disabled={busy} className="admin-primary">
          {busy ? "Registrando…" : "Fechar caixa"}
        </button>
        <p className="text-xs text-gray-500">
          O fechamento guarda um retrato dos recebimentos e ajustes neste
          momento. Despesas aparecem no fluxo de caixa. Lançamentos posteriores
          não alteram o fechamento salvo.
        </p>
      </form>
      {error && (
        <p role="status" className="text-blue-700">
          {error}
        </p>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        {rows.map((f) => (
          <article key={f.id} className="bg-white border rounded-2xl p-5">
            <h2 className="font-bold">
              {String(f.closure_date)
                .slice(0, 10)
                .split("-")
                .reverse()
                .join("/")}
            </h2>
            <p className="text-sm text-gray-500 mt-3">
              Dinheiro {money(f.cash_total_cents)} · Pix{" "}
              {money(f.pix_total_cents)}
            </p>
            <p className="text-sm text-gray-500">
              Cartões {money(f.card_total_cents)} · Outros{" "}
              {money(f.other_total_cents)}
            </p>
            <p className="text-sm text-gray-500">
              Ajuste {money(f.adjustments_cents)}
            </p>
            <strong className="block text-xl mt-3">
              Total{" "}
              {money(
                f.cash_total_cents +
                  f.pix_total_cents +
                  f.card_total_cents +
                  f.other_total_cents +
                  f.adjustments_cents,
              )}
            </strong>
            <p className="text-xs text-gray-500 mt-2">{f.adjustments_note}</p>
          </article>
        ))}
      </div>
      {!rows.length && (
        <p className="text-sm text-gray-500">Nenhum fechamento registrado.</p>
      )}
    </div>
  );
}
