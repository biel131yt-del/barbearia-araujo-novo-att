import { randomBytes, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { sql } from "./db";

type Kind = "admin" | "client";
const names = {
  admin: "barbearia_admin_session",
  client: "barbearia_client_session",
};
export async function issueSession(kind: Kind, subjectId: number) {
  const token = randomBytes(32).toString("hex");
  const seconds = (kind === "client" ? 180 : 7) * 86400;
  await sql`INSERT INTO auth_sessions (token_hash, kind, subject_id, expires_at)
    VALUES (${createHash("sha256").update(token).digest("hex")}, ${kind}, ${subjectId}, NOW() + ${seconds} * INTERVAL '1 second')`;
  (await cookies()).set(names[kind], token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: seconds,
  });
}
export async function sessionSubject(kind: Kind): Promise<number | null> {
  const token = (await cookies()).get(names[kind])?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const [session] =
    await sql`SELECT subject_id FROM auth_sessions WHERE token_hash = ${createHash("sha256").update(token).digest("hex")} AND kind = ${kind} AND expires_at > NOW()`;
  return session?.subject_id ?? null;
}
export async function revokeSession(kind: Kind) {
  const store = await cookies();
  const token = store.get(names[kind])?.value;
  if (token)
    await sql`DELETE FROM auth_sessions WHERE token_hash = ${createHash("sha256").update(token).digest("hex")}`;
  store.delete(names[kind]);
}
export async function getClientUser() {
  const id = await sessionSubject("client");
  if (!id) return null;
  const [client] =
    await sql`SELECT id, name, phone, email, status, loyalty_points, total_appointments, total_spent, last_appointment FROM clients WHERE id = ${id} AND status = 'active'`;
  return client ?? null;
}
