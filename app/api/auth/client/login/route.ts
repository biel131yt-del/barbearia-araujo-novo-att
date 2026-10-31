import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyPassword } from "@/lib/auth";
import { issueSession } from "@/lib/auth-session";


export async function POST(req: Request) {
  try {
    const { phone, password } = await req.json();

    if (!phone || !password) {
      return NextResponse.json(
        { error: "Telefone e senha são obrigatórios" },
        { status: 400 },
      );
    }

    const [client] = await sql`
      SELECT * FROM clients WHERE regexp_replace(phone, '[^0-9]', '', 'g') = ${String(phone).replace(/\D/g, "")} LIMIT 1
    `;

    if (!client) {
      return NextResponse.json(
        { error: "Telefone ou senha inválidos" },
        { status: 401 },
      );
    }

    const valid = await verifyPassword(password, client.password_hash || "");
    if (!valid) {
      return NextResponse.json(
        { error: "Telefone ou senha inválidos" },
        { status: 401 },
      );
    }

    if (client.status !== "active") {
      return NextResponse.json(
        { error: "Cliente desativado" },
        { status: 401 },
      );
    }

    await issueSession("client", client.id);

    return NextResponse.json({
      client: {
        id: client.id,
        name: client.name,
        phone: client.phone,
        email: client.email,
      },
    });
  } catch {
    return NextResponse.json({ error: "Erro ao fazer login" }, { status: 500 });
  }
}
