import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { sendPushNotification, listPushDevices } from "@/lib/webpush";
import { getAdminUser, auditLog } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { title, body, link, type } = await req.json();
    if (!title || !body) {
      return NextResponse.json({ error: "Título e corpo são obrigatórios" }, { status: 400 });
    }

    const devices = await listPushDevices(user.id);
    let sent = 0;
    let failed = 0;
    const expiredEndpoints: string[] = [];

    for (const device of devices) {
      try {
        const result = await sendPushNotification(
          {
            endpoint: device.endpoint,
            keys: { p256dh: device.p256dh_key, auth: device.auth_key },
          },
          { title, body, link, type }
        );
        if (result.success) {
          sent++;
          await sql`UPDATE push_devices SET last_used_at = NOW() WHERE endpoint = ${device.endpoint}`;
        } else if (result.reason === "subscription_expired") {
          failed++;
          expiredEndpoints.push(device.endpoint);
        }
      } catch {
        failed++;
      }
    }

    // Remove inscrições expiradas
    for (const endpoint of expiredEndpoints) {
      await sql`DELETE FROM push_devices WHERE endpoint = ${endpoint}`;
    }

    await auditLog({
      userId: user.id,
      action: "push_send",
      entityType: "notification",
      newValues: { title, body, sent, failed },
    });

    return NextResponse.json({ sent, failed, expired: expiredEndpoints.length });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Erro ao enviar notificações" }, { status: 500 });
  }
}
