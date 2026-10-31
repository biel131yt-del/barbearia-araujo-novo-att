import { drainPushJobs } from "@/lib/push-jobs";
import { after } from "next/server";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminUser, auditLog } from "@/lib/auth";

export async function GET() {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const rows = await sql`
    SELECT n.*,j.state AS push_state FROM notifications n LEFT JOIN push_jobs j ON j.notification_id=n.id WHERE n.user_id = ${user.id}
    ORDER BY n.created_at DESC LIMIT 50
  `;

  after(() => drainPushJobs().then(() => {}));
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
    return NextResponse.json(
      { error: "Erro ao criar notificação" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  const u = await getAdminUser();
  if (!u)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await req.json();
  if (!Number.isInteger(id))
    return NextResponse.json(
      { error: "Notificação inválida" },
      { status: 400 },
    );
  await sql`UPDATE notifications SET is_read=true WHERE id=${id} AND user_id=${u.id}`;
  return NextResponse.json({ ok: true });
}
