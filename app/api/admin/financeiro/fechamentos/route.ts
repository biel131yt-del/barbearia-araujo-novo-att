import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import { validDate, localDate } from "@/lib/availability";
export async function GET(req: Request) {
  if (!(await getAdminUser()))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const date = new URL(req.url).searchParams.get("date");
  if (date) {
    if (!validDate(date))
      return NextResponse.json({ error: "Data inválida" }, { status: 400 });
    const totals =
      await sql`SELECT payment_method,SUM(amount_cents)::int AS total FROM revenues WHERE (received_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::date=${date} GROUP BY payment_method`;
    return NextResponse.json({ totals });
  }
  return NextResponse.json({
    fechamentos:
      await sql`SELECT * FROM daily_closures ORDER BY closure_date DESC LIMIT 100`,
  });
}
export async function POST(req: Request) {
  const u = await getAdminUser();
  if (!u)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  try {
    const {
      closure_date,
      adjustments_cents = 0,
      adjustments_note = "",
    } = await req.json();
    if (
      !validDate(closure_date || "") ||
      closure_date > localDate() ||
      !Number.isInteger(adjustments_cents) ||
      Math.abs(adjustments_cents) > 100000000
    )
      throw new Error("Data ou ajuste inválido.");
    const [fechamento] =
      await sql`INSERT INTO daily_closures(closure_date,user_id,cash_total_cents,pix_total_cents,card_total_cents,other_total_cents,adjustments_cents,adjustments_note,status,closed_at) SELECT ${closure_date},${u.id},COALESCE(SUM(amount_cents) FILTER(WHERE payment_method='cash'),0),COALESCE(SUM(amount_cents) FILTER(WHERE payment_method='pix'),0),COALESCE(SUM(amount_cents) FILTER(WHERE payment_method IN('credit_card','debit_card')),0),COALESCE(SUM(amount_cents) FILTER(WHERE payment_method NOT IN('cash','pix','credit_card','debit_card')),0),${adjustments_cents},${String(adjustments_note).slice(0, 300)},'closed',NOW() FROM revenues WHERE (received_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::date=${closure_date} RETURNING *`;
    return NextResponse.json({ fechamento }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      {
        error:
          e.code === "23505"
            ? "Este dia já foi fechado."
            : e.message || "Falha ao fechar caixa",
      },
      { status: e.code === "23505" ? 409 : 400 },
    );
  }
}
