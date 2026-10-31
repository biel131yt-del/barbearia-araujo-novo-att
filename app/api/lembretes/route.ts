import { localDate } from "@/lib/availability";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const today = localDate();
    const appointments = await sql`
      SELECT * FROM appointments
      WHERE appointment_date = ${today} AND whatsapp_confirmed = FALSE
    `;

    // Aqui você integraria com a API do WhatsApp para enviar lembretes
    console.log(`Lembretes para ${today}:`, appointments.length);

    return NextResponse.json({ count: appointments.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}
