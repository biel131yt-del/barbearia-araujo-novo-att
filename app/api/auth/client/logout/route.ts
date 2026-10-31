import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const CLIENT_SESSION_COOKIE = "barbearia_client_session";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(CLIENT_SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
