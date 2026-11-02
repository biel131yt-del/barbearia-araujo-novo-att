import { NextResponse } from "next/server";
import { getClientUser } from "@/lib/auth-session";
import { sql } from "@/lib/db";
export async function POST(req: Request) {
  const client = await getClientUser();
  if (!client)
    return NextResponse.json(
      { error: "Entre na sua conta para avaliar." },
      { status: 401 },
    );
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  const { appointment_id, rating, comment } = body;
  if (
    !Number.isInteger(appointment_id) ||
    appointment_id < 1 ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5 ||
    (comment !== undefined &&
      (typeof comment !== "string" || comment.length > 1000))
  )
    return NextResponse.json(
      {
        error: "Escolha de 1 a 5 estrelas. Comentário de até 1000 caracteres.",
      },
      { status: 400 },
    );
  try {
    const [review] =
      await sql`WITH saved AS(INSERT INTO reviews(client_id,appointment_id,rating,comment) SELECT client_id,id,${rating},${typeof comment === "string" ? comment.trim() || null : null} FROM appointments WHERE id=${appointment_id} AND client_id=${client.id} AND status='completed' RETURNING id,rating,comment,appointment_id),cancelled AS(UPDATE push_jobs SET state='cancelled' WHERE notification_id IN(SELECT rr.notification_id FROM review_requests rr JOIN saved s ON s.appointment_id=rr.appointment_id) AND state IN ('pending','waiting_subscription') RETURNING id) SELECT id,rating,comment FROM saved`;
    if (!review)
      return NextResponse.json(
        { error: "Atendimento concluído não encontrado na sua conta." },
        { status: 404 },
      );
    return NextResponse.json({ review }, { status: 201 });
  } catch (e) {
    if ((e as { code?: string }).code === "23505")
      return NextResponse.json(
        { error: "Este atendimento já foi avaliado." },
        { status: 409 },
      );
    console.error("Erro ao salvar avaliação");
    return NextResponse.json(
      { error: "Não foi possível salvar sua avaliação. Tente novamente." },
      { status: 500 },
    );
  }
}
