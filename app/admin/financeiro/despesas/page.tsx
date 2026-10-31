"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/session";
import { CreditCard, Search, Plus, Filter, AlertTriangle } from "lucide-react";

export default function DespesasPage() {
  const { user, loading } = useSession();
  const [despesas, setDespesas] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    loadData();
  }, [search, status]);

  async function loadData() {
    setLoadingData(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    const res = await fetch(`/api/admin/financeiro/despesas?${params}`);
    const data = await res.json();
    setDespesas(data.despesas || []);
    setLoadingData(false);
  }

  if (loading || !user) return null;

  const vencidas = despesas.filter(
    (d) => d.status === "pending" && new Date(d.due_date) < new Date()
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Despesas</h1>
          <p className="text-gray-500">Controle de despesas e contas a pagar</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors">
          <Plus className="h-4 w-4" /> Nova Despesa
        </button>
      </div>

      {vencidas > 0 && (
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-600" />
          <div>
            <p className="text-sm font-bold text-rose-800">{vencidas} despesa(s) vencida(s)</p>
            <p className="text-xs text-rose-700">Regularize para evitar juros e multas</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por nome, categoria ou fornecedor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>
          <div className="relative flex-1 md:max-w-xs">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-rose-500 outline-none bg-white"
            >
              <option value="">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="paid">Paga</option>
              <option value="overdue">Vencida</option>
            </select>
          </div>
        </div>

        {loadingData ? (
          <div className="h-64 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">Vencimento</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Despesa</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Categoria</th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-right">Valor</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {despesas.map((d) => {
                  const isOverdue = d.status === "pending" && new Date(d.due_date) < new Date();
                  return (
                    <tr key={d.id} className={`hover:bg-gray-50 transition-colors ${isOverdue ? "bg-rose-50" : ""}`}>
                      <td className="px-4 py-3 text-gray-700">
                        {new Date(d.due_date).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-medium">{d.name}</td>
                      <td className="px-4 py-3 text-gray-700">{d.category_name || "—"}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium text-right">
                        R$ {(d.amount_cents / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          d.status === "paid" ? "bg-emerald-100 text-emerald-700" :
                          d.status === "overdue" || isOverdue ? "bg-rose-100 text-rose-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>
                          {d.status === "paid" ? "Paga" : d.status === "overdue" || isOverdue ? "Vencida" : "Pendente"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-gray-400 hover:text-gray-600">
                          <CreditCard className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {despesas.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Nenhuma despesa registrada
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
