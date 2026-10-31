import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminUser } from "@/lib/auth";
export async function GET() {
  if (!(await getAdminUser()))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const clients =
    await sql`SELECT c.id,c.name,c.phone,c.email,c.status,c.created_at,
 COUNT(a.id)::int AS total_appointments,COALESCE(SUM(a.price_cents) FILTER (WHERE a.payment_status='paid'),0)::int AS total_spent_cents,
 MAX(a.appointment_date)::text AS last_appointment,
 ((NOW() AT TIME ZONE 'America/Sao_Paulo')::date-MAX(a.appointment_date))::int AS days_since_visit
 FROM clients c LEFT JOIN appointments a ON a.client_id=c.id AND a.status='completed'
 GROUP BY c.id ORDER BY c.name`;
  return NextResponse.json({ clients });
}
export async function POST(req: Request) {
  if (!(await getAdminUser()))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  try {
    const { name, phone, email } = await req.json();
    const digits = String(phone || "").replace(/\D/g, "");
    if (typeof name !== "string" || !name.trim() || !/^\d{10,13}$/.test(digits))
      throw new Error("Informe nome e telefone válidos.");
    const [existing] =
      await sql`SELECT id FROM clients WHERE regexp_replace(phone,'[^0-9]','','g')=${digits}`;
    if (existing)
      return NextResponse.json(
        { error: "Telefone já cadastrado" },
        { status: 409 },
      );
    const [client] =
      await sql`INSERT INTO clients(name,phone,email) VALUES(${name.trim()},${digits},${email || null}) RETURNING id,name,phone,email`;
    return NextResponse.json({ client }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao cadastrar cliente" },
      { status: 400 },
    );
  }
}
