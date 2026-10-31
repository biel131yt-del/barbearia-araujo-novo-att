import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, service, price, date, time } = body;

    if (!name || !phone || !service || !date || !time) {
      return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });
    }

    await sql`
      INSERT INTO appointments (name, phone, service, price, date, time)
      VALUES (${name}, ${phone}, ${service}, ${price}, ${date}, ${time})
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao agendar" }, { status: 500 });
  }
}
