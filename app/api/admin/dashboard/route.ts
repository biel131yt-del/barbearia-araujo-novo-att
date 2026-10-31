import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import { localDate } from "@/lib/availability";
export async function GET(req: Request) {
  if (!(await getAdminUser()))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const today = localDate();
  const period = new URL(req.url).searchParams.get("period") || "month";
  let start = today,
    end = today;
  const day = new Date(today + "T12:00:00Z");
  if (period === "week") {
    const offset = (day.getUTCDay() + 6) % 7;
    day.setUTCDate(day.getUTCDate() - offset);
    start = day.toISOString().slice(0, 10);
    day.setUTCDate(day.getUTCDate() + 6);
    end = day.toISOString().slice(0, 10);
  } else if (period === "month") {
    start = today.slice(0, 7) + "-01";
    day.setUTCMonth(day.getUTCMonth() + 1, 0);
    end = day.toISOString().slice(0, 10);
  }
  const [counts, revenues, newClients, reviews, upcoming, movements] =
    await Promise.all([
      sql`SELECT COUNT(*)::int AS total,COUNT(*) FILTER(WHERE status='completed')::int AS completed,COUNT(*) FILTER(WHERE status='cancelled')::int AS cancelled,COALESCE(SUM(price_cents) FILTER(WHERE status IN('scheduled','confirmed')),0)::int AS expected FROM appointments WHERE appointment_date BETWEEN ${start} AND ${end}`,
      sql`SELECT COALESCE(SUM(amount_cents),0)::int AS total FROM revenues WHERE (received_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::date BETWEEN ${start} AND ${end}`,
      sql`SELECT COUNT(*)::int AS total FROM clients WHERE created_at::date BETWEEN ${start} AND ${end}`,
      sql`SELECT COALESCE(ROUND(AVG(rating),1),0) AS avg FROM reviews`,
      sql`SELECT id,client_name,service_name,appointment_date::text,appointment_time FROM appointments WHERE appointment_date>=${today} AND status IN('scheduled','confirmed') ORDER BY appointment_date,appointment_time LIMIT 10`,
      sql`SELECT source AS name,amount_cents,'entrada' AS type,received_at::text AS date FROM revenues WHERE (received_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::date BETWEEN ${start} AND ${end} UNION ALL SELECT name,amount_cents,'saida',paid_date::text FROM expenses WHERE status='paid' AND paid_date BETWEEN ${start} AND ${end} ORDER BY date DESC LIMIT 8`,
    ]);
  return NextResponse.json({
    start,
    end,
    appointments: counts[0].total,
    completed: counts[0].completed,
    cancelled: counts[0].cancelled,
    revenue_received: revenues[0].total,
    revenue_expected: counts[0].expected,
    new_clients: newClients[0].total,
    avg_rating: Number(reviews[0].avg),
    upcoming_appointments: upcoming,
    recent_financials: movements,
  });
}
