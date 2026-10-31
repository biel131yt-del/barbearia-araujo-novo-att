import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminUser, auditLog } from "@/lib/auth";

export async function GET() {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const rows = await sql`
    SELECT * FROM daily_closures ORDER BY closure_date DESC LIMIT 50
  `;

  return NextResponse.json({ fechamentos: rows });
}

export async function POST(req: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { closure_date, cash_total_cents, pix_total_cents, card_total_cents, other_total_cents, adjustments_cents, adjustments_note } = body;

    if (!closure_date) {
      return NextResponse.json({ error: "Data do fechamento é obrigatória" }, { status: 400 });
    }

    // Verifica se já existe fechamento para esta data
    const [existente] = await sql`SELECT id FROM daily_closures WHERE closure_date = ${closure_date}`;
    if (existente) {
      return NextResponse.json({ error: "Já existe fechamento para esta data" }, { status: 400 });
    }

    const [fechamento] = await sql`
      INSERT INTO daily_closures (closure_date, user_id, cash_total_cents, pix_total_cents, card_total_cents, other_total_cents, adjustments_cents, adjustments_note, status)
      VALUES (${closure_date}, ${user.id}, ${cash_total_cents ?? 0}, ${pix_total_cents ?? 0}, ${card_total_cents ?? 0}, ${other_total_cents ?? 0}, ${adjustments_cents ?? 0}, ${adjustments_note ?? null}, 'closed')
      RETURNING *
    `;

    await auditLog({
      userId: user.id,
      action: "daily_closure",
      entityType: "daily_closure",
      entityId: fechamento.id,
      newValues: { closure_date, cash_total_cents, pix_total_cents, card_total_cents },
    });

    return NextResponse.json({ fechamento }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao registrar fechamento" }, { status: 500 });
  }
}
