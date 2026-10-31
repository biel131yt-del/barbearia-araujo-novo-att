"use client";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/session";
type Client = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  total_appointments: number;
  total_spent_cents: number;
  last_appointment: string | null;
  days_since_visit: number | null;
};
export default function ClientesPage() {
  const { user, loading } = useSession();
  const [clients, setClients] = useState<Client[]>([]),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all"),
    [error, setError] = useState(""),
    [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [message, setMessage] = useState(
    "Olá, {nome}! Tudo bem? Sentimos sua falta aqui na Barbearia Araújo. Que tal reservar um horário para renovar o visual? {link}",
  );
  async function load() {
    try {
      const r = await fetch("/api/admin/clients");
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setClients(d.clients);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Não foi possível carregar os clientes.",
      );
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setOpen(false);
      setForm({ name: "", phone: "", email: "" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally {
      setBusy(false);
    }
  }
  function link(c: Client) {
    let phone = c.phone.replace(/\D/g, "");
    if (phone.length === 10 || phone.length === 11) phone = `55${phone}`;
    const text = message
      .replaceAll("{nome}", c.name.split(" ")[0])
      .replaceAll("{dias}", String(c.days_since_visit ?? 0))
      .replaceAll("{link}", `${window.location.origin}/agendar`);
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }
  const visible = clients.filter(
    (c) =>
      `${c.name} ${c.phone}`.toLowerCase().includes(search.toLowerCase()) &&
      (filter === "all" ||
        (filter === "regular" && c.total_appointments >= 3) ||
        (filter === "return" && (c.days_since_visit ?? 0) >= 30) ||
        (filter === "new" && c.total_appointments === 0)),
  );
  if (loading || !user) return null;
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap justify-between gap-4">
        <div>
          <p className="text-xs text-blue-700 tracking-widest uppercase font-semibold">
            Relacionamento
          </p>
          <h1 className="text-2xl font-bold mt-1">Clientes e retorno</h1>
          <p className="text-sm text-gray-500 mt-1">
            Conheça quem volta e convide quem está com saudade.
          </p>
        </div>
        <button className="admin-primary" onClick={() => setOpen(!open)}>
          + Novo cliente
        </button>
      </header>
      {error && (
        <p role="alert" className="bg-red-50 text-red-800 rounded-xl p-3">
          {error}
        </p>
      )}
      <div className="grid grid-cols-3 gap-3">
        {[
          ["Cadastrados", clients.length],
          [
            "Recorrentes",
            clients.filter((c) => c.total_appointments >= 3).length,
          ],
          [
            "Sem voltar há 30 dias",
            clients.filter((c) => (c.days_since_visit ?? 0) >= 30).length,
          ],
        ].map(([title, n]) => (
          <div key={title} className="rounded-2xl bg-white border p-4">
            <p className="text-xs text-gray-500">{title}</p>
            <strong className="text-2xl block mt-2">{n}</strong>
          </div>
        ))}
      </div>
      {open && (
        <form
          onSubmit={add}
          className="bg-white border rounded-2xl p-5 space-y-4"
        >
          <h2 className="font-semibold">Cadastrar cliente</h2>
          <div className="grid md:grid-cols-3 gap-3">
            {(["name", "phone", "email"] as const).map((key, i) => (
              <label key={key} className="admin-label">
                {["Nome", "WhatsApp", "E-mail (opcional)"][i]}
                <input
                  required={key !== "email"}
                  type={
                    key === "email" ? "email" : key === "phone" ? "tel" : "text"
                  }
                  className="admin-input"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Cadastro interno para relacionamento. Para acesso ao aplicativo, o
            cliente deve criar a própria conta.
          </p>
          <button className="admin-primary" disabled={busy}>
            {busy ? "Salvando…" : "Salvar cliente"}
          </button>
        </form>
      )}
      <section className="bg-blue-950 text-white rounded-2xl p-5 space-y-3">
        <h2 className="font-semibold">Um convite para voltar</h2>
        <p className="text-sm text-blue-200">
          Personalize a mensagem. Ao tocar em WhatsApp, você revisa e envia a
          conversa por lá.
        </p>
        <label className="block text-sm">
          Mensagem
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="block w-full mt-2 rounded-xl bg-white/10 border border-white/20 p-3 text-white"
            rows={3}
          />
        </label>
        <p className="text-xs text-blue-200">
          Use {"{nome}"}, {"{dias}"} e {"{link}"}. Nenhuma mensagem é enviada
          automaticamente.
        </p>
      </section>
      <div className="flex flex-wrap gap-3">
        <input
          aria-label="Buscar cliente"
          placeholder="Buscar nome ou telefone…"
          className="admin-input flex-1 min-w-48"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label="Filtrar clientes"
          className="admin-input sm:w-56"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Todos os clientes</option>
          <option value="regular">Recorrentes (3+ visitas)</option>
          <option value="return">Sem voltar há 30 dias</option>
          <option value="new">Sem atendimento concluído</option>
        </select>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        {visible.map((c) => (
          <article key={c.id} className="bg-white border rounded-2xl p-5">
            <div className="flex gap-3 items-center">
              <span className="w-11 h-11 flex items-center justify-center rounded-full bg-blue-50 text-blue-900 font-bold">
                {c.name.slice(0, 1).toUpperCase()}
              </span>
              <div>
                <h2 className="font-semibold">{c.name}</h2>
                <p className="text-xs text-gray-500">{c.phone}</p>
              </div>
              {c.total_appointments >= 3 && (
                <span className="ml-auto text-xs rounded-full bg-emerald-50 text-emerald-700 px-2 py-1">
                  Recorrente
                </span>
              )}
            </div>
            <dl className="grid grid-cols-3 gap-2 mt-5 text-sm">
              <div>
                <dt className="text-xs text-gray-500">Atendimentos</dt>
                <dd className="font-semibold mt-1">{c.total_appointments}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Total recebido</dt>
                <dd className="font-semibold mt-1">
                  {(c.total_spent_cents / 100).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Última visita</dt>
                <dd className="font-semibold mt-1">
                  {c.last_appointment
                    ? new Date(
                        `${c.last_appointment}T12:00:00`,
                      ).toLocaleDateString("pt-BR")
                    : "Ainda não veio"}
                </dd>
              </div>
            </dl>
            <a
              href={link(c)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm font-semibold text-emerald-700 mt-5"
            >
              Conversar no WhatsApp ↗
            </a>
          </article>
        ))}
      </div>
      {!visible.length && (
        <p className="p-8 text-center text-gray-500">
          Nenhum cliente neste filtro.
        </p>
      )}
    </div>
  );
}
