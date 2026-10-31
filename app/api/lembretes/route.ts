import { getAdminUser } from "@/lib/auth";
import { localDate } from "@/lib/availability";
import { drainPushJobs } from "@/lib/push-jobs";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: Request) {
  if (
    process.env.CRON_SECRET
      ? req.headers.get("authorization") !== "Bearer " + process.env.CRON_SECRET
      : !(await getAdminUser())
  )
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  try {
    const today = localDate();
    const appointments = await sql`
      SELECT * FROM appointments
      WHERE appointment_date = ${today} AND whatsapp_confirmed = FALSE
    `;

    console.log(`Lembretes para ${today}:`, appointments.length);

    const push = await drainPushJobs();
    return NextResponse.json({ count: appointments.length, push });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}
