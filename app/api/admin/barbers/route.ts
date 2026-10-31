import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { sql } from "@/lib/db";
export async function GET() {
  if (!(await getAdminUser()))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  return NextResponse.json({
    barbers: await sql`SELECT * FROM barbers ORDER BY name`,
  });
}
async function save(req: Request, edit: boolean) {
  if (!(await getAdminUser()))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  try {
    const b = await req.json();
    if (
      typeof b.name !== "string" ||
      !b.name.trim() ||
      b.name.length > 100 ||
      (edit && !Number.isInteger(b.id))
    )
      throw new Error("Informe nome válido.");
    if (
      !["none", "percent", "fixed"].includes(b.commission_type) ||
      !Number.isFinite(b.commission_value) ||
      b.commission_value < 0 ||
      (b.commission_type === "percent" && b.commission_value > 100)
    )
      throw new Error("Comissão inválida.");
    const rows = edit
      ? await sql`UPDATE barbers SET name=${b.name.trim()},phone=${b.phone || null},email=${b.email || null},commission_type=${b.commission_type},commission_value=${b.commission_value},is_active=${b.is_active !== false},updated_at=NOW() WHERE id=${b.id} RETURNING *`
      : await sql`INSERT INTO barbers(name,phone,email,commission_type,commission_value,is_active) VALUES(${b.name.trim()},${b.phone || null},${b.email || null},${b.commission_type},${b.commission_value},${b.is_active !== false}) RETURNING *`;
    return NextResponse.json({ barber: rows[0] }, { status: edit ? 200 : 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao salvar" },
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
