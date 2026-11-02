import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
export async function GET() {
  const user = await getAdminUser();
  const headers = { "Cache-Control": "private, no-store", Vary: "Cookie" };
  if (user?.role !== "admin")
    return NextResponse.json(
      { error: "Apenas administradores podem instalar este aplicativo." },
      { status: 403, headers },
    );
  return NextResponse.json(
    {
      id: "/admin",
      name: "Barbearia Araújo — Administração",
      short_name: "Araújo Admin",
      description:
        "Agenda, clientes e gestão. Acesso exclusivo do administrador.",
      start_url: "/admin",
      scope: "/admin",
      display: "standalone",
      background_color: "#0A2540",
      theme_color: "#0A2540",
      lang: "pt-BR",
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        {
          src: "/icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
      ],
    },
    { headers: { ...headers, "Content-Type": "application/manifest+json" } },
  );
}
