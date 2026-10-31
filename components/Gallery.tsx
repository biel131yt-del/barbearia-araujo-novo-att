"use client";

import { Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

const GALLERY = [
  { label: "Degradê Navalhado", color: "from-brand-600 to-brand-900" },
  { label: "Barba Modelo", color: "from-red-600 to-red-900" },
  { label: "Corte Clássico", color: "from-emerald-600 to-emerald-900" },
  { label: "Combo Premium", color: "from-amber-600 to-amber-900" },
] as const;

export default function Gallery() {
  return (
    <section className="mt-16 md:mt-24">
      <div className="container-mobile">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <h2 className="font-display text-3xl tracking-wide text-white md:text-4xl">
              GALERIA
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Estilo que fala por si só.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {GALLERY.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative h-48 rounded-[1.5rem] overflow-hidden border border-white/10 bg-white/5 group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br {item.color} opacity-[0.85]"></div>
              <div className="absolute inset-0 bg-[url('https://ui-avatars.com/api/?name=Barber&background=random')] bg-cover bg-center opacity-40 group-hover:opacity-20 transition-opacity duration-500" />
              <div className="absolute inset-0 flex items-end p-6">
                <div className="flex items-center gap-2 text-white">
                  <ImageIcon className="h-5 w-5" />
                  <span className="font-bold text-sm md:text-base">{item.label}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
