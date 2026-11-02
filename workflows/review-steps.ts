import { sql } from "@/lib/db";
import { drainPushJobs } from "@/lib/push-jobs";
export async function loadReviewRequest(appointmentId: number) {
  "use step";
  const [request] =
    await sql`SELECT rr.due_at::text AS due_at FROM review_requests rr JOIN appointments a ON a.id=rr.appointment_id WHERE rr.appointment_id=${appointmentId} AND a.status='completed' AND NOT EXISTS(SELECT 1 FROM reviews r WHERE r.appointment_id=a.id)`;
  console.log("Review reminder scheduled", appointmentId);
  return request ? { dueAt: request.due_at as string } : null;
}
export async function deliverReviewRequest(appointmentId: number) {
  "use step";
  await sql`WITH eligible AS(SELECT rr.appointment_id,rr.client_id FROM review_requests rr JOIN appointments a ON a.id=rr.appointment_id WHERE rr.appointment_id=${appointmentId} AND rr.due_at<=NOW() AND rr.notification_id IS NULL AND a.status='completed' AND NOT EXISTS(SELECT 1 FROM reviews r WHERE r.appointment_id=a.id) FOR UPDATE OF rr),created AS(INSERT INTO notifications(client_id,title,message,type,link) SELECT client_id,'Como foi seu atendimento?','Já chegou bem? Conte como foi seu atendimento na Barbearia Araújo. Sua avaliação faz a diferença.','info','/cliente?avaliar='||appointment_id||'#avaliacao-'||appointment_id FROM eligible RETURNING id,client_id),linked AS(UPDATE review_requests rr SET notification_id=c.id FROM created c,eligible e WHERE rr.appointment_id=e.appointment_id AND c.client_id=e.client_id RETURNING rr.notification_id) INSERT INTO push_jobs(notification_id) SELECT notification_id FROM linked ON CONFLICT(notification_id) DO NOTHING`;
  const [request] =
    await sql`SELECT rr.notification_id,EXISTS(SELECT 1 FROM reviews WHERE appointment_id=rr.appointment_id) AS reviewed FROM review_requests rr WHERE rr.appointment_id=${appointmentId}`;
  if (!request?.notification_id) return "skipped";
  if (request.reviewed) {
    await sql`UPDATE push_jobs SET state='cancelled' WHERE notification_id=${request.notification_id} AND state IN ('pending','waiting_subscription')`;
    return "skipped";
  }
  await drainPushJobs();
  const [job] =
    await sql`SELECT state FROM push_jobs WHERE notification_id=${request.notification_id}`;
  console.log("Review reminder processed", appointmentId, job?.state);
  return (job?.state as string) || "skipped";
}
