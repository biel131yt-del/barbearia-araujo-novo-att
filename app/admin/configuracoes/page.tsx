"use client";
import { useEffect, useState } from "react";
import PushSubscription from "@/components/PushSubscription";
const defaults: Record<string, string> = {
  nome_barbearia: "Barbearia Araújo",
  endereco: "Manoel Olavo da Rosa, 1044",
  telefone_whatsapp: "5551996824286",
  email_contato: "",
  theme_mode: "auto",
  primary_color: "#1e3a8a",
  accent_color: "#dc2626",
  notify_new_appointment: "true",
  notify_confirmed: "true",
  notify_cancelled: "true",
};
export default function Settings() {
  const [form, setForm] = useState(defaults),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    fetch("/api/admin/configuracoes")
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setForm({
          ...defaults,
          ...Object.fromEntries(d.settings.map((x: any) => [x.key, x.value])),
        });
      })
      .catch((e) => setMessage(e.message));
  }, []);
  async function persist(values: Record<string, string>) {
    const r = await fetch("/api/admin/configuracoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: values }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error);
    try {
      localStorage.setItem("barbearia.theme.v1", "auto");
    } catch {}
    window.dispatchEvent(new Event("barbearia-settings"));
    window.dispatchEvent(new Event("barbearia-theme-reset"));
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await persist(form);
      setMessage("Preferências salvas e aplicadas.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Falha ao salvar");
    } finally {
      setBusy(false);
    }
  }
  function exportSettings() {
    const blob = new Blob(
      [
        JSON.stringify(
          { format: "barbearia-preferences-v1", settings: form },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "preferencias-barbearia.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  async function importSettings(file: File | undefined) {
    if (!file) return;
    setMessage("");
    try {
      if (file.size > 30000) throw new Error("Arquivo muito grande.");
      const d = JSON.parse(await file.text());
      if (
        d.format !== "barbearia-preferences-v1" ||
        !d.settings ||
        typeof d.settings !== "object"
      )
        throw new Error("Arquivo de preferências inválido.");
      const values: Record<string, string> = {};
      for (const key of Object.keys(defaults)) {
        if (typeof d.settings[key] === "string") values[key] = d.settings[key];
      }
      if (
        !confirm(
          "Importar estas preferências? As configurações atuais serão substituídas; clientes e agendamentos não mudam.",
        )
      )
        return;
      setBusy(true);
      await persist(values);
      setForm({ ...form, ...values });
      setMessage("Preferências importadas.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Não foi possível importar");
    } finally {
      setBusy(false);
    }
  }
  async function password(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const el = e.currentTarget;
    const d = new FormData(el);
    if (d.get("new_password") !== d.get("confirm_password")) {
      setMessage("As senhas novas devem coincidir.");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: d.get("current_password"),
          new_password: d.get("new_password"),
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      el.reset();
      setMessage("Senha alterada. As outras sessões foram encerradas.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Não foi possível alterar");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configurações</h1>
      {message && (
        <p role="status" className="rounded-xl bg-blue-50 p-4 text-blue-900">
          {message}
        </p>
      )}
      <form onSubmit={save} className="space-y-6">
        <section className="rounded-2xl border bg-white p-5 space-y-4">
          <h2 className="font-bold text-lg">Dados da barbearia</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              ["nome_barbearia", "Nome da barbearia"],
              ["endereco", "Endereço"],
              ["telefone_whatsapp", "WhatsApp com DDD"],
              ["email_contato", "E-mail de contato"],
            ].map(([key, label]) => (
              <label key={key} className="admin-label">
                {label}
                <input
                  className="admin-input"
                  maxLength={300}
                  type={key === "email_contato" ? "email" : "text"}
                  required={
                    key === "telefone_whatsapp" || key === "nome_barbearia"
                  }
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </label>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border bg-white p-5 space-y-4">
          <h2 className="text-lg font-bold">Aparência</h2>
          <label className="admin-label">
            Tema padrão
            <select
              className="admin-input max-w-xs"
              value={form.theme_mode}
              onChange={(e) => setForm({ ...form, theme_mode: e.target.value })}
            >
              <option value="auto">Padrão: site escuro, painel claro</option>
              <option value="system">Seguir o aparelho</option>
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
            </select>
          </label>
          <p className="text-sm text-gray-500">
            Cada pessoa também pode alternar o tema pelo botão de sol/lua. As
            cores abaixo são compartilhadas pelo site e painel.
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              ["Clássico", "#1e3a8a", "#dc2626"],
              ["Esmeralda", "#065f46", "#059669"],
              ["Violeta", "#5b21b6", "#7c3aed"],
              ["Âmbar", "#92400e", "#d97706"],
            ].map(([name, primary, accent]) => (
              <button
                key={name}
                type="button"
                className="admin-secondary"
                onClick={() =>
                  setForm({
                    ...form,
                    primary_color: primary,
                    accent_color: accent,
                  })
                }
              >
                <span
                  className="inline-block w-3 h-3 rounded-full mr-2"
                  style={{ background: primary }}
                />
                {name}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-5">
            {[
              ["primary_color", "Cor principal do painel"],
              ["accent_color", "Destaque do site e agendamento"],
            ].map(([key, label]) => (
              <label key={key} className="admin-label">
                {label}
                <div className="flex gap-2 mt-2">
                  <input
                    aria-label={label}
                    type="color"
                    value={form[key]}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                  />
                  <span className="text-sm text-gray-500">{form[key]}</span>
                </div>
              </label>
            ))}
          </div>
          <div className="rounded-xl border p-4 flex gap-3">
            <span
              className="rounded-lg px-4 py-2 text-white"
              style={{ background: form.primary_color }}
            >
              Principal
            </span>
            <span
              className="rounded-lg px-4 py-2 text-white"
              style={{ background: form.accent_color }}
            >
              Destaque
            </span>
          </div>
        </section>
        <section className="rounded-2xl border bg-white p-5 space-y-3">
          <h2 className="font-bold">Alertas do dono</h2>
          {[
            ["notify_new_appointment", "Novos agendamentos"],
            ["notify_confirmed", "Confirmações"],
            ["notify_cancelled", "Cancelamentos"],
          ].map(([key, label]) => (
            <label key={key} className="flex gap-3 items-center text-sm">
              <input
                type="checkbox"
                checked={form[key] !== "false"}
                onChange={(e) =>
                  setForm({ ...form, [key]: String(e.target.checked) })
                }
              />
              {label}
            </label>
          ))}
        </section>
        <button className="admin-primary" disabled={busy}>
          {busy ? "Salvando…" : "Salvar configurações"}
        </button>
      </form>
      <PushSubscription />
      <section className="rounded-2xl border bg-white p-5">
        <h2 className="font-bold text-lg mb-4">Alterar senha</h2>
        <form onSubmit={password} className="space-y-3 max-w-md">
          {[
            ["current_password", "Senha atual"],
            ["new_password", "Nova senha"],
            ["confirm_password", "Confirmar nova senha"],
          ].map(([key, label]) => (
            <label key={key} className="admin-label">
              {label}
              <input
                className="admin-input"
                type="password"
                required
                minLength={key === "current_password" ? 1 : 8}
                maxLength={128}
                autoComplete={
                  key === "current_password"
                    ? "current-password"
                    : "new-password"
                }
                name={key}
              />
            </label>
          ))}
          <button disabled={busy} className="admin-primary">
            Alterar senha
          </button>
        </form>
      </section>
      <section className="rounded-2xl border bg-white p-5 space-y-4">
        <h2 className="text-lg font-bold">Cópia das preferências</h2>
        <p className="text-sm text-gray-500">
          Exporta e importa cores, tema, dados da barbearia e preferências de
          alertas. Não inclui clientes, senhas, financeiro ou agendamentos. A
          recuperação completa dos dados deve usar o backup do banco.
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="admin-secondary" onClick={exportSettings}>
            Exportar preferências
          </button>
          <label className="admin-secondary cursor-pointer">
            Importar preferências
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(e) => {
                void importSettings(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </section>
    </div>
  );
}
