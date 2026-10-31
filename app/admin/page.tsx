"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/session";

export default function AdminRoot() {
  const { user, loading } = useSession();

  useEffect(() => {
    if (!loading && !user) {
      if (typeof window !== "undefined") window.location.href = "/admin/login";
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 rounded-full border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-600">Autenticando...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visão Geral</h1>
          <p className="text-gray-500">Bem-vindo de volta, {user.name}</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Hoje
          </button>
          <button className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Esta semana
          </button>
          <button className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Este mês
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Agendamentos Hoje"
          value="0"
          icon="calendar"
          color="bg-blue-500"
        />
        <StatCard
          title="Próximos Atendimentos"
          value="0"
          icon="clock"
          color="bg-indigo-500"
        />
        <StatCard
          title="Concluídos"
          value="0"
          icon="check"
          color="bg-green-500"
        />
        <StatCard
          title="Cancelamentos"
          value="0"
          icon="x"
          color="bg-red-500"
        />
        <StatCard
          title="Receita Recebida"
          value="R$ 0,00"
          icon="banknote"
          color="bg-emerald-500"
        />
        <StatCard
          title="Receita Prevista"
          value="R$ 0,00"
          icon="trending"
          color="bg-amber-500"
        />
        <StatCard
          title="Novos Clientes"
          value="0"
          icon="users"
          color="bg-purple-500"
        />
        <StatCard
          title="Avaliação Média"
          value="0,0 ★"
          icon="star"
          color="bg-yellow-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="h-5 w-5 text-blue-600">📅</span>
            Próximos Atendimentos
          </h2>
          <div className="text-center py-8 text-gray-500">
            Nenhum agendamento agendado
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="h-5 w-5 text-emerald-600">💳</span>
            Últimas Movimentações
          </h2>
          <div className="text-center py-8 text-gray-500 text-sm">
            Nenhuma movimentação financeira registrada
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: string;
  color: string;
}) {
  const icons: Record<string, React.ReactNode> = {
    calendar: <span className="h-5 w-5">📅</span>,
    clock: <span className="h-5 w-5">🕐</span>,
    check: <span className="h-5 w-5">✅</span>,
    x: <span className="h-5 w-5">❌</span>,
    banknote: <span className="h-5 w-5">💵</span>,
    trending: <span className="h-5 w-5">📈</span>,
    users: <span className="h-5 w-5">👥</span>,
    star: <span className="h-5 w-5">⭐</span>,
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className="p-3 rounded-xl bg-white/20 backdrop-blur">
          {icons[icon]}
        </div>
      </div>
    </div>
  );
}
