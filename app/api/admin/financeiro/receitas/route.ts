import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminUser, auditLog } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const formaPagamento = searchParams.get("forma_pagamento");

  const rows = await sql`
    SELECT r.*, a.client_name, a.service_name FROM revenues r
    LEFT JOIN appointments a ON r.appointment_id=a.id
    WHERE (${search}::text IS NULL OR r.source ILIKE ${`%${search}%`} OR a.client_name ILIKE ${`%${search}%`})
      AND (${formaPagamento}::text IS NULL OR r.payment_method=${formaPagamento})
    ORDER BY r.received_at DESC LIMIT 200
  `;

  return NextResponse.json({ receitas: rows });
}

export async function POST(req: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      amount_cents,
      source,
      payment_method,
      received_at,
      appointment_id,
      payment_id,
    } = body;

    if (
      !Number.isInteger(amount_cents) ||
      amount_cents <= 0 ||
      !source ||
      !["cash", "pix", "debit_card", "credit_card", "other"].includes(
        payment_method,
      ) ||
      !received_at ||
      Number.isNaN(Date.parse(received_at))
    ) {
      return NextResponse.json(
        { error: "Campos obrigatórios" },
        { status: 400 },
      );
    }

    const [receita] = await sql`
      INSERT INTO revenues (appointment_id, payment_id, amount_cents, source, payment_method, received_at)
      VALUES (${appointment_id ?? null}, ${payment_id ?? null}, ${amount_cents}, ${source}, ${payment_method}, ${received_at})
      RETURNING *
    `;

    await auditLog({
      userId: user.id,
      action: "create_revenue",
      entityType: "revenue",
      entityId: receita.id,
      newValues: { source, amount_cents, payment_method, received_at },
    });

    return NextResponse.json({ receita }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Erro ao registrar receita" },
      { status: 500 },
    );
  }
}
