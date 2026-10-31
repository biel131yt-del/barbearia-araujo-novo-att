import { sql } from "./db";
import { getVapidKeys, sendPushNotification } from "./webpush";
export async function drainPushJobs() {
  const keys = getVapidKeys();
  if (!keys) return { accepted: 0, configured: false };
  const jobs =
    await sql`UPDATE push_jobs SET state='processing',attempts=attempts+1,locked_until=NOW()+INTERVAL '2 minutes' WHERE id IN (SELECT id FROM push_jobs WHERE ((state='pending' AND next_attempt_at<=NOW()) OR (state='processing' AND locked_until<NOW())) AND attempts<5 ORDER BY id FOR UPDATE SKIP LOCKED LIMIT 20) RETURNING *`;
  let accepted = 0;
  for (const job of jobs) {
    try {
      const [n] =
        await sql`SELECT * FROM notifications WHERE id=${job.notification_id}`;
      const devices =
        await sql`SELECT * FROM push_devices WHERE (${n.user_id ?? null}::int IS NOT NULL AND user_id=${n.user_id ?? null}) OR (${n.client_id ?? null}::int IS NOT NULL AND client_id=${n.client_id ?? null})`;
      if (!devices.length) {
        await sql`UPDATE push_jobs SET state='waiting_subscription',locked_until=NULL WHERE id=${job.id}`;
        continue;
      }
      let sent = 0;
      let failed = false;
      for (const device of devices) {
        try {
          const result = await sendPushNotification(
            {
              endpoint: device.endpoint,
              keys: { p256dh: device.p256dh_key, auth: device.auth_key },
            },
            {
              title: n.title,
              body: n.message,
              link: n.link || "/cliente",
              type: "notification-" + n.id,
            },
          );
          if (result.success) {
            sent++;
            await sql`UPDATE push_devices SET last_used_at=NOW() WHERE id=${device.id}`;
          } else if (result.reason === "subscription_expired") {
            await sql`DELETE FROM push_devices WHERE id=${device.id}`;
          }
        } catch {
          failed = true;
        }
      }
      if (sent) {
        accepted++;
        await sql`UPDATE push_jobs SET state='accepted',accepted_at=NOW(),locked_until=NULL,last_error=NULL WHERE id=${job.id}`;
      } else if (failed) {
        await sql`UPDATE push_jobs SET state=CASE WHEN attempts>=5 THEN 'failed' ELSE 'pending' END,next_attempt_at=NOW()+INTERVAL '5 minutes',locked_until=NULL,last_error='Serviço push indisponível; nova tentativa agendada' WHERE id=${job.id}`;
      } else {
        await sql`UPDATE push_jobs SET state='waiting_subscription',locked_until=NULL,last_error='Inscrição expirada' WHERE id=${job.id}`;
      }
    } catch {
      await sql`UPDATE push_jobs SET state=CASE WHEN attempts>=5 THEN 'failed' ELSE 'pending' END,next_attempt_at=NOW()+INTERVAL '5 minutes',locked_until=NULL,last_error='Falha no processamento' WHERE id=${job.id}`;
    }
  }
  return { accepted, configured: true };
}
