import { sql } from "./db";
export const DEFAULT_WHATSAPP = "5551996824286";
export const publicDefaults: Record<string, string> = {
  nome_barbearia: "Barbearia Araújo",
  telefone_whatsapp: DEFAULT_WHATSAPP,
  endereco: "Manoel Olavo da Rosa, 1044",
  email_contato: "",
  theme_mode: "auto",
  primary_color: "#1e3a8a",
  accent_color: "#dc2626",
};
export const allowedSettings = new Set([
  ...Object.keys(publicDefaults),
  "notify_new_appointment",
  "notify_confirmed",
  "notify_cancelled",
  "notify_low_stock",
]);
export async function publicSettings() {
  const rows =
    await sql`SELECT key,value FROM settings WHERE key=ANY(${Object.keys(publicDefaults)}::text[])`;
  return {
    ...publicDefaults,
    ...Object.fromEntries(rows.map((r) => [r.key, r.value])),
  };
}
export function validateSetting(key: string, value: unknown) {
  if (
    !allowedSettings.has(key) ||
    typeof value !== "string" ||
    value.length > 300
  )
    throw new Error("Configuração inválida.");
  if (key.endsWith("_color") && !/^#[a-fA-F0-9]{6}$/.test(value))
    throw new Error("Cor inválida.");
  if (
    key === "theme_mode" &&
    !["auto", "system", "light", "dark"].includes(value)
  )
    throw new Error("Tema inválido.");
  if (key.startsWith("notify_") && !["true", "false"].includes(value))
    throw new Error("Preferência inválida.");
  if (key === "telefone_whatsapp") {
    let n = value.replace(/\D/g, "");
    if (n.length === 11) n = "55" + n;
    if (!/^55\d{10,11}$/.test(n)) throw new Error("Informe WhatsApp com DDD.");
    return n;
  }
  return value;
}
export function whatsappUrl(
  a: {
    id: number;
    service_name: string;
    appointment_date: string;
    appointment_time: string;
    client_name?: string;
    price_cents: number;
  },
  phone = DEFAULT_WHATSAPP,
) {
  const date = String(a.appointment_date)
    .slice(0, 10)
    .split("-")
    .reverse()
    .join("/");
  return `https://wa.me/${phone}?text=${encodeURIComponent(`Olá! Reservei pelo aplicativo.\nAgendamento #${a.id}\nNome: ${a.client_name || ""}\nServiço: ${a.service_name}\nData: ${date} às ${a.appointment_time.slice(0, 5)}\nValor: ${(a.price_cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}\nPode confirmar o recebimento?`)}`;
}
