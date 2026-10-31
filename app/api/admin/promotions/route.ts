import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import { validDate } from "@/lib/availability";
export async function GET() {
  if (!(await getAdminUser()))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  return NextResponse.json({
    promotions:
      await sql`SELECT p.*,s.name AS service_name FROM service_promotions p JOIN services s ON s.id=p.service_id ORDER BY p.valid_until DESC`,
  });
}
export async function POST(req: Request) {
  if (!(await getAdminUser()))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  try {
    const b = await req.json();
    if (
      !Number.isInteger(b.service_id) ||
      typeof b.title !== "string" ||
      !b.title.trim() ||
      b.title.length > 100 ||
      !Number.isInteger(b.price_cents) ||
      b.price_cents < 0 ||
      !validDate(b.valid_from || "") ||
      !validDate(b.valid_until || "") ||
      b.valid_until < b.valid_from
    )
      throw new Error("Preencha serviço, título, preço e período válidos.");
    const [service] =
      await sql`SELECT price_cents FROM services WHERE id=${b.service_id}`;
    if (!service || b.price_cents >= service.price_cents)
      throw new Error("O preço promocional deve ser menor que o preço normal.");
    await sql`INSERT INTO service_promotions(service_id,title,price_cents,valid_from,valid_until,is_active) VALUES(${b.service_id},${b.title.trim()},${b.price_cents},${b.valid_from},${b.valid_until},${b.is_active !== false}) ON CONFLICT(service_id) DO UPDATE SET title=EXCLUDED.title,price_cents=EXCLUDED.price_cents,valid_from=EXCLUDED.valid_from,valid_until=EXCLUDED.valid_until,is_active=EXCLUDED.is_active`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro ao salvar promoção" },
      { status: 400 },
    );
  }
}
