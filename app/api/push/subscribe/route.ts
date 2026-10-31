import { NextResponse, after } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { getClientUser } from "@/lib/auth-session";
import { sql } from "@/lib/db";
import { drainPushJobs } from "@/lib/push-jobs";
async function principal(req: Request, body?: any) {
  const audience =
    body?.audience || new URL(req.url).searchParams.get("audience") || "admin";
  if (audience === "client") {
    const u = await getClientUser();
    return u ? { kind: "client", id: u.id } : null;
  }
  const u = await getAdminUser();
  return u ? { kind: "admin", id: u.id } : null;
}
export async function GET(req: Request) {
  const u = await principal(req);
  if (!u)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const rows =
    await sql`SELECT endpoint FROM push_devices WHERE (${u.kind}='admin' AND user_id=${u.id}) OR (${u.kind}='client' AND client_id=${u.id})`;
  return NextResponse.json({ endpoints: rows.map((r) => r.endpoint) });
}
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const u = await principal(req, body);
    if (!u)
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    const { endpoint, keys } = body;
    const url = new URL(endpoint);
    if (
      url.protocol !== "https:" ||
      ![
        "push.apple.com",
        "googleapis.com",
        "push.services.mozilla.com",
        "notify.windows.com",
      ].some((h) => url.hostname === h || url.hostname.endsWith("." + h))
    )
      throw new Error("Serviço de notificações não reconhecido.");
    if (
      Buffer.from(keys?.p256dh || "", "base64").length !== 65 ||
      Buffer.from(keys?.auth || "", "base64").length !== 16
    )
      throw new Error("Inscrição inválida.");
    await sql.transaction([
      sql`DELETE FROM push_devices WHERE endpoint=${endpoint}`,
      sql`INSERT INTO push_devices(user_id,client_id,endpoint,p256dh_key,auth_key,user_agent) VALUES(${u.kind === "admin" ? u.id : null},${u.kind === "client" ? u.id : null},${endpoint},${keys.p256dh},${keys.auth},${String(body.user_agent || "").slice(0, 500)})`,
      sql`UPDATE push_jobs j SET state='pending',attempts=0,next_attempt_at=NOW() FROM notifications n WHERE j.notification_id=n.id AND j.state='waiting_subscription' AND n.created_at>NOW()-INTERVAL '24 hours' AND ((${u.kind}='admin' AND n.user_id=${u.id}) OR (${u.kind}='client' AND n.client_id=${u.id}))`,
    ]);
    after(() => drainPushJobs().then(() => {}));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Falha ao inscrever aparelho" },
      { status: 400 },
    );
  }
}
export async function DELETE(req: Request) {
  const b = await req.json();
  const u = await principal(req, b);
  if (!u)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  await sql`DELETE FROM push_devices WHERE endpoint=${b.endpoint} AND ((${u.kind}='admin' AND user_id=${u.id}) OR (${u.kind}='client' AND client_id=${u.id}))`;
  return NextResponse.json({ ok: true });
}
