"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Scissors, Clock, ArrowUpRight } from "lucide-react";
type Service = {
  id: number;
  name: string;
  description: string;
  price_cents: number;
  duration_minutes: number;
  image_url: string | null;
  is_featured: boolean;
};
export default function Services() {
  const [services, setServices] = useState<Service[]>([]),
    [error, setError] = useState(false);
  useEffect(() => {
    fetch("/api/services")
      .then(async (r) => {
        if (!r.ok) throw new Error();
        const d = await r.json();
        setServices(d.services);
      })
      .catch(() => setError(true));
  }, []);
  return (
    <section id="servicos" className="mt-16 md:mt-24">
      <div className="container-mobile">
        <div className="flex items-end justify-between gap-4 mb-7">
          <div>
            <p className="text-xs text-red-400 tracking-widest uppercase font-bold">
              Cuidado nos detalhes
            </p>
            <h2 className="font-display text-4xl text-white mt-2">
              Escolha seu estilo.
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Preços e duração para você se programar.
            </p>
          </div>
          <Link
            href="/agendar"
            className="text-sm text-red-400 whitespace-nowrap"
          >
            Agendar →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <article
              key={s.id}
              className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden flex flex-col"
            >
              {s.image_url && (
                <img
                  src={s.image_url}
                  alt={s.name}
                  className="h-48 w-full object-cover"
                />
              )}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <Scissors className="text-red-400" size={22} />
                  {s.is_featured && (
                    <span className="rounded-full bg-red-500/10 text-red-300 text-xs px-3 py-1">
                      Destaque
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white">{s.name}</h3>
                <p className="text-sm text-slate-400 mt-2 flex-1">
                  {s.description}
                </p>
                <div className="flex items-center gap-1 text-xs text-slate-500 my-4">
                  <Clock size={13} />
                  {s.duration_minutes} minutos
                </div>
                <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                  <strong className="text-xl text-white">
                    {(s.price_cents / 100).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </strong>
                  <Link
                    href="/agendar"
                    aria-label={`Agendar ${s.name}`}
                    className="rounded-xl bg-white/10 p-3 hover:bg-red-500"
                  >
                    <ArrowUpRight size={18} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        {error && (
          <p className="text-slate-400 py-5">
            Não foi possível carregar os serviços. Tente novamente mais tarde.
          </p>
        )}
        {!error && !services.length && (
          <p className="text-slate-400 py-5">
            Consulte os serviços na área de agendamento.
          </p>
        )}
      </div>
    </section>
  );
}
