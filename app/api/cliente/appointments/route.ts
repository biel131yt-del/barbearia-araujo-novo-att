import { NextResponse } from "next/server";
import { getClientUser } from "@/lib/auth-session";
import { sql } from "@/lib/db";

export async function GET() {
  const clientId = (await getClientUser())?.id;

  if (!clientId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const rows = await sql`
      SELECT a.id, a.service_name, a.price_cents, a.appointment_date, a.appointment_time,
             a.status, a.payment_status, a.payment_method, a.whatsapp_confirmed, a.notes, a.created_at,
             r.rating AS review_rating,r.comment AS review_comment
      FROM appointments a LEFT JOIN reviews r ON r.appointment_id=a.id AND r.client_id=a.client_id
      WHERE a.client_id = ${clientId}
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
      LIMIT 100
    `;

    return NextResponse.json({ appointments: rows });
  } catch {
    return NextResponse.json(
      { error: "Erro ao carregar agendamentos" },
      { status: 500 },
    );
  }
}
