"use client";

import React from "react";
import Link from "next/link";
import { Scissors, Phone, Menu, X, Clock } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/utils";

export default function Header() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-brand-950/80 backdrop-blur-md supports-[backdrop-filter]:bg-brand-950/60">
        <div className="container-mobile flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            onClick={() => setOpen(false)}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-glow-red-sm group-hover:shadow-glow-red transition-all duration-300">
              <Scissors className="h-5 w-5" />
            </div>
            <div className="leading-tight hidden md:block">
              <p className="font-display text-xl tracking-wide text-white">
                BARBEARIA ARAUJO
              </p>
              <p className="text-[11px] font-medium tracking-widest text-slate-400">
                ESTILO É ATITUDE
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <a
              href={WHATSAPP_LINK("Quero agendar um horário na Barbearia Araujo")}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Falar no WhatsApp"
              className="hidden sm:flex h-11 w-11 items-center justify-center rounded-full bg-green-500 text-white shadow-card hover:shadow-glow-red transition-all duration-300 hover:scale-105 press"
            >
              <Phone className="h-6 w-6" />
            </a>
            <button
              onClick={() => setOpen(true)}
              className="md:hidden h-11 w-11 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {open && (
          <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setOpen(false)} />
        )}
        {/* Mobile Menu Panel */}
        {open && (
          <div className="fixed inset-y-0 left-0 z-[70] w-full md:w-72 bg-brand-950/95 backdrop-blur border-r border-white/10 transform translate-x-full md:translate-x-0 transition-transform duration-300 ease-in-out md:static md:translate-x-full md:flex md:flex-col md:justify-between md:h-auto md:w-auto md:inset-0 md:border-0 md:bg-transparent">
            <div className="container-mobile py-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-glow-red-sm">
                    <Scissors className="h-5 w-5" />
                  </div>
                  <div className="leading-tight">
                    <p className="font-display text-xl tracking-wide text-white">
                      BARBEARIA ARAUJO
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="h-10 w-10 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors press"
                  aria-label="Fechar menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="space-y-2">
                <a
                  href={WHATSAPP_LINK("Quero agendar um horário na Barbearia Araujo")}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 text-lg font-semibold text-white shadow-card hover:shadow-glow-red transition-all press"
                >
                  <Phone className="h-5 w-5" /> Falar no WhatsApp
                </a>
                <a
                  href="/agendar"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg font-semibold text-white hover:bg-white/10 transition-all press"
                  onClick={() => setOpen(false)}
                >
                  <Clock className="h-5 w-5" /> Agendar horário
                </a>
                <a
                  href="#servicos"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg font-semibold text-white hover:bg-white/10 transition-all press"
                  onClick={() => setOpen(false)}
                >
                  Serviços
                </a>
                <a
                  href="#como-funciona"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg font-semibold text-white hover:bg-white/10 transition-all press"
                  onClick={() => setOpen(false)}
                >
                  Como funciona
                </a>
              </nav>
            </div>
            <div className="p-4 border-t border-white/10">
              <button
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all press"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
