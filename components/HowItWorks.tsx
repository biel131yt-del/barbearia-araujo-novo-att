"use client";

import { HOW_IT_WORKS } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function HowItWorks() {
  return (
    <section className="mt-16 md:mt-24">
      <div className="container-mobile">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl tracking-wide text-white md:text-4xl">
            COMO FUNCIONA
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Do agendamento à cadeira, em três passos simples.
          </p>
        </div>

        <ol className="grid gap-6 md:grid-cols-3">
          {HOW_IT_WORKS.map((step) => (
            <motion.li
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center gap-3"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent font-display text-xl text-white shadow-glow-red relative">
                {step.step}
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-accent opacity-30" />
              </span>
              <p className="font-bold text-white text-sm md:text-base">
                {step.title}
              </p>
              <p className="text-xs text-slate-400 text-center leading-relaxed">
                {step.text}
              </p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
