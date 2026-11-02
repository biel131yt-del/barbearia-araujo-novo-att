import { sql } from "@/lib/db";
import { User } from "@/lib/db";
import crypto from "crypto";

import { issueSession, sessionSubject, revokeSession } from "./auth-session";
import { promisify } from "node:util";
const scrypt = promisify(crypto.scrypt);
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const key = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${key.toString("hex")}`;
}
export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  if (
    typeof plain !== "string" ||
    typeof hash !== "string" ||
    plain.length > 128
  )
    return false;
  if (hash.startsWith("scrypt:")) {
    const [, salt, value] = hash.split(":");
    if (!salt || !/^[a-f0-9]{128}$/.test(value || "")) return false;
    const computed = (await scrypt(plain, salt, 64)) as Buffer;
    return crypto.timingSafeEqual(computed, Buffer.from(value, "hex"));
  }
  if (!/^[a-f0-9]{64}$/.test(hash)) return false;
  return crypto.timingSafeEqual(
    crypto.createHash("sha256").update(plain).digest(),
    Buffer.from(hash, "hex"),
  );
}
export async function getAdminUser(): Promise<User | null> {
  const id = await sessionSubject("admin");
  if (!id) return null;
  const [user] =
    await sql`SELECT id, name, email, role, is_active FROM users WHERE id = ${id} AND is_active = true AND role = 'admin'`;
  return (user ?? null) as User | null;
}
export async function createSession(email: string) {
  const [user] =
    await sql`SELECT id FROM users WHERE email = ${email} AND is_active = true`;
  if (!user) throw new Error("Usuário inválido");
  await issueSession("admin", user.id);
}
export async function destroySession() {
  await revokeSession("admin");
}

export async function auditLog({
  userId,
  action,
  entityType,
  entityId,
  oldValues,
  newValues,
  ip,
  userAgent,
}: {
  userId?: number | null;
  action: string;
  entityType: string;
  entityId?: number | null;
  oldValues?: any;
  newValues?: any;
  ip?: string | null;
  userAgent?: string | null;
}) {
  try {
    await sql`
      INSERT INTO audit_log (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
      VALUES (${userId ?? null}, ${action}, ${entityType}, ${entityId ?? null},
              ${oldValues ? JSON.stringify(oldValues) : null},
              ${newValues ? JSON.stringify(newValues) : null},
              ${ip ?? null}, ${userAgent ?? null})
    `;
  } catch (e) {
    console.error("Audit log error:", e);
  }
}

export function requireAdmin(user: User | null): asserts user is User {
  if (!user) {
    throw new Error("Acesso não autorizado");
  }
}
