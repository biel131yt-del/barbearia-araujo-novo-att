import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
export async function GET() {
  const services =
    await sql`SELECT s.id,s.name,s.description,s.duration_minutes,s.image_url,s.is_featured,s.price_cents AS original_price_cents,
 COALESCE(p.price_cents,s.price_cents) AS price_cents,p.title AS promotion_title
 FROM services s LEFT JOIN service_promotions p ON p.service_id=s.id AND p.is_active=true
 AND (NOW() AT TIME ZONE 'America/Sao_Paulo')::date BETWEEN p.valid_from AND p.valid_until AND p.price_cents<s.price_cents
 WHERE s.is_active=true ORDER BY s.is_featured DESC,s.name`;
  return NextResponse.json({ services });
}
