import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";

export async function GET() {
  const user = await getAdminUser();
  return NextResponse.json({ user });
}
