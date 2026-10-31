import { NextResponse } from "next/server";
import { getAdminUser, hashPassword, verifyPassword } from "@/lib/auth";
import { sql } from "@/lib/db";
import { issueSession } from "@/lib/auth-session";
export async function POST(req: Request) {
  const user = await getAdminUser();
  if (!user)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { current_password, new_password } = await req.json();
  if (
    typeof current_password !== "string" ||
    typeof new_password !== "string" ||
    new_password.length < 8 ||
    new_password.length > 128
  )
    return NextResponse.json(
      { error: "A nova senha deve ter de 8 a 128 caracteres." },
      { status: 400 },
    );
  const [stored] =
    await sql`SELECT password_hash FROM users WHERE id=${user.id}`;
  if (!(await verifyPassword(current_password, stored.password_hash)))
    return NextResponse.json(
      { error: "Senha atual incorreta." },
      { status: 400 },
    );
  const hash = await hashPassword(new_password);
  await sql.transaction([
    sql`UPDATE users SET password_hash=${hash},updated_at=NOW() WHERE id=${user.id}`,
    sql`DELETE FROM auth_sessions WHERE kind='admin' AND subject_id=${user.id}`,
  ]);
  await issueSession("admin", user.id);
  return NextResponse.json({ ok: true });
}
