"use client";

import React from "react";
import { Star, User as UserIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const TESTIMONIALS = [
  {
    name: "Carlos M.",
    rating: 5,
    text: "Melhor degradê da cidade. Atendimento rápido, preço justo e o ambiente é top. Já sou cliente fixo.",
    avatar: "CM",
  },
  {
    name: "Lucas S.",
    rating: 5,
    text: "Barba perfeita com toalha quente. Saí de lá com um novo visual e vontade de voltar na próxima semana.",
    avatar: "LS",
  },
  {
    name: "Rafael P.",
    rating: 5,
    text: "Agendei pelo WhatsApp, cheguei na hora marcada e não esperei nada. Recomendo a todos.",
    avatar: "RP",
  },
  {
    name: "Mateus T.",
    rating: 5,
    text: "Combo corte + barba excelente. A barbearia tem estilo e o atendimento é nota 10.",
    avatar: "MT",
  },
] as const;

export default function Testimonials() {
  const [index, setIndex] = React.useState(0);

  const prev = () => setIndex((i) => (i === 0 ? TESTIMONIALS.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === TESTIMONIALS.length - 1 ? 0 : i + 1));

  const t = TESTIMONIALS[index];
  const stars = Array.from({ length: t.rating }, (_, i) => i);

  return (
    <section className="mt-16 md:mt-24 py-8 md:py-12 bg-white/5 border-y border-white/5">
      <div className="container-mobile">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl tracking-wide text-white md:text-4xl">
            O QUE DIZEM
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Clientes que saem de cabeça erguida.
          </p>
        </div>

        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <button
              onClick={prev}
              className="p-2 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-colors press hidden md:block"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-1 text-yellow-400">
                  {stars.map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-lg leading-relaxed italic md:text-xl">
                  "{t.text}"
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-white">{t.name}</p>
                    <p className="text-xs text-slate-400">Cliente Barbearia Araujo</p>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={next}
              className="p-2 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-colors press hidden md:block"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="flex justify-center gap-2 mt-8">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i === index ? "bg-accent" : "bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
