import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminUser, auditLog } from "@/lib/auth";

export async function GET() {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const reviews = await sql`
    SELECT r.*, c.name as client_name
    FROM reviews r
    LEFT JOIN clients c ON r.client_id = c.id
    ORDER BY r.created_at DESC
    LIMIT 100
  `;

  const [avg] = await sql`SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0) as avg FROM reviews`;
  const [total] = await sql`SELECT COUNT(*) as count FROM reviews`;

  await auditLog({
    userId: user.id,
    action: "view_reviews",
    entityType: "reviews",
  });

  return NextResponse.json({
    reviews,
    avg_rating: Number(avg.avg),
    total: Number(total.count),
  });
}
