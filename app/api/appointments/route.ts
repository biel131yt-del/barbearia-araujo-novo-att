import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getClientUser } from "@/lib/auth-session";
import { validDate } from "@/lib/availability";
export async function POST(req: Request) {
  const client = await getClientUser();
  if (!client)
    return NextResponse.json(
      { error: "Entre na sua conta para agendar." },
      { status: 401 },
    );
  try {
    const { service_id, date, time, expected_price_cents } = await req.json();
    if (
      !Number.isInteger(expected_price_cents) ||
      expected_price_cents < 0 ||
      !Number.isInteger(service_id) ||
      !validDate(date || "") ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(time || "")
    )
      return NextResponse.json(
        { error: "Selecione serviço, data e horário." },
        { status: 400 },
      );
    const [appointment] = await sql`
      INSERT INTO appointments(client_id, client_name, client_phone, service_id, service_name, price_cents, duration_minutes, appointment_date, appointment_time)
      SELECT ${client.id}, ${client.name}, ${client.phone}, s.id, s.name, COALESCE(p.price_cents,s.price_cents), s.duration_minutes, ${date}::date, ${time}::time
      FROM services s LEFT JOIN service_promotions p ON p.service_id=s.id AND p.is_active=true
      AND ${date}::date BETWEEN p.valid_from AND p.valid_until AND p.price_cents<s.price_cents
      WHERE s.id = ${service_id} AND s.is_active = true AND COALESCE(p.price_cents,s.price_cents) = ${expected_price_cents}
      AND (${date}::date + ${time}::time) AT TIME ZONE 'America/Sao_Paulo' > NOW()
      AND EXISTS (SELECT 1 FROM availability_windows w WHERE w.work_date = ${date}::date
        AND ${time}::time >= w.start_time AND ${date}::date + ${time}::time + s.duration_minutes * INTERVAL '1 minute' <= w.work_date + w.end_time
        AND EXTRACT(EPOCH FROM (${time}::time - w.start_time))::int % 900 = 0)
      AND NOT EXISTS (SELECT 1 FROM appointments a WHERE a.appointment_date = ${date}::date AND a.status NOT IN ('cancelled','no_show')
        AND a.appointment_date + a.appointment_time < ${date}::date + ${time}::time + s.duration_minutes * INTERVAL '1 minute'
        AND a.appointment_date + a.appointment_time + a.duration_minutes * INTERVAL '1 minute' > ${date}::date + ${time}::time)
      RETURNING id, service_name, price_cents, appointment_date, appointment_time`;
    if (!appointment)
      return NextResponse.json(
        {
          error:
            "O horário ou preço mudou. Selecione a data novamente para atualizar.",
        },
        { status: 409 },
      );
    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error: any) {
    if (error.code === "23P01")
      return NextResponse.json(
        { error: "Esse horário acabou de ser reservado. Escolha outro." },
        { status: 409 },
      );
    return NextResponse.json(
      { error: "Não foi possível salvar o agendamento. Tente novamente." },
      { status: 500 },
    );
  }
}
