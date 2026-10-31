import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";

const CLIENT_SESSION_COOKIE = "barbearia_client_session";

export async function GET() {
  const cookieStore = await cookies();
  const clientId = cookieStore.get(CLIENT_SESSION_COOKIE)?.value;

  if (!clientId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const rows = await sql`
      SELECT id, service_name, price_cents, appointment_date, appointment_time,
             status, payment_status, payment_method, whatsapp_confirmed, notes, created_at
      FROM appointments
      WHERE client_id = ${clientId}
      ORDER BY appointment_date DESC, appointment_time DESC
      LIMIT 100
    `;

    return NextResponse.json({ appointments: rows });
  } catch {
    return NextResponse.json(
      { error: "Erro ao carregar agendamentos" },
      { status: 500 }
    );
  }
}
