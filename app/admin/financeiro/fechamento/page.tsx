"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/session";
import { Banknote, FileText } from "lucide-react";

export default function FechamentoPage() {
  const { user, loading } = useSession();
  const [fechamentos, setFechamentos] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataSelecionada, setDataSelecionada] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoadingData(true);
    const res = await fetch("/api/admin/financeiro/fechamentos");
    const data = await res.json();
    setFechamentos(data.fechamentos || []);
    setLoadingData(false);
  }

  if (loading || !user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fechamento Diário</h1>
          <p className="text-gray-500">Conferência e fechamento do caixa</p>
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={dataSelecionada}
            onChange={(e) => setDataSelecionada(e.target.value)}
            className="pl-3 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button className="px-4 py-2.5 rounded-xl bg-blue-900 text-white font-semibold hover:bg-blue-800 transition-colors">
            Fechar Caixa
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Fechamentos Anteriores</h2>
        {loadingData ? (
          <div className="h-64 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">Data</th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-right">Dinheiro</th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-right">Pix</th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-right">Cartões</th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-right">Outros</th>
                  <th className="px-4 py-3 font-medium text-gray-500 text-right">Total</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fechamentos.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-700">{new Date(f.closure_date).toLocaleDateString("pt-BR")}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium text-right">R$ {(f.cash_total_cents / 100).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium text-right">R$ {(f.pix_total_cents / 100).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium text-right">R$ {(f.card_total_cents / 100).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium text-right">R$ {(f.other_total_cents / 100).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-900 font-bold text-right">
                      R$ {(((f.cash_total_cents || 0) + (f.pix_total_cents || 0) + (f.card_total_cents || 0) + (f.other_total_cents || 0)) / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        f.status === "closed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {f.status === "closed" ? "Fechado" : "Aberto"}
                      </span>
                    </td>
                  </tr>
                ))}
                {fechamentos.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      Nenhum fechamento registrado
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
