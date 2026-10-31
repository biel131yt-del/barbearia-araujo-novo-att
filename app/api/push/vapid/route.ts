import { NextResponse } from "next/server";
import { getVapidKeys } from "@/lib/webpush";

export async function GET() {
  const keys = getVapidKeys();
  if (!keys) {
    return NextResponse.json(
      { error: "VAPID keys not configured. Set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY and VAPID_EMAIL env vars." },
      { status: 500 }
    );
  }
  return NextResponse.json({ publicKey: keys.publicKey });
}
