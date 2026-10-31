"use client";

import Link from "next/link";
import { useSession } from "@/lib/session";
import { Banknote, CreditCard, Calendar, FileText } from "lucide-react";

export default function FinanceiroPage() {
  const { user, loading } = useSession();

  if (loading || !user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-gray-500">Controle de receitas, despesas e fluxo de caixa</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <Link href="/admin/financeiro/receitas">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Receitas</p>
                <p className="text-2xl font-bold text-gray-900">Receber</p>
                <p className="text-sm text-gray-500 mt-2">Registre e consulte receitas recebidas</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Banknote className="h-5 w-5" />
              </div>
            </div>
          </div>
        </Link>

        <Link href="/admin/financeiro/despesas">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Despesas</p>
                <p className="text-2xl font-bold text-gray-900">Pagar</p>
                <p className="text-sm text-gray-500 mt-2">Controle de despesas e contas a pagar</p>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
          </div>
        </Link>

        <Link href="/admin/financeiro/fluxo-caixa">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Fluxo de Caixa</p>
                <p className="text-2xl font-bold text-gray-900">Saldo</p>
                <p className="text-sm text-gray-500 mt-2">Entradas, saídas e saldo por período</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
          </div>
        </Link>

        <Link href="/admin/financeiro/fechamento">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Fechamento</p>
                <p className="text-2xl font-bold text-gray-900">Caixa</p>
                <p className="text-sm text-gray-500 mt-2">Fechamento diário e auditoria</p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <FileText className="h-5 w-5" />
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
