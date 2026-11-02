import { sleep } from "workflow";
import { loadReviewRequest, deliverReviewRequest } from "./review-steps";
export async function reviewReminder(appointmentId: number) {
  "use workflow";
  const request = await loadReviewRequest(appointmentId);
  if (!request) return;
  await sleep(new Date(request.dueAt));
  for (let attempt = 0; attempt < 5; attempt++) {
    const state = await deliverReviewRequest(appointmentId);
    if (state !== "pending" && state !== "processing") return;
    await sleep("5m");
  }
}
