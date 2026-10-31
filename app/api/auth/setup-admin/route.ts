import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import crypto from "crypto";

const ADMIN_EMAIL = "admin@barbeariaaraujo.com";
const ADMIN_PASSWORD = "admin123";

export async function POST() {
  try {
    const passwordHash = crypto.createHash("sha256").update(ADMIN_PASSWORD).digest("hex");

    // Insere ou atualiza o admin com hash real
    const [user] = await sql`
      INSERT INTO users (name, email, password_hash, role, is_active)
      VALUES ('Administrador', ${ADMIN_EMAIL}, ${passwordHash}, 'admin', true)
      ON CONFLICT (email) DO UPDATE
      SET password_hash = EXCLUDED.password_hash,
          role = 'admin',
          is_active = true
      RETURNING id, name, email, role, is_active
    `;

    return NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      password: ADMIN_PASSWORD, // mostre apenas na primeira configuração
      note: "Altere esta senha após o primeiro acesso",
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Erro ao configurar admin" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const [user] = await sql`
      SELECT id, name, email, role, is_active FROM users WHERE email = ${ADMIN_EMAIL} LIMIT 1
    `;
    if (!user) {
      return NextResponse.json({ exists: false }, { status: 404 });
    }
    return NextResponse.json({ exists: true, user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Erro ao verificar admin" }, { status: 500 });
  }
}
