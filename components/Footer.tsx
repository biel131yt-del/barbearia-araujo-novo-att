"use client";

import Link from "next/link";
import { Scissors, Phone, MapPin, Instagram, Facebook } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/utils";

export default function Footer() {
  return (
    <footer className="mt-16 md:mt-24 border-t border-white/10 bg-brand-950/80 backdrop-blur pt-12 pb-8">
      <div className="container-mobile">
        <div className="flex flex-col items-center gap-6 mb-10 md:flex-row md:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-glow-red-sm">
              <Scissors className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="font-display text-xl tracking-wide text-white">
                BARBEARIA ARAUJO
              </p>
              <p className="text-[11px] font-medium tracking-widest text-slate-400">
                ESTILO É ATITUDE
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <a
              href="https://instagram.com/barbeariaaraujo"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors press"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://facebook.com/barbeariaaraujo"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors press"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 text-center md:text-left">
          <div>
            <p className="font-bold text-white mb-3">Endereço</p>
            <p className="text-sm text-slate-400 flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-slate-500" />
              Manoel Olavo da Rosa, 1044
            </p>
          </div>
          <div>
            <p className="font-bold text-white mb-3">Contato</p>
            <p className="text-sm text-slate-400 flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-slate-500" />
              <a
                href={WHATSAPP_LINK("Oi!")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                (51) 96824-2866
              </a>
            </p>
          </div>
          <div>
            <p className="font-bold text-white mb-3">Horário</p>
            <p className="text-sm text-slate-400">
              Ter a Sáb: 9h às 19h<br />
              <span className="text-slate-500">Domingo e Segunda: fechado</span>
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-slate-500 tracking-widest uppercase">
            Barbearia Araujo. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
