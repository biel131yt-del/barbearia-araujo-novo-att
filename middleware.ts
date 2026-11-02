import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rotas administrativas exigem sessão
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login" || pathname === "/api/auth/login") {
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-barbearia-page", pathname);
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    const cookieStore = await req.cookies;
    const token = cookieStore.get("barbearia_admin_session")?.value;
    if (!token) {
      const login = new URL("/admin/login", req.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-barbearia-page", pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/",
    "/agendar",
    "/cliente/:path*",
    "/admin/:path*",
    "/api/auth/me",
    "/api/auth/logout",
  ],
};
