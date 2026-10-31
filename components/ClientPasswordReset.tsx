"use client";
import { useState } from "react";
export default function ClientPasswordReset({
  id,
  name,
}: {
  id: number;
  name: string;
}) {
  const [open, setOpen] = useState(false),
    [password, setPassword] = useState(""),
    [show, setShow] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/clients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Não foi possível redefinir.");
      setPassword("");
      setShow(false);
      setOpen(false);
      setMessage(
        "Senha redefinida. Informe a nova senha ao cliente; ele deverá entrar novamente.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível redefinir.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mt-4 border-t pt-4">
      <button
        type="button"
        className="admin-secondary"
        aria-expanded={open}
        onClick={() => {
          setOpen(!open);
          setPassword("");
          setShow(false);
          setMessage("");
          setError("");
        }}
        disabled={busy}
      >
        {open ? "Cancelar" : "Redefinir senha"}
      </button>
      {open && (
        <form onSubmit={save} className="mt-3 space-y-3">
          <p className="text-xs text-gray-500">
            Confirme a identidade de {name} antes de alterar o acesso. A senha
            atual não pode ser consultada.
          </p>
          <label className="admin-label">
            Nova senha
            <input
              type={show ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={128}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-input"
            />
          </label>
          <button
            type="button"
            className="text-sm underline"
            aria-pressed={show}
            onClick={() => setShow(!show)}
          >
            {show ? "Ocultar senha" : "Mostrar senha"}
          </button>
          <p className="text-xs text-gray-500">
            Use pelo menos 8 caracteres. Esta alteração encerra os acessos
            atuais do cliente.
          </p>
          <button className="admin-primary block" disabled={busy}>
            {busy ? "Salvando…" : "Salvar nova senha"}
          </button>
        </form>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-700 mt-3">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="text-sm text-emerald-700 mt-3">
          {message}
        </p>
      )}
    </div>
  );
}
