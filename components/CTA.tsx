"use client";

import Link from "next/link";
import { CalendarCheck, MessageCircle as WhatsAppIcon } from "lucide-react";
import { usePublicSettings, contactLink } from "@/lib/public-settings";

export default function CTA() {
  const settings = usePublicSettings();
  return (
    <section className="mt-16 md:mt-24">
      <div className="container-mobile">
        <div className="rounded-[2.5rem] border-2 border-dashed border-red-500/50 bg-red-500/5 p-8 md:p-12 text-center shadow-card relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-red-500 via-orange-500 to-amber-500" />
          <div className="relative z-10">
            <p className="font-display text-4xl tracking-wide text-red-400 md:text-5xl mb-3">
              Seu próximo visual
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-300 md:text-base lg:max-w-lg">
              Escolha seu serviço e reserve um horário disponível pelo
              aplicativo.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/agendar" className="flex-1 sm:flex-none">
                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all active:scale-[0.98] h-14 px-8 text-lg press w-full bg-accent text-white shadow-glow-red hover:shadow-glow-red hover:brightness-110">
                  <CalendarCheck className="h-5 w-5" />
                  Agendar Agora
                </button>
              </Link>
              <a
                href={contactLink(
                  settings.telefone_whatsapp,
                  "Olá! Gostaria de saber mais sobre os serviços.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none"
              >
                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all active:scale-[0.98] h-14 px-8 text-lg press w-full border-2 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white">
                  <WhatsAppIcon className="h-5 w-5" />
                  Fale no WhatsApp
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
