import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";

const CLIENT_SESSION_COOKIE = "barbearia_client_session";

export async function GET() {
  const cookieStore = await cookies();
  const clientId = cookieStore.get(CLIENT_SESSION_COOKIE)?.value;

  if (!clientId) {
    return NextResponse.json({ client: null }, { status: 401 });
  }

  try {
    const [client] = await sql`
      SELECT id, name, phone, email, status, loyalty_points, total_appointments, total_spent, last_appointment
      FROM clients WHERE id = ${clientId} LIMIT 1
    `;

    if (!client) {
      return NextResponse.json({ client: null }, { status: 401 });
    }

    return NextResponse.json({ client });
  } catch {
    return NextResponse.json({ client: null }, { status: 401 });
  }
}

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(CLIENT_SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
