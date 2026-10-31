import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyPassword, createSession, auditLog, hashPassword } from "@/lib/auth";
import crypto from "crypto";

const ADMIN_DEFAULT_EMAIL = "admin@barbeariaaraujo.com";
const ADMIN_DEFAULT_PASSWORD = "admin123";
const PLACEHOLDER_HASH = "$2a$10$dummy.hash.placeholder";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "E-mail e senha são obrigatórios" }, { status: 400 });
    }

    const [user] = await sql`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `;

    if (!user) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    let valid = false;

    // Se o hash for o placeholder (primeiro acesso), aceita a senha padrão e corrige no banco
    if (user.password_hash === PLACEHOLDER_HASH && email === ADMIN_DEFAULT_EMAIL && password === ADMIN_DEFAULT_PASSWORD) {
      valid = true;
      const newHash = await hashPassword(ADMIN_DEFAULT_PASSWORD);
      await sql`UPDATE users SET password_hash = ${newHash} WHERE id = ${user.id}`;
    } else {
      valid = await verifyPassword(password, user.password_hash);
    }

    if (!valid) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    if (!user.is_active) {
      return NextResponse.json({ error: "Usuário desativado" }, { status: 401 });
    }

    await createSession(email);

    await auditLog({
      userId: user.id,
      action: "login",
      entityType: "user",
      entityId: user.id,
      newValues: { email },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
