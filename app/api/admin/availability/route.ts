import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import { localDate, validDate, minutes } from "@/lib/availability";
export async function GET() {
  if (!(await getAdminUser()))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const windows =
    await sql`SELECT id, work_date::text, start_time, end_time FROM availability_windows WHERE work_date >= ${localDate()} ORDER BY work_date, start_time LIMIT 500`;
  return NextResponse.json({ windows });
}
export async function POST(req: Request) {
  if (!(await getAdminUser()))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  try {
    const { dates, windows } = await req.json();
    if (
      !Array.isArray(dates) ||
      !dates.length ||
      dates.length > 62 ||
      !dates.every(
        (d) => typeof d === "string" && validDate(d) && d >= localDate(),
      ) ||
      !Array.isArray(windows) ||
      windows.length > 8
    )
      throw new Error("Selecione datas futuras e até oito períodos por dia.");
    const sorted = [...windows].sort((a, b) =>
      String(a.start_time).localeCompare(String(b.start_time)),
    );
    for (let i = 0; i < sorted.length; i++) {
      const w = sorted[i];
      if (
        ![w.start_time, w.end_time].every(
          (t) => typeof t === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(t),
        ) ||
        minutes(w.start_time) >= minutes(w.end_time) ||
        (i && minutes(sorted[i - 1].end_time) > minutes(w.start_time))
      )
        throw new Error(
          "Os períodos devem ter início anterior ao fim e não podem se sobrepor.",
        );
    }
    const uniqueDates = [...new Set(dates)];
    const rows = uniqueDates.flatMap((work_date) =>
      sorted.map((w) => ({ ...w, work_date })),
    );
    await sql.transaction([
      sql`DELETE FROM availability_windows WHERE work_date = ANY(${uniqueDates}::date[])`,
      sql`INSERT INTO availability_windows(work_date,start_time,end_time) SELECT work_date,start_time,end_time FROM jsonb_to_recordset(${JSON.stringify(rows)}::jsonb) AS x(work_date date,start_time time,end_time time)`,
    ]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao salvar disponibilidade",
      },
      { status: 400 },
    );
  }
}
