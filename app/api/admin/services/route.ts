import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminUser } from "@/lib/auth";
export async function GET() {
  if (!(await getAdminUser()))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  return NextResponse.json({
    services: await sql`SELECT * FROM services ORDER BY name`,
  });
}
async function save(req: Request, editing: boolean) {
  if (!(await getAdminUser()))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  try {
    const b = await req.json();
    const { name, price_cents, duration_minutes } = b;
    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.length > 100 ||
      !Number.isInteger(price_cents) ||
      price_cents < 0 ||
      price_cents > 1000000 ||
      !Number.isInteger(duration_minutes) ||
      duration_minutes < 5 ||
      duration_minutes > 480
    )
      throw new Error(
        "Informe nome, preço válido e duração entre 5 e 480 minutos.",
      );
    if (b.image_url) {
      const u = new URL(b.image_url);
      if (u.protocol !== "https:")
        throw new Error("A foto deve usar um link HTTPS.");
    }
    if (editing && (!Number.isInteger(b.id) || b.id <= 0))
      throw new Error("Serviço inválido.");
    const rows = editing
      ? await sql`UPDATE services SET name=${name.trim()},description=${String(b.description || "").slice(0, 500)},price_cents=${price_cents},duration_minutes=${duration_minutes},image_url=${b.image_url || null},is_featured=${Boolean(b.is_featured)},is_active=${b.is_active !== false},updated_at=NOW() WHERE id=${b.id} RETURNING *`
      : await sql`INSERT INTO services(name,description,price_cents,duration_minutes,image_url,is_featured) VALUES(${name.trim()},${String(b.description || "").slice(0, 500)},${price_cents},${duration_minutes},${b.image_url || null},${Boolean(b.is_featured)}) RETURNING *`;
    if (!rows.length)
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 },
      );
    return NextResponse.json(
      { service: rows[0] },
      { status: editing ? 200 : 201 },
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao salvar serviço" },
      { status: 400 },
    );
  }
}
export async function POST(req: Request) {
  return save(req, false);
}
export async function PATCH(req: Request) {
  return save(req, true);
}
