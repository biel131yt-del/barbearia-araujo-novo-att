import { NextResponse } from "next/server";
import { registerPushDevice, removePushDevice } from "@/lib/webpush";
import { getAdminUser, auditLog } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { endpoint, keys, user_agent } = await req.json();
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: "Subscription inválida" }, { status: 400 });
    }

    await registerPushDevice({
      userId: user.id,
      endpoint,
      p256dh_key: keys.p256dh,
      auth_key: keys.auth,
      user_agent: user_agent ?? null,
    });

    await auditLog({
      userId: user.id,
      action: "push_subscribe",
      entityType: "push_device",
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao registrar dispositivo" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { endpoint } = await req.json();
    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint é obrigatório" }, { status: 400 });
    }

    await removePushDevice(endpoint);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao remover dispositivo" }, { status: 500 });
  }
}
