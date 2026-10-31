"use client";
import { useEffect, useState } from "react";
const money = (n: number) =>
  (n / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export default function AdminCatalog({
  kind,
}: {
  kind: "products" | "barbers";
}) {
  const stock = kind === "products";
  const url = stock ? "/api/admin/estoque" : "/api/admin/barbers";
  const [rows, setRows] = useState<any[]>([]),
    [form, setForm] = useState<any>(null),
    [search, setSearch] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [moving, setMoving] = useState<any>(null),
    [movements, setMovements] = useState<any[]>([]),
    [movement, setMovement] = useState({
      type: "entry",
      quantity: 1,
      reason: "",
    });
  async function load() {
    try {
      const r = await fetch(url);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setRows(d[kind]);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Falha ao carregar");
    }
  }
  useEffect(() => {
    load();
  }, [kind]);
  function edit(row?: any) {
    setMoving(null);
    setForm(
      stock
        ? {
            id: row?.id,
            name: row?.name || "",
            category: row?.category || "",
            sku: row?.sku || "",
            supplier: row?.supplier || "",
            cost: String((row?.cost_cents || 0) / 100),
            price: String((row?.price_cents || 0) / 100),
            stock_quantity: row?.stock_quantity || 0,
            min_stock: row?.min_stock || 0,
            is_active: row?.is_active !== false,
            is_for_sale: row?.is_for_sale !== false,
          }
        : {
            id: row?.id,
            name: row?.name || "",
            phone: row?.phone || "",
            email: row?.email || "",
            commission_type: row?.commission_type || "none",
            commission_value: Number(row?.commission_value || 0),
            is_active: row?.is_active !== false,
          },
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const b = stock
        ? {
            ...form,
            cost_cents: Math.round(Number(form.cost) * 100),
            price_cents: Math.round(Number(form.price) * 100),
            stock_quantity: Number(form.stock_quantity),
            min_stock: Number(form.min_stock),
          }
        : { ...form, commission_value: Number(form.commission_value) };
      const r = await fetch(url, {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(b),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setForm(null);
      setMessage("Cadastro salvo.");
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Falha de conexão");
    } finally {
      setBusy(false);
    }
  }
  async function openMovement(row: any) {
    setForm(null);
    setMoving(row);
    setMovement({ type: "entry", quantity: 1, reason: "" });
    setMovements([]);
    try {
      const r = await fetch(url + "?product_id=" + row.id);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setMovements(d.movements);
    } catch {
      setMessage("Não foi possível carregar as movimentações.");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function move(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: moving.id,
          action: "movement",
          ...movement,
          quantity: Number(movement.quantity),
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      await load();
      await openMovement(d.product);
      setMessage("Movimentação registrada.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Falha ao movimentar");
    } finally {
      setBusy(false);
    }
  }
  const fields = stock
    ? [
        ["name", "Nome do produto", "text"],
        ["category", "Categoria", "text"],
        ["sku", "Código/SKU", "text"],
        ["supplier", "Fornecedor", "text"],
        ["cost", "Custo (R$)", "number"],
        ["price", "Venda (R$)", "number"],
        ...(!form?.id ? [["stock_quantity", "Estoque inicial", "number"]] : []),
        ["min_stock", "Estoque mínimo", "number"],
      ]
    : [
        ["name", "Nome", "text"],
        ["phone", "Telefone", "tel"],
        ["email", "E-mail", "email"],
        ["commission_value", "Comissão (% ou R$ conforme tipo)", "number"],
      ];
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {stock ? "Estoque e produtos" : "Equipe"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {stock
              ? "Cadastre, edite e acompanhe entradas e saídas."
              : "Cadastre e edite os profissionais. A agenda continua de uma cadeira por vez."}
          </p>
        </div>
        <button className="admin-primary" onClick={() => edit()}>
          {stock ? "+ Novo produto" : "+ Novo barbeiro"}
        </button>
      </header>
      {message && (
        <p role="status" className="rounded-xl bg-blue-50 text-blue-900 p-3">
          {message}
        </p>
      )}
      {form && (
        <form
          onSubmit={save}
          className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4"
        >
          <h2 className="font-bold">
            {form.id ? "Editar cadastro" : "Novo cadastro"}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {fields.map(([key, label, type]) => (
              <label key={key} className="admin-label">
                {label}
                <input
                  required={key === "name" || type === "number"}
                  className="admin-input"
                  type={type}
                  min={type === "number" ? 0 : undefined}
                  step={
                    ["cost", "price", "commission_value"].includes(key)
                      ? ".01"
                      : type === "number"
                        ? "1"
                        : undefined
                  }
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </label>
            ))}
            {!stock && (
              <label className="admin-label">
                Tipo de comissão
                <select
                  className="admin-input"
                  value={form.commission_type}
                  onChange={(e) =>
                    setForm({ ...form, commission_type: e.target.value })
                  }
                >
                  <option value="none">Sem comissão</option>
                  <option value="percent">Percentual</option>
                  <option value="fixed">Valor fixo</option>
                </select>
              </label>
            )}
          </div>
          <label className="flex gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.checked })
              }
            />
            Cadastro ativo
          </label>
          {stock && (
            <label className="flex gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_for_sale}
                onChange={(e) =>
                  setForm({ ...form, is_for_sale: e.target.checked })
                }
              />
              Disponível para venda
            </label>
          )}
          <div className="flex gap-3">
            <button disabled={busy} className="admin-primary">
              {busy ? "Salvando…" : "Salvar"}
            </button>
            <button
              type="button"
              className="admin-secondary"
              onClick={() => setForm(null)}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
      {moving && (
        <section className="bg-white border rounded-2xl p-5 space-y-4">
          <div className="flex justify-between">
            <h2 className="font-bold">
              Movimentar: {moving.name} · atual {moving.stock_quantity}
            </h2>
            <button className="admin-secondary" onClick={() => setMoving(null)}>
              Fechar
            </button>
          </div>
          <form onSubmit={move} className="grid sm:grid-cols-2 gap-3">
            <label className="admin-label">
              Movimento
              <select
                className="admin-input"
                value={movement.type}
                onChange={(e) =>
                  setMovement({ ...movement, type: e.target.value })
                }
              >
                <option value="entry">Entrada</option>
                <option value="exit">Saída</option>
              </select>
            </label>
            <label className="admin-label">
              Quantidade
              <input
                required
                min="1"
                step="1"
                type="number"
                className="admin-input"
                value={movement.quantity}
                onChange={(e) =>
                  setMovement({ ...movement, quantity: Number(e.target.value) })
                }
              />
            </label>
            <label className="admin-label">
              Motivo
              <input
                required
                maxLength={200}
                className="admin-input"
                value={movement.reason}
                onChange={(e) =>
                  setMovement({ ...movement, reason: e.target.value })
                }
              />
            </label>
            <button className="admin-primary self-end" disabled={busy}>
              Registrar movimento
            </button>
          </form>
          <h3 className="font-semibold text-sm">Últimas movimentações</h3>
          {movements.map((m) => (
            <p key={m.id} className="text-sm text-gray-500">
              {m.type === "entry" ? "Entrada" : "Saída"} · {m.quantity} ·{" "}
              {m.reason} · {new Date(m.created_at).toLocaleString("pt-BR")}
            </p>
          ))}
        </section>
      )}
      <input
        className="admin-input"
        aria-label="Buscar cadastro"
        placeholder={
          stock
            ? "Buscar produto, código ou categoria…"
            : "Buscar nome ou telefone…"
        }
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {rows
          .filter((r) =>
            `${r.name} ${r.sku || ""} ${r.category || ""} ${r.phone || ""}`
              .toLowerCase()
              .includes(search.toLowerCase()),
          )
          .map((r) => (
            <article
              key={r.id}
              className="rounded-2xl bg-white border border-gray-200 p-5"
            >
              <h2 className="font-bold">{r.name}</h2>
              <p className="text-xs text-gray-500 mt-1">
                {r.is_active ? "Ativo" : "Inativo"} ·{" "}
                {stock
                  ? r.category || "Sem categoria"
                  : r.phone || "Sem telefone"}
              </p>
              {stock ? (
                <>
                  <p
                    className={`text-2xl font-bold my-4 ${r.stock_quantity <= r.min_stock ? "text-rose-700" : ""}`}
                  >
                    {r.stock_quantity} unidades
                  </p>
                  <p className="text-xs text-gray-500">
                    Mínimo: {r.min_stock}{" "}
                    {r.stock_quantity <= r.min_stock ? "· Repor estoque" : ""}
                  </p>
                  <p className="text-sm mt-3">
                    Custo {money(r.cost_cents)} · Venda {money(r.price_cents)}
                  </p>
                </>
              ) : (
                <p className="text-sm my-4">
                  {r.commission_type === "none"
                    ? "Sem comissão"
                    : `Comissão: ${r.commission_value} ${r.commission_type === "percent" ? "%" : "R$"}`}
                </p>
              )}
              <div className="flex gap-2 mt-4">
                <button className="admin-secondary" onClick={() => edit(r)}>
                  Editar
                </button>
                {stock && (
                  <button
                    className="admin-secondary"
                    onClick={() => openMovement(r)}
                  >
                    Movimentar estoque
                  </button>
                )}
              </div>
            </article>
          ))}
      </div>
      {!rows.length && <p className="text-gray-500">Nenhum cadastro ainda.</p>}
    </div>
  );
}
