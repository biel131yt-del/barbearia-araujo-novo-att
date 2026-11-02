import { start } from "workflow/api";
import { reviewReminder } from "@/workflows/review-reminder";
import { sql } from "./db";
export async function scheduleReviewRequests() {
  const pending =
    await sql`UPDATE review_requests SET scheduling_until=NOW()+INTERVAL '2 minutes' WHERE appointment_id IN(SELECT appointment_id FROM review_requests WHERE workflow_run_id IS NULL AND notification_id IS NULL AND (scheduling_until IS NULL OR scheduling_until<NOW()) ORDER BY due_at LIMIT 20 FOR UPDATE SKIP LOCKED) RETURNING appointment_id`;
  for (const request of pending) {
    try {
      const run = await start(reviewReminder, [request.appointment_id]);
      await sql`UPDATE review_requests SET workflow_run_id=${run.runId},scheduling_until=NULL WHERE appointment_id=${request.appointment_id}`;
    } catch {
      await sql`UPDATE review_requests SET scheduling_until=NULL WHERE appointment_id=${request.appointment_id}`;
      console.error("Review reminder could not start", request.appointment_id);
    }
  }
}
