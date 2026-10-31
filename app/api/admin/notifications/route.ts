import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminUser, auditLog } from "@/lib/auth";

export async function GET() {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const rows = await sql`
    SELECT * FROM notifications WHERE user_id = ${user.id}
    ORDER BY created_at DESC LIMIT 50
  `;

  return NextResponse.json({ notifications: rows });
}

export async function POST(req: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { title, message, type, link } = await req.json();
    const [n] = await sql`
      INSERT INTO notifications (user_id, title, message, type, link)
      VALUES (${user.id}, ${title}, ${message}, ${type ?? "info"}, ${link ?? null})
      RETURNING *
    `;
    return NextResponse.json({ notification: n }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar notificação" }, { status: 500 });
  }
}
