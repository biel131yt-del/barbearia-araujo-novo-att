import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminUser, auditLog } from "@/lib/auth";

export async function GET() {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const rows = await sql`SELECT * FROM services ORDER BY name ASC`;
  return NextResponse.json({ services: rows });
}

export async function POST(req: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, price_cents, duration_minutes, is_featured } = body;

    if (!name || price_cents == null) {
      return NextResponse.json({ error: "Nome e preço são obrigatórios" }, { status: 400 });
    }

    const [service] = await sql`
      INSERT INTO services (name, description, price_cents, duration_minutes, is_featured)
      VALUES (${name}, ${description ?? null}, ${price_cents}, ${duration_minutes ?? 30}, ${is_featured ?? false})
      RETURNING *
    `;

    await auditLog({
      userId: user.id,
      action: "create_service",
      entityType: "service",
      entityId: service.id,
      newValues: { name, price_cents },
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao criar serviço" }, { status: 500 });
  }
}
