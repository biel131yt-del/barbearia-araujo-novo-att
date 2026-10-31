import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminUser, auditLog } from "@/lib/auth";

export async function GET() {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const rows = await sql`
    SELECT * FROM products ORDER BY name ASC
  `;
  return NextResponse.json({ products: rows });
}

export async function POST(req: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, sku, category, supplier, cost_cents, price_cents, stock_quantity, min_stock, is_for_sale } = body;

    if (!name) {
      return NextResponse.json({ error: "Nome do produto é obrigatório" }, { status: 400 });
    }

    const [product] = await sql`
      INSERT INTO products (name, description, sku, category, supplier, cost_cents, price_cents, stock_quantity, min_stock, is_for_sale)
      VALUES (${name}, ${description ?? null}, ${sku ?? null}, ${category ?? null}, ${supplier ?? null},
              ${cost_cents ?? 0}, ${price_cents ?? 0}, ${stock_quantity ?? 0}, ${min_stock ?? 0}, ${is_for_sale ?? true})
      RETURNING *
    `;

    // Registra movimento inicial de entrada se houver estoque
    if ((stock_quantity ?? 0) > 0) {
      await sql`
        INSERT INTO stock_movements (product_id, type, quantity, reason, reference_type, created_by)
        VALUES (${product.id}, 'entry', ${stock_quantity}, 'Estoque inicial', 'manual', ${user.name})
      `;
    }

    await auditLog({
      userId: user.id,
      action: "create_product",
      entityType: "product",
      entityId: product.id,
      newValues: { name, cost_cents, price_cents, stock_quantity },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 });
  }
}
