import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminUser } from "@/lib/auth";
export async function GET(req: Request) {
  if (!(await getAdminUser()))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const id = Number(new URL(req.url).searchParams.get("product_id"));
  if (id)
    return NextResponse.json({
      movements:
        await sql`SELECT id,type,quantity,reason,created_at FROM stock_movements WHERE product_id=${id} ORDER BY created_at DESC LIMIT 30`,
    });
  return NextResponse.json({
    products: await sql`SELECT * FROM products ORDER BY name`,
  });
}
function validate(b: any) {
  if (typeof b.name !== "string" || !b.name.trim() || b.name.length > 120)
    throw new Error("Informe o nome do produto.");
  for (const k of ["cost_cents", "price_cents", "min_stock"])
    if (!Number.isInteger(b[k]) || b[k] < 0 || b[k] > 100000000)
      throw new Error("Valores e quantidades devem ser positivos e válidos.");
}
export async function POST(req: Request) {
  const u = await getAdminUser();
  if (!u)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  try {
    const b = await req.json();
    validate(b);
    if (
      !Number.isInteger(b.stock_quantity) ||
      b.stock_quantity < 0 ||
      b.stock_quantity > 1000000
    )
      throw new Error("Quantidade inicial inválida.");
    const [product] =
      await sql`WITH created AS(INSERT INTO products(name,category,sku,supplier,cost_cents,price_cents,stock_quantity,min_stock,is_for_sale,is_active) VALUES(${b.name.trim()},${b.category || null},${b.sku || null},${b.supplier || null},${b.cost_cents},${b.price_cents},${b.stock_quantity},${b.min_stock},${b.is_for_sale !== false},${b.is_active !== false}) RETURNING *), movement AS(INSERT INTO stock_movements(product_id,type,quantity,reason,created_by) SELECT id,'entry',stock_quantity,'Estoque inicial',${u.name} FROM created WHERE stock_quantity>0) SELECT * FROM created`;
    return NextResponse.json({ product }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao cadastrar" },
      { status: 400 },
    );
  }
}
export async function PATCH(req: Request) {
  const u = await getAdminUser();
  if (!u)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  try {
    const b = await req.json();
    if (!Number.isInteger(b.id)) throw new Error("Produto inválido.");
    if (b.action === "movement") {
      if (
        !["entry", "exit"].includes(b.type) ||
        !Number.isInteger(b.quantity) ||
        b.quantity <= 0 ||
        b.quantity > 1000000 ||
        typeof b.reason !== "string" ||
        !b.reason.trim()
      )
        throw new Error("Informe entrada/saída, quantidade e motivo.");
      const delta = b.type === "entry" ? b.quantity : -b.quantity;
      const [product] =
        await sql`WITH updated AS(UPDATE products SET stock_quantity=stock_quantity+${delta},updated_at=NOW() WHERE id=${b.id} AND stock_quantity+${delta}>=0 RETURNING *),movement AS(INSERT INTO stock_movements(product_id,type,quantity,reason,created_by) SELECT id,${b.type},${b.quantity},${b.reason.slice(0, 200)},${u.name} FROM updated) SELECT * FROM updated`;
      if (!product)
        return NextResponse.json(
          { error: "Estoque insuficiente ou produto inexistente." },
          { status: 409 },
        );
      return NextResponse.json({ product });
    }
    validate(b);
    const [product] =
      await sql`UPDATE products SET name=${b.name.trim()},category=${b.category || null},sku=${b.sku || null},supplier=${b.supplier || null},cost_cents=${b.cost_cents},price_cents=${b.price_cents},min_stock=${b.min_stock},is_for_sale=${b.is_for_sale !== false},is_active=${b.is_active !== false},updated_at=NOW() WHERE id=${b.id} RETURNING *`;
    if (!product)
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 },
      );
    return NextResponse.json({ product });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao atualizar" },
      { status: 400 },
    );
  }
}
