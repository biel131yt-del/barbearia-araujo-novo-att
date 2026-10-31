import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyPassword } from "@/lib/auth";
import { cookies } from "next/headers";

const CLIENT_SESSION_COOKIE = "barbearia_client_session";

export async function POST(req: Request) {
  try {
    const { phone, password } = await req.json();

    if (!phone || !password) {
      return NextResponse.json(
        { error: "Telefone e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const [client] = await sql`
      SELECT * FROM clients WHERE phone = ${phone} LIMIT 1
    `;

    if (!client) {
      return NextResponse.json(
        { error: "Telefone ou senha inválidos" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, client.password_hash || "");
    if (!valid) {
      return NextResponse.json(
        { error: "Telefone ou senha inválidos" },
        { status: 401 }
      );
    }

    if (client.status !== "active") {
      return NextResponse.json(
        { error: "Cliente desativado" },
        { status: 401 }
      );
    }

    // Cria sessão do cliente via cookie
    const cookieStore = await cookies();
    cookieStore.set(CLIENT_SESSION_COOKIE, String(client.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return NextResponse.json({
      client: {
        id: client.id,
        name: client.name,
        phone: client.phone,
        email: client.email,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Erro ao fazer login" },
      { status: 500 }
    );
  }
}
