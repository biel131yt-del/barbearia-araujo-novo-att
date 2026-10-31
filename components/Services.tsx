"use client";

import Link from "next/link";
import { SERVICES, formatPrice, WHATSAPP_LINK } from "@/lib/utils";
import { Scissors, ShoppingBag, Star, ChevronRight, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const ICONS: Record<string, any> = {
  scissors: Scissors,
  "shopping-bag": ShoppingBag,
  star: Star,
};

export default function Services() {
  return (
    <section id="servicos" className="mt-12 md:mt-20">
      <div className="container-mobile">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-3xl tracking-wide text-white md:text-4xl">
              SERVIÇOS
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Preço fixo, sem surpresa. Qualidade premium em cada corte.
            </p>
          </div>
          <Link
            href="/agendar"
            className="inline-flex min-h-[48px] items-center gap-2 text-sm font-bold text-red-400 hover:text-red-300 transition-colors press"
          >
            Ver todos <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {SERVICES.map((service) => (
            <motion.article
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`
                press relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 p-5
                transition-all duration-300 hover:border-red-500/60 hover:bg-white/10
                flex flex-col h-full
                ${service.popular ? "border-red-500/30 bg-red-500/5" : ""}
              `}
            >
              {/* Decorative pattern */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="pointer-events-none absolute -bottom-4 -right-4 h-24 w-24 text-white opacity-[0.04]"
                aria-hidden="true"
              >
                <path d="M3 17 14.5 5.5a2.1 2.1 0 0 1 3 3L8 19l-5-2Z" />
                <path d="M8 19 5.5 21.5" />
                <circle cx="17.5" cy="6.5" r="1.4" />
                <path d="M13 13l2.5 2.5" />
              </svg>

              {service.popular && (
                <span className="absolute top-4 left-4 rounded-lg bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-glow-red-sm">
                  Mais pedido
                </span>
              )}

              <div className="relative flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white text-lg">
                    {service.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    {service.description}
                  </p>
                </div>
                <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-bold text-slate-200">
                  {service.duration}
                </span>
              </div>

              <div className="relative mt-2 flex items-center justify-between">
                <p className="font-display text-2xl tracking-wide text-white">
                  {formatPrice(service.price)}
                </p>
                <div className="mt-auto">
                  <Link
                    href={WHATSAPP_LINK(`Quero agendar: ${service.name} (${formatPrice(service.price)})`)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all active:scale-[0.98] h-11 px-4 text-sm bg-accent text-white shadow-glow-red-sm hover:shadow-glow-red press"
                      aria-label={`Agendar ${service.name}`}
                    >
                      {(() => {
                        const Icon = ICONS[service.icon] ?? Scissors;
                        return <Icon className="h-4 w-4" />;
                      })()}
                      Agendar
                    </button>
                  </Link>
                </div>
              </div>
          ))}
        </div>

        <Link
          href={WHATSAPP_LINK("Fala! Meu corte não está na lista, vamos conversar?")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-3 rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-5 transition-all hover:border-green-400/60 hover:bg-green-500/5 press"
        >
          <span className="flex shrink-0 h-12 w-12 items-center justify-center rounded-full bg-green-500/20 text-green-300">
            <MessageCircle className="h-6 w-6" />
          </span>
          <span>
            <span className="block text-sm font-bold text-white">
              Seu corte não está na lista?
            </span>
            <span className="block text-xs text-slate-400">
              Entre em contato e vamos conversar
            </span>
          </span>
        </Link>
      </div>
    </section>
  );
}
