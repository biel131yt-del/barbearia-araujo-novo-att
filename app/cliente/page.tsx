"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, CheckCircle, XCircle, Phone } from "lucide-react";

export default function ClientePage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    loadSession();
  }, []);

  async function loadSession() {
    try {
      const res = await fetch("/api/auth/client/me");
      const data = await res.json();
      if (data.client) {
        setAuthenticated(true);
        loadAppointments();
      } else {
        setAuthenticated(false);
        if (typeof window !== "undefined") {
          window.location.href = "/cliente/login";
        }
      }
    } catch {
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }

  async function loadAppointments() {
    const res = await fetch("/api/cliente/appointments");
    const data = await res.json();
    setAppointments(data.appointments || []);
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-900">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 rounded-full border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Minha Conta</h1>
            <p className="text-gray-500">Seus agendamentos e histórico</p>
          </div>
          <a
            href="/agendar"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-900 text-white font-semibold hover:bg-blue-800 transition-colors"
          >
            <Phone className="h-4 w-4" /> Novo Agendamento
          </a>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Meus Agendamentos
          </h2>

          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-blue-400" />
              </div>
              <p className="text-lg font-medium text-gray-900">
                Nenhum agendamento ainda
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Agende seu próximo corte pelo botão acima
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-900">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-500">
                      Data / Hora
                    </th>
                    <th className="px-4 py-3 font-medium text-gray-500">
                      Serviço
                    </th>
                    <th className="px-4 py-3 font-medium text-gray-500 text-right">
                      Valor
                    </th>
                    <th className="px-4 py-3 font-medium text-gray-500">
                      Status
                    </th>
                    <th className="px-4 py-3 font-medium text-gray-500">
                      Pagamento
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {appointments.map((ap) => (
                    <tr
                      key={ap.id}
                      className="hover:bg-gray-50 text-gray-900 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {String(ap.appointment_date)
                          .slice(0, 10)
                          .split("-")
                          .reverse()
                          .join("/")}{" "}
                        às {String(ap.appointment_time).slice(0, 5)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {ap.service_name}
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-medium text-right">
                        R$ {(ap.price_cents / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            ap.status === "scheduled"
                              ? "bg-blue-100 text-blue-700"
                              : ap.status === "confirmed"
                                ? "bg-green-100 text-green-700"
                                : ap.status === "completed"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : ap.status === "cancelled"
                                    ? "bg-rose-100 text-rose-700"
                                    : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {ap.status === "scheduled"
                            ? "Agendado"
                            : ap.status === "confirmed"
                              ? "Confirmado"
                              : ap.status === "completed"
                                ? "Concluído"
                                : ap.status === "cancelled"
                                  ? "Cancelado"
                                  : "Não compareceu"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {ap.payment_status === "paid" ? (
                          <span className="text-green-600 font-medium">
                            Pago
                          </span>
                        ) : ap.payment_status === "pending" ? (
                          <span className="text-amber-600 font-medium">
                            Pendente
                          </span>
                        ) : (
                          <span className="text-gray-600 font-medium">
                            {ap.payment_method || "—"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
