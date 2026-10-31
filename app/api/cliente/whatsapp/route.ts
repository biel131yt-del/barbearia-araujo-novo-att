import { NextResponse } from "next/server";
import { getClientUser } from "@/lib/auth-session";
import { publicSettings, whatsappUrl } from "@/lib/settings";
import { sql } from "@/lib/db";
export async function GET() {
  const u = await getClientUser();
  if (!u) return NextResponse.json({ pending: null }, { status: 401 });
  const [a] =
    await sql`SELECT id,service_name,appointment_date::text,appointment_time,client_name,price_cents,whatsapp_opened_at FROM appointments WHERE client_id=${u.id} AND whatsapp_required=true AND whatsapp_client_reported_at IS NULL AND status IN ('scheduled','confirmed') ORDER BY created_at DESC LIMIT 1`;
  const settings = await publicSettings();
  return NextResponse.json(
    {
      pending: a
        ? {
            ...a,
            whatsapp_url: whatsappUrl(a as any, settings.telefone_whatsapp),
          }
        : null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
export async function POST(req: Request) {
  const u = await getClientUser();
  if (!u)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id, action } = await req.json();
  if (!Number.isInteger(id) || !["opened", "reported_sent"].includes(action))
    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  const rows =
    action === "opened"
      ? await sql`UPDATE appointments SET whatsapp_opened_at=COALESCE(whatsapp_opened_at,NOW()) WHERE id=${id} AND client_id=${u.id} AND whatsapp_required=true RETURNING id`
      : await sql`UPDATE appointments SET whatsapp_client_reported_at=COALESCE(whatsapp_client_reported_at,NOW()) WHERE id=${id} AND client_id=${u.id} AND whatsapp_opened_at IS NOT NULL RETURNING id`;
  if (!rows.length)
    return NextResponse.json(
      { error: "Abra o WhatsApp antes de confirmar o envio." },
      { status: 400 },
    );
  return NextResponse.json({ ok: true });
}
