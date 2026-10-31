import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { name, phone, email, password, birth_date } = await req.json();

    if (!name || !phone || !password) {
      return NextResponse.json(
        { error: "Nome, telefone e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Verifica se já existe cliente com este telefone ou email
    const [existing] = await sql`
      SELECT id FROM clients WHERE phone = ${phone} LIMIT 1
    `;
    if (existing) {
      return NextResponse.json(
        { error: "Telefone já cadastrado" },
        { status: 409 }
      );
    }

    if (email) {
      const [existingEmail] = await sql`
        SELECT id FROM clients WHERE email = ${email} LIMIT 1
      `;
      if (existingEmail) {
        return NextResponse.json(
          { error: "E-mail já cadastrado" },
          { status: 409 }
        );
      }
    }

    const password_hash = await hashPassword(password);

    const [client] = await sql`
      INSERT INTO clients (name, phone, email, birth_date, status, loyalty_points)
      VALUES (${name}, ${phone}, ${email ?? null}, ${birth_date ?? null}, 'active', 0)
      RETURNING id, name, phone, email, status, loyalty_points, created_at
    `;

    return NextResponse.json({
      client: {
        id: client.id,
        name: client.name,
        phone: client.phone,
        email: client.email,
        status: client.status,
        loyalty_points: client.loyalty_points,
      },
    }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Erro ao cadastrar cliente" },
      { status: 500 }
    );
  }
}
