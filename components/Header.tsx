"use client";
import { useState } from "react";
import Link from "next/link";
import { Scissors, Menu, X } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/utils";
export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-brand-950/95 backdrop-blur">
      <div className="container-mobile h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <Scissors className="text-red-400" />
          <span className="font-display text-xl tracking-wide text-white">
            BARBEARIA ARAÚJO
          </span>
        </Link>
        <nav
          aria-label="Navegação principal"
          className="hidden md:flex gap-6 items-center text-sm text-slate-300"
        >
          <Link href="/#servicos">Serviços</Link>
          <Link href="/cliente">Minha conta</Link>
          <Link
            href="/agendar"
            className="rounded-xl bg-accent px-4 py-2 text-white font-semibold"
          >
            Agendar
          </Link>
        </nav>
        <button
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="md:hidden p-2 text-white"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav
          id="mobile-menu"
          aria-label="Menu do celular"
          className="md:hidden border-t border-white/10 p-4 space-y-2 bg-brand-950"
        >
          {[
            ["Agendar horário", "/agendar"],
            ["Minha conta", "/cliente"],
            ["Serviços", "/#servicos"],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-3 text-white hover:bg-white/10"
            >
              {label}
            </Link>
          ))}
          <a
            href={WHATSAPP_LINK("Olá! Tenho uma dúvida sobre o atendimento.")}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-xl px-4 py-3 text-green-400"
          >
            Falar no WhatsApp
          </a>
        </nav>
      )}
    </header>
  );
}
