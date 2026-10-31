import { NextResponse, after } from "next/server";
import { getClientUser } from "@/lib/auth-session";
import { sql } from "@/lib/db";
import { drainPushJobs } from "@/lib/push-jobs";
export async function GET() {
  const u = await getClientUser();
  if (!u)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const notifications =
    await sql`SELECT id,title,message,link,is_read,created_at FROM notifications WHERE client_id=${u.id} ORDER BY created_at DESC LIMIT 50`;
  after(() => drainPushJobs().then(() => {}));
  return NextResponse.json({ notifications });
}
export async function PATCH(req: Request) {
  const u = await getClientUser();
  if (!u)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { id } = await req.json();
  if (!Number.isInteger(id))
    return NextResponse.json(
      { error: "Notificação inválida" },
      { status: 400 },
    );
  await sql`UPDATE notifications SET is_read=true WHERE id=${id} AND client_id=${u.id}`;
  return NextResponse.json({ ok: true });
}
