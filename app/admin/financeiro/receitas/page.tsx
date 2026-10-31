"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/session";
import { Banknote, Search, Plus, Filter } from "lucide-react";

export default function ReceitasPage() {
  const { user, loading } = useSession();
  const [receitas, setReceitas] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");

  useEffect(() => {
    loadData();
  }, [search, formaPagamento]);

  async function loadData() {
    setLoadingData(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (formaPagamento) params.set("forma_pagamento", formaPagamento);
    const res = await fetch(`/api/admin/financeiro/receitas?${params}`);
    const data = await res.json();
    setReceitas(data.receitas || []);
    setLoadingData(false);
  }

  if (loading || !user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Receitas</h1>
          <p className="text-gray-500">Controle de receitas recebidas</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors">
          <Plus className="h-4 w-4" /> Nova Receita
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar por origem, cliente ou serviço..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div className="relative flex-1 md:max-w-xs">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
            >
              <option value="">Todas as formas</option>
              <option value="pix">Pix</option>
              <option value="cash">Dinheiro</option>
              <option value="debit_card">Débito</option>
              <option value="credit_card">Crédito</option>
              <option value="other">Outros</option>
            </select>
          </div>
        </div>

        {loadingData ? (
          <div className="h-64 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">Data</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Origem</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Cliente / Serviço</th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-right">Valor</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Forma Pagto.</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {receitas.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(r.received_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-medium">{r.source}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {r.appointment_id ? r.client_name || "Cliente" : "Manual"}
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-medium text-right">
                      R$ {(r.amount_cents / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <span className="text-capitalize">{r.payment_method}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        r.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                        r.status === "pending" ? "bg-amber-100 text-amber-700" :
                        "bg-rose-100 text-rose-700"
                      }`}>
                        {r.status === "approved" ? "Aprovado" : r.status === "pending" ? "Pendente" : "Rejeitado"}
                      </span>
                    </td>
                  </tr>
                ))}
                {receitas.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Nenhuma receita registrada
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
