"use client";
import { useEffect, useState } from "react";
import { localDate } from "@/lib/availability";
const methods: Record<string, string> = {
  pix: "Pix",
  cash: "Dinheiro",
  debit_card: "Débito",
  credit_card: "Crédito",
  other: "Outro",
};
const money = (n: number) =>
  (n / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export default function FinancialEntries({
  kind,
}: {
  kind: "receitas" | "despesas";
}) {
  const expense = kind === "despesas";
  const [rows, setRows] = useState<any[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [open, setOpen] = useState(false),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("");
  const [form, setForm] = useState({
    name: "",
    amount: "",
    date: localDate(),
    payment_method: "pix",
  });
  async function load() {
    try {
      const r = await fetch(`/api/admin/financeiro/${kind}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setRows(d[kind]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível carregar.");
    }
  }
  useEffect(() => {
    load();
  }, [kind]);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const body = expense
        ? {
            name: form.name,
            amount_cents: Math.round(Number(form.amount) * 100),
            due_date: form.date,
            payment_method: form.payment_method,
          }
        : {
            source: form.name,
            amount_cents: Math.round(Number(form.amount) * 100),
            received_at: `${form.date}T12:00:00-03:00`,
            payment_method: form.payment_method,
          };
      const r = await fetch(`/api/admin/financeiro/${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setOpen(false);
      setForm({ ...form, name: "", amount: "" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro de conexão");
    } finally {
      setBusy(false);
    }
  }
  async function pay(id: number) {
    if (!window.confirm("Marcar esta despesa como paga hoje?")) return;
    setBusy(true);
    try {
      const r = await fetch("/api/admin/financeiro/despesas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, payment_method: form.payment_method }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      await load();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Não foi possível registrar o pagamento.",
      );
    } finally {
      setBusy(false);
    }
  }
  const visible = rows.filter(
    (r) =>
      `${r.name || r.source || ""} ${r.client_name || ""} ${r.service_name || ""}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (!filter || (expense ? r.status : r.payment_method) === filter),
  );
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap justify-between gap-4">
        <div>
          <p className="text-xs text-blue-700 uppercase tracking-widest font-semibold">
            Financeiro
          </p>
          <h1 className="text-2xl font-bold mt-1">
            {expense ? "Despesas" : "Receitas"}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {expense
              ? "Registre seus custos e acompanhe os pagamentos."
              : "Atendimentos concluídos entram automaticamente. Cadastre aqui outras receitas."}
          </p>
        </div>
        <button className="admin-primary" onClick={() => setOpen(!open)}>
          {expense ? "+ Nova despesa" : "+ Outra receita"}
        </button>
      </header>
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 text-red-800 p-3">
          {error}
        </p>
      )}
      {open && (
        <form
          onSubmit={save}
          className="rounded-2xl bg-white border p-5 space-y-4"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <label className="admin-label">
              {expense ? "Descrição" : "Origem da receita"}
              <input
                required
                maxLength={150}
                className="admin-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label className="admin-label">
              Valor (R$)
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                className="admin-input"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </label>
            <label className="admin-label">
              {expense ? "Vencimento" : "Recebimento"}
              <input
                required
                type="date"
                className="admin-input"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </label>
            <label className="admin-label">
              Forma de pagamento
              <select
                className="admin-input"
                value={form.payment_method}
                onChange={(e) =>
                  setForm({ ...form, payment_method: e.target.value })
                }
              >
                {Object.entries(methods).map(([v, label]) => (
                  <option key={v} value={v}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button disabled={busy} className="admin-primary">
            {busy ? "Salvando…" : "Salvar lançamento"}
          </button>
          {expense && (
            <p className="text-xs text-gray-500">
              A despesa é criada como pendente. Registre o pagamento quando ela
              for quitada.
            </p>
          )}
        </form>
      )}
      <div className="flex flex-wrap gap-3">
        <input
          aria-label="Buscar lançamento"
          placeholder="Buscar lançamento…"
          className="admin-input flex-1 min-w-40"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label="Filtrar lançamentos"
          className="admin-input sm:w-52"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">Todos</option>
          {Object.entries(
            expense ? { pending: "Pendente", paid: "Paga" } : methods,
          ).map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
      </div>
      {expense && (
        <label className="admin-label">
          Forma de pagamento ao quitar
          <select
            className="admin-input max-w-xs"
            value={form.payment_method}
            onChange={(e) =>
              setForm({ ...form, payment_method: e.target.value })
            }
          >
            {Object.entries(methods).map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="rounded-2xl bg-white border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="p-4">Data</th>
              <th className="p-4">Descrição</th>
              <th className="p-4">Valor</th>
              <th className="p-4">{expense ? "Situação" : "Pagamento"}</th>
              {expense && <th className="p-4">Ação</th>}
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-4 whitespace-nowrap">
                  {String(expense ? r.due_date : r.received_at)
                    .slice(0, 10)
                    .split("-")
                    .reverse()
                    .join("/")}
                </td>
                <td className="p-4">
                  {r.name || r.source}
                  {r.client_name && (
                    <p className="text-xs text-gray-500 mt-1">
                      {r.client_name} · {r.service_name}
                    </p>
                  )}
                </td>
                <td className="p-4 font-semibold whitespace-nowrap">
                  {money(r.amount_cents)}
                </td>
                <td className="p-4">
                  {expense
                    ? r.status === "paid"
                      ? "Paga"
                      : String(r.due_date).slice(0, 10) < localDate()
                        ? "Vencida"
                        : "Pendente"
                    : methods[r.payment_method] || r.payment_method}
                </td>
                {expense && (
                  <td className="p-4">
                    {r.status !== "paid" && (
                      <button
                        className="text-emerald-700 font-semibold"
                        disabled={busy}
                        onClick={() => pay(r.id)}
                      >
                        Marcar paga
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {!visible.length && (
          <p className="p-8 text-center text-gray-500">
            Nenhum lançamento neste filtro.
          </p>
        )}
      </div>
      <p className="text-sm text-gray-500">
        Total dos lançamentos exibidos:{" "}
        <strong>
          {money(visible.reduce((n, r) => n + Number(r.amount_cents), 0))}
        </strong>
      </p>
    </div>
  );
}
