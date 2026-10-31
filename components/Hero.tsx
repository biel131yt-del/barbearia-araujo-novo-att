"use client";

import Link from "next/link";
import { Star, CalendarCheck, MapPin, Clock, ChevronRight } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-brand-600 via-brand-900 to-brand-950 p-6 text-white md:mt-10 md:grid md:grid-cols-2 md:gap-10 md:p-12"
      style={{ minHeight: "520px" }}
    >
      {/* Decorative scissors pattern */}
      <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 opacity-[0.08] md:opacity-[0.12]">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white"
        >
          <circle cx="6" cy="6" r="3" />
          <path d="M8.12 8.12 12 12" />
          <path d="M20 4 8.12 15.88" />
          <circle cx="6" cy="18" r="3" />
          <path d="M14.8 14.8 20 20" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col gap-4 md:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide"
        >
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          4.9 ★ • +500 cortes realizados
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mt-2"
        >
          <h1 className="font-display text-5xl leading-[0.95] tracking-wide md:text-7xl lg:text-8xl text-balance">
            SEU CORTE PRONTO EM{" "}
            <span className="text-red-400 font-extrabold">1 CLIQUE.</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mt-3 max-w-md text-sm leading-relaxed text-slate-300 md:text-base lg:text-lg"
        >
          Escolha o serviço, o dia e a hora. Confirmação na hora pelo WhatsApp.
          Sem burocracia, com estilo.
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1 }}
          className="mt-6 flex flex-col gap-3 sm:flex-row"
        >
          <Link
            href="/agendar"
            className="group relative flex-1"
          >
            <button className="inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 h-16 px-8 text-lg press w-full bg-accent text-white shadow-glow-red hover:shadow-glow-red hover:brightness-110">
              <CalendarCheck className="h-5 w-5" />
              Agendar Agora
            </button>
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-300" />
          </Link>

          <Link
            href="#servicos"
            className="group relative flex-1"
          >
            <button className="inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 h-16 px-8 text-lg press w-full border-2 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white">
              <ChevronRight className="h-5 w-5" />
              Ver serviços
            </button>
          </Link>
        </motion.div>

        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">
          <div className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            <span>Manoel Olavo da Rosa, 1044</span>
          </div>
          <div className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>Horários flexíveis</span>
          </div>
        </div>
      </div>

      <div className="relative hidden md:flex items-center justify-center">
        <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-white/5 p-6 text-white backdrop-blur-md shadow-card animate-pulse">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">
            Próximo horário livre
          </p>
          <p className="text-sm text-slate-300 font-medium">
            Consultando agenda…
          </p>
          <Link href="/agendar" className="block mt-4">
            <button className="inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all active:scale-[0.98] h-11 px-4 text-sm w-full bg-accent text-white shadow-glow-red-sm hover:shadow-glow-red">
              Reservar <ChevronRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
