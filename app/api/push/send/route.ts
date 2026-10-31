import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { getClientUser } from "@/lib/auth-session";
import { sql } from "@/lib/db";
import { drainPushJobs } from "@/lib/push-jobs";
export async function POST(req: Request) {
  const b = await req.json();
  const client = b.audience === "client" ? await getClientUser() : null;
  const user = b.audience !== "client" ? await getAdminUser() : null;
  if (!client && !user)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const [n] =
    await sql`INSERT INTO notifications(user_id,client_id,title,message,type,link) VALUES(${user?.id ?? null},${client?.id ?? null},'Teste de notificações','Se você recebeu este alerta, o push está funcionando neste aparelho.','info',${user ? "/admin/notificacoes" : "/cliente"}) RETURNING id`;
  await sql`INSERT INTO push_jobs(notification_id) VALUES(${n.id})`;
  const result = await drainPushJobs();
  const [job] =
    await sql`SELECT state,last_error FROM push_jobs WHERE notification_id=${n.id}`;
  return NextResponse.json({
    state: job.state,
    configured: result.configured,
    message:
      job.state === "accepted"
        ? "Serviço push aceitou o envio. Confira o aparelho; isso não comprova a entrega."
        : job.state === "waiting_subscription"
          ? "Ative as notificações neste aparelho primeiro."
          : "Envio pendente. A notificação também está salva no aplicativo.",
  });
}
