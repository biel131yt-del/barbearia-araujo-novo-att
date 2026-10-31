import { NextResponse } from "next/server";
import { publicSettings } from "@/lib/settings";
export async function GET() {
  return NextResponse.json(
    { settings: await publicSettings() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
