import { NextResponse } from "next/server";
import { listPushDevices } from "@/lib/webpush";
import { getAdminUser } from "@/lib/auth";

export async function GET() {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const devices = await listPushDevices(user.id);
  return NextResponse.json({ devices });
}
