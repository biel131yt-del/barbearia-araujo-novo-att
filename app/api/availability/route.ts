import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { availableSlots, localDate, validDate } from "@/lib/availability";
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const date = params.get("date") || "";
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
