"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/session";
import { CreditCard, Search, Plus } from "lucide-react";

export default function ServicosPage() {
  const { user, loading } = useSession();
  const [services, setServices] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoadingData(true);
    const res = await fetch("/api/admin/services");
    const data = await res.json();
    setServices(data.services || []);
    setLoadingData(false);
  }

  if (loading || !user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Serviços e Preços</h1>
          <p className="text-gray-500">Gerencie o cardápio de serviços da barbearia</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-900 text-white font-semibold hover:bg-blue-800 transition-colors">
          <Plus className="h-4 w-4" /> Novo Serviço
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {services.map((s, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{s.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{s.description || "Sem descrição"}</p>
                </div>
                <span className="text-lg font-bold text-blue-900">
                  R$ {(s.price_cents / 100).toFixed(2)}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs text-gray-500">
                <span>{s.duration_minutes} min</span>
                {s.is_featured && <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Destaque</span>}
              </div>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Editar
                </button>
                <button className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Desativar
                </button>
              </div>
            </div>
          ))}
          {services.length === 0 && (
            <div className="col-span-3 text-center py-12 text-gray-500">
              Nenhum serviço cadastrado
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
