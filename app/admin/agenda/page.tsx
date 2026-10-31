"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/session";
import { Calendar, Search, Plus, Filter, Clock as ClockIcon } from "lucide-react";

export default function AgendaPage() {
  const { user, loading } = useSession();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const [search, setSearch] = useState("");

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
    setAppointments(data.appointments || []);
    setLoadingData(false);
  }

  if (loading || !user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-500">Gerencie atendimentos, horários e profissionais</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-900 text-white font-semibold hover:bg-blue-800 transition-colors">
          <Plus className="h-4 w-4" /> Novo Agendamento
        </button>
      </div>

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
                  <th className="px-4 py-3 font-medium text-gray-500">Horário</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Cliente</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Serviço</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Barbeiro</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Valor</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Pagamento</th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.map((ap, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-900 font-medium">{ap.appointment_time}</td>
                    <td className="px-4 py-3 text-gray-700">{ap.client_name}</td>
                    <td className="px-4 py-3 text-gray-700">{ap.service_name}</td>
                    <td className="px-4 py-3 text-gray-700">{ap.barber_name || "—"}</td>
                    <td className="px-4 py-3 text-gray-700">R$ {(ap.price_cents / 100).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        ap.status === "scheduled" ? "bg-blue-100 text-blue-700" :
                        ap.status === "confirmed" ? "bg-green-100 text-green-700" :
                        ap.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                        ap.status === "cancelled" ? "bg-rose-100 text-rose-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {ap.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{ap.payment_method || "Pendente"}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-gray-400 hover:text-gray-600">
                        <ClockIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {appointments.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
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
