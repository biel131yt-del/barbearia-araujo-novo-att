import type { Metadata, Viewport } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const bebasNeue = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-display" });

export const metadata: Metadata = {
  title: "Barbearia Araujo — Agende seu corte",
  description:
    "Agende corte, barba e combo na Barbearia Araujo. Rápido, pelo celular, com confirmação no WhatsApp.",
  icons: [
    { rel: "icon", type: "image/x-icon", sizes: "16x16", url: "/favicon.ico" },
    { rel: "icon", url: "/icon-192.png" },
    { rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
  ],
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0A2540",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${bebasNeue.variable} bg-brand-950 text-slate-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}
