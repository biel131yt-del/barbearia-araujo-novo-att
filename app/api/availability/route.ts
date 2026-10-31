import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { availableSlots, localDate, validDate } from "@/lib/availability";
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const date = params.get("date") || "";
  const month = params.get("month");
  if (month) {
    const serviceId = Number(params.get("service_id"));
    if (
      !/^\d{4}-(0[1-9]|1[0-2])$/.test(month) ||
      !Number.isInteger(serviceId) ||
      serviceId < 1
    )
      return NextResponse.json(
        { error: "Mês ou serviço inválido" },
        { status: 400 },
      );
    const [service] =
      await sql`SELECT duration_minutes FROM services WHERE id=${serviceId} AND is_active=true`;
    if (!service)
      return NextResponse.json(
        { error: "Serviço indisponível" },
        { status: 404 },
      );
    const start = month + "-01";
    const [windows, busy, months] = await Promise.all([
      sql`SELECT work_date::text,start_time,end_time FROM availability_windows WHERE work_date>=${start}::date AND work_date<${start}::date+INTERVAL '1 month' AND work_date>=${localDate()} ORDER BY work_date,start_time`,
      sql`SELECT appointment_date::text,appointment_time,duration_minutes FROM appointments WHERE appointment_date>=${start}::date AND appointment_date<${start}::date+INTERVAL '1 month' AND status NOT IN ('cancelled','no_show')`,
      sql`SELECT DISTINCT to_char(work_date,'YYYY-MM') AS month FROM availability_windows WHERE work_date>=${localDate()} ORDER BY month LIMIT 36`,
    ]);
    const dates = [...new Set(windows.map((w) => w.work_date as string))]
      .map((date) => ({
        date,
        count: availableSlots(
          date,
          windows.filter((w) => w.work_date === date) as any,
          busy.filter((b) => b.appointment_date === date) as any,
          service.duration_minutes,
        ).length,
      }))
      .filter((d) => d.count > 0);
    return NextResponse.json(
      { dates, months: months.map((m) => m.month) },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const serviceId = Number(params.get("service_id"));
  if (
    !validDate(date) ||
    date < localDate() ||
    !Number.isInteger(serviceId) ||
    serviceId <= 0
  )
    return NextResponse.json(
      { error: "Data ou serviço inválido" },
      { status: 400 },
    );
  const [service] =
    await sql`SELECT s.duration_minutes,COALESCE(p.price_cents,s.price_cents) AS price_cents FROM services s
 LEFT JOIN service_promotions p ON p.service_id=s.id AND p.is_active=true AND ${date}::date BETWEEN p.valid_from AND p.valid_until AND p.price_cents<s.price_cents
 WHERE s.id=${serviceId} AND s.is_active=true`;
  if (!service)
    return NextResponse.json(
      { error: "Serviço indisponível" },
      { status: 404 },
    );
  const windows =
    await sql`SELECT start_time, end_time FROM availability_windows WHERE work_date = ${date} ORDER BY start_time`;
  const busy =
    await sql`SELECT appointment_time, duration_minutes FROM appointments WHERE appointment_date = ${date} AND status NOT IN ('cancelled', 'no_show')`;
  return NextResponse.json(
    {
      price_cents: service.price_cents,
      times: availableSlots(
        date,
        windows as any,
        busy as any,
        service.duration_minutes,
      ),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
