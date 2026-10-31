import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminUser } from "@/lib/auth";
import { validateSetting } from "@/lib/settings";
export async function GET() {
  if (!(await getAdminUser()))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  return NextResponse.json({
    settings: await sql`SELECT key,value,category FROM settings ORDER BY key`,
  });
}
export async function POST(req: Request) {
  if (!(await getAdminUser()))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  try {
    const b = await req.json();
    const entries = b.settings
      ? Object.entries(b.settings)
      : [[b.key, b.value]];
    if (!entries.length || entries.length > 30)
      throw new Error("Configurações inválidas.");
    const validated = entries.map(([key, value]) => ({
      key,
      value: validateSetting(key as string, value),
    }));
    await sql.transaction(
      validated.map(
        (e) =>
          sql`INSERT INTO settings(key,value,category) VALUES(${e.key},${e.value},'general') ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value,updated_at=NOW()`,
      ),
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Falha ao salvar" },
      { status: 400 },
    );
  }
}
