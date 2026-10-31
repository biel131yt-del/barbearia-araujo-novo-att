"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/session";
import { Banknote, CreditCard, Calendar as CalIcon } from "lucide-react";

export default function FluxoCaixaPage() {
  const { user, loading } = useSession();
  const [fluxo, setFluxo] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [periodo, setPeriodo] = useState("mes");

  useEffect(() => {
    loadData();
  }, [periodo]);

  async function loadData() {
    setLoadingData(true);
    const res = await fetch(`/api/admin/financeiro/fluxo-caixa?periodo=${periodo}`);
    const data = await res.json();
    setFluxo(data);
    setLoadingData(false);
  }

  if (loading || !user) return null;

  const saldoFinal = ((fluxo?.entradas || 0) - (fluxo?.saidas || 0)) / 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fluxo de Caixa</h1>
          <p className="text-gray-500">Entradas, saídas e saldo do período</p>
        </div>
        <div className="flex gap-2">
          {["dia", "mes", "ano"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                periodo === p
                  ? "bg-blue-900 text-white"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {p === "dia" ? "Dia" : p === "mes" ? "Mês" : "Ano"}
            </button>
          ))}
        </div>
      </div>

      {loadingData ? (
        <div className="h-96 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <ResumoCard
                title="Saldo Inicial"
                value="R$ 0,00"
                icon={<Banknote className="h-5 w-5 text-gray-600" />}
                color="bg-gray-50"
              />
              <ResumoCard
                title="Entradas"
                value={`R$ ${(fluxo.entradas / 100).toFixed(2)}`}
                icon={<Banknote className="h-5 w-5 text-emerald-600" />}
                color="bg-emerald-50"
              />
              <ResumoCard
                title="Saídas"
                value={`R$ ${(fluxo.saidas / 100).toFixed(2)}`}
                icon={<CreditCard className="h-5 w-5 text-rose-600" />}
                color="bg-rose-50"
              />
              <ResumoCard
                title="Saldo Final"
                value={`R$ ${saldoFinal.toFixed(2)}`}
                icon={<CalIcon className="h-5 w-5 text-blue-900" />}
                color="bg-blue-50"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Movimentações por Dia</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-500">Data</th>
                    <th className="px-4 py-3 font-medium text-gray-500 text-right">Entradas</th>
                    <th className="px-4 py-3 font-medium text-gray-500 text-right">Saídas</th>
                    <th className="px-4 py-3 font-medium text-gray-500 text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {fluxo.movimentacoes_por_dia?.map((m: any) => (
                    <tr key={m.data}>
                      <td className="px-4 py-3 text-gray-700">{m.data}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium text-right">R$ {(m.entradas / 100).toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium text-right">R$ {(m.saidas / 100).toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium text-right">R$ {(m.saldo / 100).toFixed(2)}</td>
                    </tr>
                  ))}
                  {!fluxo.movimentacoes_por_dia?.length && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        Nenhuma movimentação no período
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ResumoCard({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className={`rounded-xl p-5 ${color}`}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{title}</p>
      <div className="flex items-center gap-2">
        <p className="text-xl font-bold text-gray-900">{value}</p>
        <span className="ml-auto p-2 rounded-lg bg-white/80">{icon}</span>
      </div>
    </div>
  );
}
