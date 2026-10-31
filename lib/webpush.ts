import webpush from "web-push";
import { sql } from "@/lib/db";

/* ============================================================================
   VAPID KEYS
   Gere um par de chaves uma única vez e armazene nas settings do Neon.
   Para gerar localmente:
     node -e "const w=require('web-push'); console.log(w.generateVAPIDKeys())"
   Depois defina as env vars:
     VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL
   ============================================================================ */

export function getVapidKeys() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const email = process.env.VAPID_EMAIL || "admin@barbeariaaraujo.com";

  if (!publicKey || !privateKey) {
    return null;
  }

  return { publicKey, privateKey, email };
}

export function ensureVapidConfigured() {
  const keys = getVapidKeys();
  if (!keys) {
    throw new Error(
      "VAPID not configured. Set VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY and VAPID_EMAIL environment variables."
    );
  }
  webpush.setVapidDetails(
    `mailto:${keys.email}`,
    keys.publicKey,
    keys.privateKey
  );
  return keys;
}

/* ============================================================================
   ENVIAR NOTIFICAÇÃO PUSH PARA UM DISPOSITIVO
   ============================================================================ */

export async function sendPushNotification(
  subscription: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  },
  payload: { title: string; body: string; link?: string; type?: string }
) {
  const keys = ensureVapidConfigured();

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        link: payload.link,
        type: payload.type || "info",
        timestamp: Date.now(),
      })
    );
    return { success: true };
  } catch (err: any) {
    if (err.statusCode === 410 || err.statusCode === 404) {
      return { success: false, reason: "subscription_expired", statusCode: err.statusCode };
    }
    throw err;
  }
}

/* ============================================================================
   REGISTRAR DISPOSITIVO PUSH
   ============================================================================ */

export async function registerPushDevice({
  userId,
  endpoint,
  p256dh_key,
  auth_key,
  user_agent,
}: {
  userId: number;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  user_agent?: string | null;
}) {
  await sql`DELETE FROM push_devices WHERE endpoint = ${endpoint}`;

  const [device] = await sql`
    INSERT INTO push_devices (user_id, endpoint, p256dh_key, auth_key, user_agent)
    VALUES (${userId}, ${endpoint}, ${p256dh_key}, ${auth_key}, ${user_agent ?? null})
    RETURNING *
  `;

  return device;
}

/* ============================================================================
   REMOVER DISPOSITIVO PUSH
   ============================================================================ */

export async function removePushDevice(endpoint: string) {
  await sql`DELETE FROM push_devices WHERE endpoint = ${endpoint}`;
}

/* ============================================================================
   LISTAR DISPOSITIVOS DE UM USUÁRIO
   ============================================================================ */

export async function listPushDevices(userId: number) {
  const rows = await sql`
    SELECT id, endpoint, p256dh_key, auth_key, user_agent, created_at, last_used_at
    FROM push_devices
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
  return rows;
}

/* ============================================================================
   ATUALIZAR ÚLTIMO USO DO DISPOSITIVO
   ============================================================================ */

export async function touchPushDevice(endpoint: string) {
  await sql`
    UPDATE push_devices SET last_used_at = NOW() WHERE endpoint = ${endpoint}
  `;
}
