import { localDate } from "@/lib/availability";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminUser, auditLog } from "@/lib/auth";
import { centsToReal } from "@/lib/db";

export async function GET() {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const today = localDate();
    const startOfMonth = localDate().slice(0, 7) + "-01";

    // Agendamentos hoje
    const [appointmentsToday] = await sql`
      SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ${today}
    `;

    // Próximos 7 dias
    const [upcomingCount] = await sql`
      SELECT COUNT(*) as count FROM appointments
      WHERE appointment_date >= ${today} AND appointment_date <= ${localDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))}
      AND status IN ('scheduled', 'confirmed')
    `;

    // Concluídos este mês
    const [completedMonth] = await sql`
      SELECT COUNT(*) as count FROM appointments
      WHERE appointment_date >= ${startOfMonth} AND status = 'completed'
    `;

    // Cancelados este mês
    const [cancelledMonth] = await sql`
      SELECT COUNT(*) as count FROM appointments
      WHERE appointment_date >= ${startOfMonth} AND status = 'cancelled'
    `;

    // Receita recebida este mês
    const [revenueReceived] = await sql`
      SELECT COALESCE(SUM(amount_cents), 0) as total FROM revenues
      WHERE received_at >= ${startOfMonth}
    `;

    // Receita prevista (agendamentos agendados/confirmados este mês)
    const [revenueExpected] = await sql`
      SELECT COALESCE(SUM(price_cents), 0) as total FROM appointments
      WHERE appointment_date >= ${startOfMonth}
      AND status IN ('scheduled', 'confirmed')
    `;

    // Novos clientes este mês
    const [newClients] = await sql`
      SELECT COUNT(*) as count FROM clients
      WHERE created_at >= ${startOfMonth}
    `;

    // Avaliação média
    const [avgRating] = await sql`
      SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0) as avg FROM reviews
    `;

    // Próximos atendimentos (detalhes)
    const upcomingAppointments = await sql`
      SELECT a.id, a.client_name, a.service_name, a.appointment_date, a.appointment_time,
             a.status, a.payment_method, b.name as barber_name
      FROM appointments a
      LEFT JOIN barbers b ON a.barber_id = b.id
      WHERE a.appointment_date >= ${today}
      AND a.status IN ('scheduled', 'confirmed')
      ORDER BY a.appointment_date ASC, a.appointment_time ASC
      LIMIT 10
    `;

    // Últimas movimentações financeiras (receitas + despesas pagas)
    const recentRevenues = await sql`
      SELECT 'entrada' as type, r.amount_cents, r.received_at::text as date,
             r.source as name, r.payment_method
      FROM revenues r
      WHERE r.received_at >= ${startOfMonth}
      ORDER BY r.received_at DESC
      LIMIT 5
    `;

    const recentExpenses = await sql`
      SELECT 'saida' as type, e.amount_cents, e.paid_date::text as date,
             e.name, e.payment_method
      FROM expenses e
      WHERE e.status = 'paid' AND e.paid_date >= ${startOfMonth}
      ORDER BY e.paid_date DESC
      LIMIT 5
    `;

    const recentFinancials = [...recentRevenues, ...recentExpenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8)
      .map((m: any) => ({
        name: m.name,
        type: m.type,
        amount: m.amount_cents,
        date: m.date,
      }));

    await auditLog({
      userId: user.id,
      action: "view_dashboard",
      entityType: "dashboard",
    });

    return NextResponse.json({
      appointments_today: Number(appointmentsToday.count),
      upcoming: Number(upcomingCount.count),
      completed: Number(completedMonth.count),
      cancelled: Number(cancelledMonth.count),
      revenue_received: Number(revenueReceived.total),
      revenue_expected: Number(revenueExpected.total),
      new_clients: Number(newClients.count),
      avg_rating: String(avgRating.avg),
      upcoming_appointments: upcomingAppointments.map((a: any) => ({
        id: a.id,
        client_name: a.client_name,
        service_name: a.service_name,
        appointment_date: a.appointment_date,
        appointment_time: a.appointment_time,
        status: a.status,
        payment_method: a.payment_method,
        barber_name: a.barber_name,
      })),
      recent_financials: recentFinancials,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao carregar dashboard" },
      { status: 500 },
    );
  }
}
