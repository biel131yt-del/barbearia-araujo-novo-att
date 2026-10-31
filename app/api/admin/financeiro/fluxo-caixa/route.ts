import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminUser } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const periodo = searchParams.get("periodo") || "mes";

  const hoje = new Date();
  let startDate: string;
  if (periodo === "dia") {
    startDate = hoje.toISOString().split("T")[0];
  } else if (periodo === "ano") {
    startDate = `${hoje.getFullYear()}-01-01`;
  } else {
    startDate = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-01`;
  }

  // Entradas (receitas)
  const [entradas] = await sql`
    SELECT COALESCE(SUM(amount_cents), 0) as total FROM revenues
    WHERE received_at >= ${startDate}
  `;

  // Saídas (despesas pagas)
  const [saidas] = await sql`
    SELECT COALESCE(SUM(amount_cents), 0) as total FROM expenses
    WHERE status = 'paid' AND paid_date >= ${startDate}
  `;

  // Movimentações por dia (últimos 30 dias para mes/ano, 1 dia para dia)
  const dias = periodo === "dia" ? 1 : 30;
  const movimentacoes = await sql`
    SELECT data_mov as data,
           COALESCE(SUM(CASE WHEN tipo = 'entrada' THEN amount_cents ELSE 0 END), 0) as entradas,
           COALESCE(SUM(CASE WHEN tipo = 'saida' THEN amount_cents ELSE 0 END), 0) as saidas
    FROM (
      SELECT received_at::date as data_mov, amount_cents, 'entrada' as tipo FROM revenues WHERE received_at >= ${startDate}
      UNION ALL
      SELECT paid_date::date as data_mov, amount_cents, 'saida' as tipo FROM expenses WHERE status = 'paid' AND paid_date >= ${startDate}
    ) t
    GROUP BY data_mov
    ORDER BY data_mov DESC
    LIMIT ${dias}
  `;

  // Calcular saldo acumulado
  let saldo = 0;
  const movimentacoesComSaldo = movimentacoes.map((m: any) => {
    saldo += Number(m.entradas) - Number(m.saidas);
    return {
      ...m,
      saldo: Math.round(saldo),
    };
  });

  return NextResponse.json({
    entradas: Number(entradas.total),
    saidas: Number(saidas.total),
    movimentacoes_por_dia: movimentacoesComSaldo,
  });
}
