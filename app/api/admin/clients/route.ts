import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminUser, auditLog } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");

  let rows;
  if (search) {
    rows = await sql`
      SELECT * FROM clients
      WHERE name ILIKE ${`%${search}%`} OR phone ILIKE ${`%${search}%`}
      ORDER BY name ASC
      LIMIT 100
    `;
  } else {
    rows = await sql`
      SELECT * FROM clients ORDER BY name ASC LIMIT 100
    `;
  }

  return NextResponse.json({ clients: rows });
}

export async function POST(req: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, phone, email, birth_date, notes } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "Nome e telefone são obrigatórios" }, { status: 400 });
    }

    const [client] = await sql`
      INSERT INTO clients (name, phone, email, birth_date, notes)
      VALUES (${name}, ${phone}, ${email ?? null}, ${birth_date ?? null}, ${notes ?? null})
      RETURNING *
    `;

    await auditLog({
      userId: user.id,
      action: "create_client",
      entityType: "client",
      entityId: client.id,
      newValues: { name, phone, email },
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao criar cliente" }, { status: 500 });
  }
}
