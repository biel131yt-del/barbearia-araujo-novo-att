"use client";

import { Calendar, User, Clock as ClockIcon, MapPin } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Booking() {
  return (
    <section className="mt-16 md:mt-24">
      <div className="container-mobile">
        <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-brand-900 via-brand-950 to-brand-900 p-8 md:p-12 shadow-card overflow-hidden relative">
          {/* Decorative top-right */}
          <div className="absolute top-[-60px] right-[-60px] h-40 w-40 rounded-full bg-red-500/10 blur-3xl" />

          <div className="relative z-10 grid gap-8 md:grid-cols-2 items-start">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Escolha o dia</h3>
                  <p className="text-sm text-slate-400">
                    Agende com antecedência e garanta seu horário.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <ClockIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Escolha a hora</h3>
                  <p className="text-sm text-slate-400">
                    Só aparecem os horários disponíveis.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Confirme seu contato</h3>
                  <p className="text-sm text-slate-400">
                    Receba a confirmação pelo WhatsApp.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur">
              <h4 className="font-bold text-white mb-4">Pronto para agendar?</h4>
              <p className="text-sm text-slate-400 mb-6">
                Fale conosco pelo WhatsApp e reserve seu horário agora mesmo.
              </p>
              <a
                href={WHATSAPP_LINK("Quero agendar meu horário na Barbearia Araujo")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full rounded-xl font-semibold transition-all active:scale-[0.98] h-14 px-6 text-lg bg-accent text-white shadow-glow-red hover:shadow-glow-red hover:brightness-105 press"
              >
                <MapPin className="h-5 w-5" />
                Falar no WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
