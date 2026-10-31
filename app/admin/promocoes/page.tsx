"use client";
import { useEffect, useState } from "react";
import { localDate } from "@/lib/availability";
export default function Promotions() {
  const [services, setServices] = useState<any[]>([]),
    [promos, setPromos] = useState<any[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    service_id: "",
    title: "",
    price: "",
    valid_from: localDate(),
    valid_until: localDate(),
    is_active: true,
  });
  async function load() {
    try {
      const results = await Promise.all(
        ["/api/admin/services", "/api/admin/promotions"].map(async (url) => {
          const r = await fetch(url);
          if (!r.ok) throw new Error("Erro ao carregar promoções");
          return r.json();
        }),
      );
      setServices(results[0].services);
      setPromos(results[1].promotions);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro de conexão");
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          service_id: Number(form.service_id),
          price_cents: Math.round(Number(form.price) * 100),
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setError("Promoção salva.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível salvar");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-blue-700 font-semibold">
          Mais motivos para voltar
        </p>
        <h1 className="text-2xl font-bold mt-1">Promoções</h1>
        <p className="text-sm text-gray-500 mt-2">
          Defina um preço especial por serviço e período. Vale para a data do
          atendimento; o preço reservado fica registrado.
        </p>
      </header>
      {error && (
        <p role="status" className="rounded-xl bg-blue-50 text-blue-900 p-3">
          {error}
        </p>
      )}
      <form
        onSubmit={save}
        className="rounded-2xl bg-white border p-5 space-y-4"
      >
        <h2 className="font-semibold">Criar ou atualizar oferta</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="admin-label">
            Serviço
            <select
              required
              className="admin-input"
              value={form.service_id}
              onChange={(e) => setForm({ ...form, service_id: e.target.value })}
            >
              <option value="">Selecione</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · R$ {(s.price_cents / 100).toFixed(2)}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-label">
            Nome da oferta
            <input
              required
              maxLength={100}
              className="admin-input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </label>
          <label className="admin-label">
            Preço especial (R$)
            <input
              required
              type="number"
              min="0"
              step="0.01"
              className="admin-input"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </label>
          <label className="admin-label">
            Ativa
            <select
              className="admin-input"
              value={String(form.is_active)}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.value === "true" })
              }
            >
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </select>
          </label>
          <label className="admin-label">
            Atendimentos a partir de
            <input
              required
              type="date"
              className="admin-input"
              value={form.valid_from}
              onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
            />
          </label>
          <label className="admin-label">
            Até
            <input
              required
              type="date"
              min={form.valid_from}
              className="admin-input"
              value={form.valid_until}
              onChange={(e) =>
                setForm({ ...form, valid_until: e.target.value })
              }
            />
          </label>
        </div>
        <button className="admin-primary" disabled={busy}>
          {busy ? "Salvando…" : "Salvar oferta"}
        </button>
        <p className="text-xs text-gray-500">
          Uma oferta por serviço. Salvar substitui a oferta anterior desse
          serviço.
        </p>
      </form>
      <div className="grid md:grid-cols-2 gap-4">
        {promos.map((p) => (
          <article
            key={p.service_id}
            className="rounded-2xl bg-white border p-5"
          >
            <p className="text-xs text-blue-700">
              {p.is_active ? "Habilitada" : "Desativada"}
            </p>
            <h2 className="font-bold mt-2">{p.title}</h2>
            <p className="text-sm text-gray-500">{p.service_name}</p>
            <strong className="text-2xl block my-3">
              R$ {(p.price_cents / 100).toFixed(2)}
            </strong>
            <p className="text-xs text-gray-500">
              {String(p.valid_from).slice(0, 10)} a{" "}
              {String(p.valid_until).slice(0, 10)}
            </p>
            <button
              className="admin-secondary mt-4"
              onClick={() =>
                setForm({
                  service_id: String(p.service_id),
                  title: p.title,
                  price: String(p.price_cents / 100),
                  valid_from: String(p.valid_from).slice(0, 10),
                  valid_until: String(p.valid_until).slice(0, 10),
                  is_active: p.is_active,
                })
              }
            >
              Editar oferta
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
