import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminUser } from "@/lib/auth";
export async function GET(req: Request) {
  if (!(await getAdminUser()))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const p = new URL(req.url).searchParams,
    date = p.get("date") || null,
    search = `%${p.get("search") || ""}%`;
  const appointments =
    await sql`SELECT a.id,a.client_name,a.client_phone,a.service_name,a.appointment_date::text,a.appointment_time,a.duration_minutes,a.status,a.payment_status,a.payment_method,a.price_cents,b.name AS barber_name FROM appointments a LEFT JOIN barbers b ON b.id=a.barber_id WHERE (${date}::date IS NULL OR a.appointment_date=${date}::date) AND (a.client_name ILIKE ${search} OR a.service_name ILIKE ${search}) ORDER BY a.appointment_date,a.appointment_time LIMIT 200`;
  return NextResponse.json({ appointments });
}
export async function PATCH(req: Request) {
  if (!(await getAdminUser()))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  try {
    const { id, status, payment_method } = await req.json();
    if (
      !Number.isInteger(id) ||
      !["confirmed", "completed", "cancelled", "no_show"].includes(status)
    )
      throw new Error("Atualização inválida.");
    if (
      status === "completed" &&
      !["cash", "pix", "debit_card", "credit_card", "other"].includes(
        payment_method,
      )
    )
      throw new Error("Informe a forma de pagamento.");
    const rows = await sql`WITH updated AS (
 UPDATE appointments SET status=${status},payment_status=CASE WHEN ${status}='completed' THEN 'paid' ELSE payment_status END,
 payment_method=CASE WHEN ${status}='completed' THEN ${payment_method || null} ELSE payment_method END,
 completed_at=CASE WHEN ${status}='completed' THEN NOW() ELSE completed_at END,
 cancelled_at=CASE WHEN ${status}='cancelled' THEN NOW() ELSE cancelled_at END,updated_at=NOW()
 WHERE id=${id} AND status IN ('scheduled','confirmed') RETURNING *),
 revenue AS (INSERT INTO revenues(appointment_id,amount_cents,source,payment_method,received_at)
 SELECT id,price_cents,'appointment',payment_method,NOW() FROM updated WHERE status='completed' AND NOT EXISTS (SELECT 1 FROM revenues r WHERE r.appointment_id=updated.id) RETURNING id)
 SELECT id FROM updated`;
    if (!rows.length)
      return NextResponse.json(
        {
          error:
            "Atendimento já finalizado ou não encontrado. Atualize a agenda.",
        },
        { status: 409 },
      );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Não foi possível atualizar" },
      { status: 400 },
    );
  }
}
