import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

import { issueSession } from "@/lib/auth-session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, birth_date } = body;
    const phone = String(body.phone || "").replace(/\D/g, "");

    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.length > 100 ||
      !/^\d{10,13}$/.test(phone) ||
      typeof password !== "string" ||
      password.length < 8 ||
      password.length > 128
    ) {
      return NextResponse.json(
        {
          error: "Informe nome, telefone válido e senha de 8 a 128 caracteres",
        },
        { status: 400 },
      );
    }

    // Verifica se já existe cliente com este telefone ou email
    const [existing] = await sql`
      SELECT id FROM clients WHERE regexp_replace(phone, '[^0-9]', '', 'g') = ${phone} LIMIT 1
    `;
    if (existing) {
      return NextResponse.json(
        { error: "Telefone já cadastrado" },
        { status: 409 },
      );
    }

    if (email) {
      const [existingEmail] = await sql`
        SELECT id FROM clients WHERE email = ${email} LIMIT 1
      `;
      if (existingEmail) {
        return NextResponse.json(
          { error: "E-mail já cadastrado" },
          { status: 409 },
        );
      }
    }

    const password_hash = await hashPassword(password);

    const [client] = await sql`
      INSERT INTO clients (name, phone, email, birth_date, status, loyalty_points, password_hash)
      VALUES (${name}, ${phone}, ${email ?? null}, ${birth_date ?? null}, 'active', 0, ${password_hash})
      RETURNING id, name, phone, email, status, loyalty_points, created_at
    `;

    await issueSession("client", client.id);
    return NextResponse.json(
      {
        client: {
          id: client.id,
          name: client.name,
          phone: client.phone,
          email: client.email,
          status: client.status,
          loyalty_points: client.loyalty_points,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    if (error.code === "23505")
      return NextResponse.json(
        { error: "Telefone já cadastrado. Entre na sua conta." },
        { status: 409 },
      );
    return NextResponse.json(
      { error: "Erro ao cadastrar cliente" },
      { status: 500 },
    );
  }
}
