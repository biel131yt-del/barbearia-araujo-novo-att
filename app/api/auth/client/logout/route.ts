import { NextResponse } from "next/server";
import { revokeSession } from "@/lib/auth-session";
export async function POST() {
  await revokeSession("client");
  return NextResponse.json({ ok: true });
}
