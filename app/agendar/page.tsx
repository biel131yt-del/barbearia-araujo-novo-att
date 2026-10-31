"use client";

import React from "react";
import { SERVICES, formatPrice, WHATSAPP_LINK } from "@/lib/utils";
type ServiceType = typeof SERVICES[number];
import { Calendar, User, Phone, Clock, CheckCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function Agendar() {
  const [step, setStep] = React.useState(1);
  const [selectedService, setSelectedService] = React.useState<ServiceType | null>(null);
  const [selectedDate, setSelectedDate] = React.useState("");
  const [selectedTime, setSelectedTime] = React.useState("");
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const times = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

  const nextStep = () => setStep((s) => (s < 3 ? s + 1 : s));
  const prevStep = () => setStep((s) => (s > 1 ? s - 1 : s));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          service: selectedService!.name,
          price: selectedService!.price,
          date: selectedDate,
          time: selectedTime,
        }),
      });
      setSuccess(true);
    } catch {
      // fallback: abre o WhatsApp diretamente
      const text = `Olá! Quero agendar:\nServiço: ${selectedService!.name} (${formatPrice(selectedService!.price)})\nData: ${selectedDate}\nHora: ${selectedTime}\nNome: ${name}\nTelefone: ${phone}`;
      window.open(WHATSAPP_LINK(text), "_blank");
      setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-brand-950 text-slate-100">
        <div className="container-mobile text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white shadow-glow-red mx-auto mb-6">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h1 className="font-display text-3xl tracking-wide text-white">Agendamento confirmado!</h1>
            <p className="mt-3 text-slate-300">
              Recebemos sua solicitação. Entraremos em contato pelo WhatsApp para confirmar o horário.
            </p>
            <a
              href={WHATSAPP_LINK("Oi! Gostaria de confirmar meu agendamento na Barbearia Araujo")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all active:scale-[0.98] h-14 px-8 text-lg press w-full bg-accent text-white shadow-glow-red hover:shadow-glow-red"
            >
              <Phone className="h-5 w-5" /> Abrir WhatsApp
            </a>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-brand-950 via-brand-900 to-brand-950 text-slate-100 py-8">
      <div className="container-mobile max-w-xl">
        <nav className="mb-8">
          <a href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
            ← Voltar
          </a>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 md:p-10 backdrop-blur shadow-card"
        >
          {/* Progress steps */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex flex-col items-center gap-1.5 relative">
                {n > 1 && (
                  <div className="absolute -left-1/2 top-3 h-[2px] w-full bg-white/10 -z-10" />
                )}
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                    step >= n ? "bg-accent text-white" : "bg-white/10 text-slate-500"
                  }`}
                >
                  {n}
                </div>
                <span className={`text-xs font-medium ${
                  step >= n ? "text-white" : "text-slate-500"
                }`}>
                  {n === 1 ? "Serviço" : n === 2 ? "Data/Hora" : "Dados"}
                </span>
              </div>
            ))}
          </div>

          {/* Step 1: Service */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-display text-2xl tracking-wide text-white">Escolha o serviço</h2>
              <div className="grid gap-3">
                {SERVICES.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`press flex items-center justify-between p-4 rounded-xl border transition-all ${
                      selectedService?.id === service.id
                        ? "border-red-500 bg-red-500/10 shadow-glow-red-sm"
                        : "border-white/10 hover:border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <div>
                      <h3 className="font-bold text-white">{service.name}</h3>
                      <p className="text-xs text-slate-400">{service.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-display text-xl text-white">{formatPrice(service.price)}</span>
                      <p className="text-[10px] text-slate-500">{service.duration}</p>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={nextStep}
                disabled={!selectedService}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all active:scale-[0.98] h-14 px-8 text-lg press w-full disabled:opacity-50 disabled:pointer-events-none bg-accent text-white shadow-glow-red hover:shadow-glow-red"
              >
                Próximo <Calendar className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Step 2: Date/Time */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl tracking-wide text-white">
                Escolha dia e hora
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Data</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:ring-2 focus:ring-accent outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Horário</label>
                  <div className="grid gap-2 grid-cols-4">
                    {times.map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className={`press h-12 rounded-xl font-medium transition-all ${
                          selectedTime === t
                            ? "bg-accent text-white shadow-glow-red-sm"
                            : "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <button
                  onClick={prevStep}
                  className="inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all active:scale-[0.98] h-14 px-8 text-lg press border border-white/20 bg-white/5 text-white hover:bg-white/10"
                >
                  <ArrowLeft className="h-5 w-5" /> Voltar
                </button>
                <button
                  onClick={nextStep}
                  disabled={!selectedDate || !selectedTime}
                  className="inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all active:scale-[0.98] h-14 px-8 text-lg press disabled:opacity-50 disabled:pointer-events-none bg-accent text-white shadow-glow-red hover:shadow-glow-red"
                >
                  Próximo <User className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Data */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="font-display text-2xl tracking-wide text-white">Seus dados</h2>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Nome completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:ring-2 focus:ring-accent outline-none transition-colors"
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">WhatsApp</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:ring-2 focus:ring-accent outline-none transition-colors"
                  placeholder="(51) 9XXXX-XXXX"
                />
              </div>
              <div className="mt-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 text-sm text-blue-200">
                💡 Após o envio, entraremos em contato pelo WhatsApp para confirmar seu horário.
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 w-full rounded-xl font-semibold transition-all active:scale-[0.98] h-14 px-8 text-lg press disabled:opacity-70 disabled:pointer-events-none bg-accent text-white shadow-glow-red hover:shadow-glow-red"
              >
                {submitting ? "Enviando..." : "Confirmar agendamento"}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
