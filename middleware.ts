import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rotas administrativas exigem sessão
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login" || pathname === "/api/auth/login") {
      return NextResponse.next();
    }

    const cookieStore = await req.cookies;
    const token = cookieStore.get("barbearia_admin_session")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/auth/me", "/api/auth/logout"],
};
