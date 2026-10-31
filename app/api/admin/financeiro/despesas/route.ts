import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminUser, auditLog } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const rows = await sql`
    SELECT e.*, ec.name as category_name
    FROM expenses e
    LEFT JOIN expense_categories ec ON e.category_id = ec.id
    ORDER BY e.due_date DESC
    LIMIT 100
  `;

  return NextResponse.json({ despesas: rows });
}

export async function POST(req: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      category_id,
      name,
      description,
      amount_cents,
      due_date,
      payment_method,
      notes,
    } = body;

    if (
      !name ||
      !Number.isInteger(amount_cents) ||
      amount_cents <= 0 ||
      !due_date ||
      Number.isNaN(Date.parse(due_date))
    ) {
      return NextResponse.json(
        { error: "Nome, valor e vencimento são obrigatórios" },
        { status: 400 },
      );
    }

    const [despesa] = await sql`
      INSERT INTO expenses (category_id, name, description, amount_cents, due_date, payment_method, notes)
      VALUES (${category_id ?? null}, ${name}, ${description ?? null}, ${amount_cents}, ${due_date}, ${payment_method ?? null}, ${notes ?? null})
      RETURNING *
    `;

    await auditLog({
      userId: user.id,
      action: "create_expense",
      entityType: "expense",
      entityId: despesa.id,
      newValues: { name, amount_cents, due_date },
    });

    return NextResponse.json({ despesa }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Erro ao registrar despesa" },
      { status: 500 },
    );
  }
}
export async function PATCH(req: Request) {
  if (!(await getAdminUser()))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  try {
    const { id, payment_method } = await req.json();
    if (
      !Number.isInteger(id) ||
      !["pix", "cash", "debit_card", "credit_card", "other"].includes(
        payment_method,
      )
    )
      throw new Error("Despesa ou pagamento inválido.");
    const rows =
      await sql`UPDATE expenses SET status='paid',paid_date=(NOW() AT TIME ZONE 'America/Sao_Paulo')::date,payment_method=${payment_method},updated_at=NOW() WHERE id=${id} AND status!='paid' RETURNING id`;
    if (!rows.length)
      return NextResponse.json(
        { error: "Despesa já paga ou não encontrada" },
        { status: 409 },
      );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao atualizar despesa" },
      { status: 400 },
    );
  }
}
