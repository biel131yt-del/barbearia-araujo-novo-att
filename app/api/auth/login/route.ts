import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  verifyPassword,
  createSession,
  auditLog,
  hashPassword,
} from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "E-mail e senha são obrigatórios" },
        { status: 400 },
      );
    }

    const [user] = await sql`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `;

    if (!user) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 },
      );
    }

    const valid = await verifyPassword(password, user.password_hash);

    if (!valid) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 },
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        { error: "Usuário desativado" },
        { status: 401 },
      );
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
