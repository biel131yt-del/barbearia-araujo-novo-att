import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json(
    { error: "Configuração inicial desativada" },
    { status: 410 },
  );
}
export const POST = GET;
