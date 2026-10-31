"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/session";
import { Users, Search, Plus } from "lucide-react";

export default function ClientesPage() {
  const { user, loading } = useSession();
  const [clients, setClients] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, [search]);

  async function loadData() {
    setLoadingData(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/clients?${params}`);
    const data = await res.json();
    setClients(data.clients || []);
    setLoadingData(false);
  }

  if (loading || !user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500">CRM completo da Barbearia Araújo</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-900 text-white font-semibold hover:bg-blue-800 transition-colors">
          <Plus className="h-4 w-4" /> Novo Cliente
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar cliente por nome ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
          />
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
                  <th className="px-4 py-3 font-medium text-gray-500">Cliente</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Telefone</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Total Atendimentos</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Total Gasto</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Último Atendimento</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clients.map((c, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-900 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-gray-700">{c.phone}</td>
                    <td className="px-4 py-3 text-gray-700">{c.total_appointments}</td>
                    <td className="px-4 py-3 text-gray-700">R$ {(c.total_spent || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-700">{c.last_appointment || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        c.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {c.status === "active" ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-gray-400 hover:text-gray-600">
                        <Users className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {clients.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      Nenhum cliente encontrado
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
