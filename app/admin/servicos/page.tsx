"use client";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/session";
type Service = {
  id: number;
  name: string;
  description: string;
  price_cents: number;
  duration_minutes: number;
  image_url: string | null;
  is_active: boolean;
  is_featured: boolean;
};
const empty = {
  name: "",
  description: "",
  price: "",
  duration_minutes: 30,
  image_url: "",
  is_active: true,
  is_featured: false,
};
export default function ServicosPage() {
  const { user, loading } = useSession();
  const [services, setServices] = useState<Service[]>([]),
    [form, setForm] = useState(empty),
    [editing, setEditing] = useState<number | null>(null),
    [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  async function load() {
    try {
      const r = await fetch("/api/admin/services");
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setServices(d.services);
    } catch {
      setMessage("Não foi possível carregar os serviços.");
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const r = await fetch("/api/admin/services", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          id: editing,
          price_cents: Math.round(Number(form.price) * 100),
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setOpen(false);
      setForm(empty);
      setEditing(null);
      setMessage(
        "Serviço salvo. O catálogo e o agendamento já usam estes dados.",
      );
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erro de conexão");
    } finally {
      setBusy(false);
    }
  }
  async function toggle(s: Service) {
    setBusy(true);
    try {
      const r = await fetch("/api/admin/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...s, is_active: !s.is_active }),
      });
      if (!r.ok) throw new Error();
      await load();
    } catch {
      setMessage("Não foi possível alterar o serviço.");
    } finally {
      setBusy(false);
    }
  }
  if (loading || !user) return null;
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap gap-4 justify-between items-center">
        <div>
          <p className="text-xs tracking-widest uppercase text-blue-700 font-semibold">
            Seu catálogo
          </p>
          <h1 className="text-2xl font-bold mt-1">Serviços e preços</h1>
          <p className="text-sm text-gray-500 mt-1">
            Do seu painel direto para o cliente.
          </p>
        </div>
        <button
          className="admin-primary"
          onClick={() => {
            setEditing(null);
            setForm(empty);
            setOpen(true);
          }}
        >
          + Novo serviço
        </button>
      </header>
      {message && (
        <p
          role="status"
          className="rounded-xl bg-blue-50 text-blue-900 p-4 text-sm"
        >
          {message}
        </p>
      )}
      {open && (
        <form
          onSubmit={save}
          className="rounded-2xl bg-white border p-6 space-y-4"
        >
          <h2 className="font-bold text-lg">
            {editing ? "Editar serviço" : "Novo serviço"}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="admin-label">
              Nome
              <input
                required
                maxLength={100}
                className="admin-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label className="admin-label">
              Preço (R$)
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
              Duração (minutos)
              <input
                required
                type="number"
                min="5"
                max="480"
                className="admin-input"
                value={form.duration_minutes}
                onChange={(e) =>
                  setForm({ ...form, duration_minutes: Number(e.target.value) })
                }
              />
            </label>
            <label className="admin-label">
              Link da foto (opcional)
              <input
                type="url"
                placeholder="https://…"
                className="admin-input"
                value={form.image_url}
                onChange={(e) =>
                  setForm({ ...form, image_url: e.target.value })
                }
              />
            </label>
          </div>
          <label className="admin-label">
            Descrição
            <textarea
              maxLength={500}
              className="admin-input"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>
          <p className="text-xs text-gray-500">
            Sem foto, o serviço aparece em um cartão organizado, sem espaço
            vazio.
          </p>
          <label className="flex gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) =>
                setForm({ ...form, is_featured: e.target.checked })
              }
            />
            Destacar no catálogo
          </label>
          <div className="flex gap-3">
            <button className="admin-primary" disabled={busy}>
              {busy ? "Salvando…" : "Salvar serviço"}
            </button>
            <button
              type="button"
              className="admin-secondary"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {services.map((s) => (
          <article
            key={s.id}
            className={`rounded-2xl bg-white border overflow-hidden ${!s.is_active ? "opacity-60" : ""}`}
          >
            {s.image_url && (
              <img
                src={s.image_url}
                alt={s.name}
                className="w-full h-44 object-cover"
              />
            )}
            <div className="p-5">
              <div className="flex gap-3 justify-between">
                <h2 className="font-bold">{s.name}</h2>
                <strong className="whitespace-nowrap text-blue-900">
                  {(s.price_cents / 100).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </strong>
              </div>
              <p className="text-sm text-gray-500 mt-2">{s.description}</p>
              <p className="text-xs text-gray-500 mt-4">
                {s.duration_minutes} min ·{" "}
                {s.is_active ? "Ativo" : "Desativado"}
                {s.is_featured ? " · Destaque" : ""}
              </p>
              <div className="flex gap-2 mt-5">
                <button
                  className="admin-secondary flex-1"
                  onClick={() => {
                    setEditing(s.id);
                    setForm({
                      ...s,
                      description: s.description || "",
                      image_url: s.image_url || "",
                      price: String(s.price_cents / 100),
                    });
                    setOpen(true);
                  }}
                >
                  Editar
                </button>
                <button
                  disabled={busy}
                  className="admin-secondary flex-1"
                  onClick={() => toggle(s)}
                >
                  {s.is_active ? "Desativar" : "Ativar"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!services.length && (
        <p className="text-sm text-gray-500">
          Cadastre o primeiro serviço para começar.
        </p>
      )}
    </div>
  );
}
