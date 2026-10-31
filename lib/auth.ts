import { sql } from "@/lib/db";
import { cookies } from "next/headers";
import { User } from "@/lib/db";
import crypto from "crypto";

const SESSION_COOKIE = "barbearia_admin_session";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 dias

export async function hashPassword(password: string): Promise<string> {
  // Usa o crypto do Node.js (disponível em API Routes e Edge)
  const hashBuffer = crypto.createHash("sha256").update(password).digest();
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  const computed = await hashPassword(plain);
  return computed === hash;
}

export async function getAdminUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const [user] = await sql`
      SELECT * FROM users WHERE email = ${token} AND is_active = true LIMIT 1
    `;
    return (user ?? null) as User | null;
  } catch {
    return null as User | null;
  }
}

export async function createSession(email: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
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
