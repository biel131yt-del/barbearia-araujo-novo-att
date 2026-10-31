import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminUser } from "@/lib/auth";

export async function GET() {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const rows = await sql`SELECT * FROM barbers ORDER BY name ASC`;
  return NextResponse.json({ barbers: rows });
}
