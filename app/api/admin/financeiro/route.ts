import { localDate } from "@/lib/availability";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminUser, auditLog } from "@/lib/auth";

export async function GET() {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const startOfMonth = localDate().slice(0, 7) + "-01";
    const today = localDate();

    // Receita recebida este mês
    const [revenue] = await sql`
      SELECT COALESCE(SUM(amount_cents), 0) as total FROM revenues
      WHERE received_at >= ${startOfMonth}
    `;

    // Despesas pagas este mês
    const [expenses] = await sql`
      SELECT COALESCE(SUM(amount_cents), 0) as total FROM expenses
      WHERE status = 'paid' AND paid_date >= ${startOfMonth}
    `;

    // Pendentes a receber (agendamentos agendados não pagos)
    const [pending] = await sql`
      SELECT COALESCE(SUM(price_cents), 0) as total FROM appointments
      WHERE appointment_date >= ${today}
      AND status IN ('scheduled', 'confirmed')
      AND payment_status != 'paid'
    `;

    // Despesas por categoria
    const expensesByCategory = await sql`
      SELECT ec.name, COALESCE(SUM(e.amount_cents), 0) as total, COUNT(e.id) as count
      FROM expense_categories ec
      LEFT JOIN expenses e ON e.category_id = ec.id AND e.status = 'paid' AND e.paid_date >= ${startOfMonth}
      GROUP BY ec.id, ec.name
      HAVING COUNT(e.id) > 0
      ORDER BY total DESC
    `;

    // Movimentações recentes (receitas + despesas pagas)
    const recentRevenues = await sql`
      SELECT 'entrada' as type, r.amount_cents, r.received_at::text as date, r.source as name
      FROM revenues r
      WHERE r.received_at >= ${startOfMonth}
      ORDER BY r.received_at DESC
      LIMIT 5
    `;

    const recentExpenses = await sql`
      SELECT 'saida' as type, e.amount_cents, e.paid_date::text as date, e.name
      FROM expenses e
      WHERE e.status = 'paid' AND e.paid_date >= ${startOfMonth}
      ORDER BY e.paid_date DESC
      LIMIT 5
    `;

    const recentMovements = [...recentRevenues, ...recentExpenses]
      .sort(
        (a: any, b: any) =>
          new Date(b.date).getTime() - new Date(a.date).getTime(),
      )
      .slice(0, 10);

    await auditLog({
      userId: user.id,
      action: "view_financeiro",
      entityType: "financeiro",
    });

    return NextResponse.json({
      revenue_received: Number(revenue.total),
      expenses_paid: Number(expenses.total),
      pending_revenue: Number(pending.total),
      expenses_by_category: expensesByCategory.map((c: any) => ({
        name: c.name,
        total: Number(c.total),
        count: Number(c.count),
      })),
      recent_movements: recentMovements.map((m: any) => ({
        name: m.name,
        type: m.type,
        amount: m.amount_cents,
        date: m.date,
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao carregar financeiro" },
      { status: 500 },
    );
  }
}
