"use client";
import { useEffect, useState } from "react";
const defaults = {
  nome_barbearia: "Barbearia Araújo",
  endereco: "Manoel Olavo da Rosa, 1044",
  telefone_whatsapp: "5551996824286",
  email_contato: "",
};
let cached: typeof defaults | null = null;
let pending: Promise<typeof defaults> | null = null;
function read() {
  if (!pending)
    pending = fetch("/api/settings")
      .then(async (r) => {
        if (!r.ok) throw new Error();
        const d = await r.json();
        cached = { ...defaults, ...d.settings };
        return cached!;
      })
      .finally(() => {
        pending = null;
      });
  return pending;
}
export function usePublicSettings() {
  const [settings, setSettings] = useState(cached || defaults);
  useEffect(() => {
    let active = true;
    function load() {
      read()
        .then((d) => {
          if (active) setSettings(d);
        })
        .catch(() => {});
    }
    if (!cached) load();
    const refresh = () => {
      cached = null;
      load();
    };
    window.addEventListener("barbearia-settings", refresh);
    return () => {
      active = false;
      window.removeEventListener("barbearia-settings", refresh);
    };
  }, []);
  return settings;
}
export function contactLink(phone: string, text: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
