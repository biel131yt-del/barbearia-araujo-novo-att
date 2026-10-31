"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/session";
import {
  Calendar,
  Search,
  Plus,
  Filter,
  Clock as ClockIcon,
} from "lucide-react";

import AvailabilityManager from "@/components/AvailabilityManager";

export default function AgendaPage() {
  const { user, loading } = useSession();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("pix");
  async function update(id: number, status: string) {
    if (
      (status === "cancelled" || status === "completed") &&
      !window.confirm(
        status === "completed"
          ? "Concluir e registrar o recebimento no financeiro?"
          : "Cancelar este agendamento?",
      )
    )
      return;
    setBusy(true);
    setMessage("");
    try {
      const r = await fetch("/api/admin/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, payment_method: paymentMethod }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      await loadData();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Não foi possível atualizar");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [filterDate, search]);

  async function loadData() {
    setLoadingData(true);
    const params = new URLSearchParams();
    if (filterDate) params.set("date", filterDate);
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/appointments?${params}`);
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Erro ao carregar agenda");
      setLoadingData(false);
      return;
    }
    setAppointments(data.appointments || []);
    setLoadingData(false);
  }

  if (loading || !user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-500">
            Gerencie atendimentos, horários e profissionais
          </p>
        </div>
        <a href="/agendar" className="admin-secondary">
          Ver agendamento do cliente
        </a>
      </div>

      {message && (
        <p role="alert" className="bg-red-50 text-red-800 p-3 rounded-xl">
          {message}
        </p>
      )}
      <AvailabilityManager />
      <label className="admin-label">
        Forma de pagamento ao concluir
        <select
          className="admin-input max-w-xs"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="pix">Pix</option>
          <option value="cash">Dinheiro</option>
          <option value="debit_card">Cartão de débito</option>
          <option value="credit_card">Cartão de crédito</option>
          <option value="other">Outro</option>
        </select>
      </label>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar cliente ou serviço..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button
            onClick={() => {
              setFilterDate("");
              setSearch("");
              loadData();
            }}
            className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" /> Limpar filtros
          </button>
        </div>

        {loadingData ? (
          <div className="h-64 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">
                    Horário
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500">
                    Cliente
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500">
                    Serviço
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500">
                    Barbeiro
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500">Valor</th>
                  <th className="px-4 py-3 font-medium text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500">
                    Pagamento
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.map((ap, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {ap.appointment_date?.slice(0, 10)} ·{" "}
                      {ap.appointment_time?.slice(0, 5)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {ap.client_name}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {ap.service_name}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {ap.barber_name || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
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
                        {
                          {
                            scheduled: "Agendado",
                            confirmed: "Confirmado",
                            completed: "Concluído",
                            cancelled: "Cancelado",
                            no_show: "Não compareceu",
                          }[
                            ap.status as
                              | "scheduled"
                              | "confirmed"
                              | "completed"
                              | "cancelled"
                              | "no_show"
                          ]
                        }
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {ap.payment_method || "Pendente"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {["scheduled", "confirmed"].includes(ap.status) && (
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            disabled={busy}
                            onClick={() => update(ap.id, "completed")}
                            className="text-xs text-emerald-700"
                          >
                            Concluir e receber
                          </button>
                          {ap.status === "scheduled" && (
                            <button
                              disabled={busy}
                              onClick={() => update(ap.id, "confirmed")}
                              className="text-xs text-blue-700"
                            >
                              Confirmar
                            </button>
                          )}
                          <button
                            disabled={busy}
                            onClick={() => update(ap.id, "cancelled")}
                            className="text-xs text-rose-700"
                          >
                            Cancelar
                          </button>
                          <button
                            disabled={busy}
                            onClick={() => update(ap.id, "no_show")}
                            className="text-xs text-gray-500"
                          >
                            Não compareceu
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {appointments.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Nenhum agendamento encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
