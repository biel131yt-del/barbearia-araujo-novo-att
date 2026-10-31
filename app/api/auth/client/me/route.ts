import { NextResponse } from "next/server";
import { getClientUser, revokeSession } from "@/lib/auth-session";
export async function GET() {
  const client = await getClientUser();
  return NextResponse.json({ client }, { status: client ? 200 : 401 });
}
export async function POST() {
  await revokeSession("client");
  return NextResponse.json({ ok: true });
}
