import type { Metadata, Viewport } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import AppManifest from "@/components/AppManifest";
import ThemeProvider from "@/components/ThemeProvider";
import InstallApp from "@/components/InstallApp";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Barbearia Araujo — Agende seu corte",
  description:
    "Agende corte, barba e combo na Barbearia Araujo. Rápido, pelo celular, com reserva pelo aplicativo.",
  icons: [
    { rel: "icon", type: "image/svg+xml", url: "/icon.svg" },
    { rel: "icon", url: "/icon-192.png" },
    { rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
  ],
  appleWebApp: { capable: true, statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#0A2540",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = (await headers()).get("x-barbearia-page") || "/";
  const adminArea = pathname.startsWith("/admin");
  const admin = adminArea ? await getAdminUser() : null;
  if (adminArea && pathname !== "/admin/login" && admin?.role !== "admin")
    redirect(`/admin/login?next=${encodeURIComponent(pathname)}`);
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <AppManifest initialAdmin={admin?.role === "admin"} />
      </head>
      <body
        className={`${inter.variable} ${bebasNeue.variable} bg-brand-950 text-slate-100 antialiased`}
      >
        <ThemeProvider />
        {children}
        <InstallApp />
      </body>
    </html>
  );
}
