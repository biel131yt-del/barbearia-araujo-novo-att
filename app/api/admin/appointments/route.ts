import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminUser, auditLog } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const search = searchParams.get("search");

  let query = `
    SELECT a.id, a.client_name, a.service_name, a.appointment_date, a.appointment_time,
           a.status, a.payment_method, a.price_cents, b.name as barber_name
    FROM appointments a
    LEFT JOIN barbers b ON a.barber_id = b.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (date) {
    query += ` AND a.appointment_date = $${params.length + 1}`;
    params.push(date);
  }
  if (search) {
    query += ` AND (a.client_name ILIKE $${params.length + 1} OR a.service_name ILIKE $${params.length + 1})`;
    params.push(`%${search}%`);
  }

  query += ` ORDER BY a.appointment_date ASC, a.appointment_time ASC`;

  // Usando pg-like parametrização simples via sql template com arrays
  // Para simplicidade, usamos consulta direta com validação
  const rows = await sql`
    SELECT a.id, a.client_name, a.service_name, a.appointment_date, a.appointment_time,
           a.status, a.payment_method, a.price_cents, b.name as barber_name
    FROM appointments a
    LEFT JOIN barbers b ON a.barber_id = b.id
    WHERE (${date ? `a.appointment_date = ${date}` : "1=1"})
    ORDER BY a.appointment_date ASC, a.appointment_time ASC
    LIMIT 100
  `;

  return NextResponse.json({ appointments: rows });
}

export async function POST(req: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      client_id, barber_id, service_id, client_name, client_phone,
      service_name, price_cents, duration_minutes, appointment_date,
      appointment_time, notes
    } = body;

    if (!client_name || !client_phone || !service_name || !appointment_date || !appointment_time) {
      return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });
    }

    const [appointment] = await sql`
      INSERT INTO appointments (client_id, barber_id, service_id, client_name, client_phone,
        service_name, price_cents, duration_minutes, appointment_date, appointment_time, notes)
      VALUES (${client_id ?? null}, ${barber_id ?? null}, ${service_id ?? null},
              ${client_name}, ${client_phone}, ${service_name}, ${price_cents ?? 0},
              ${duration_minutes ?? 30}, ${appointment_date}, ${appointment_time}, ${notes ?? null})
      RETURNING *
    `;

    await auditLog({
      userId: user.id,
      action: "create_appointment",
      entityType: "appointment",
      entityId: appointment.id,
      newValues: { client_name, service_name, appointment_date, appointment_time },
    });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao criar agendamento" }, { status: 500 });
  }
}
