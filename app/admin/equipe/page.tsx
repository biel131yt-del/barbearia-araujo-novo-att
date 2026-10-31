"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/session";
import { Users, Search, Plus } from "lucide-react";

export default function EquipePage() {
  const { user, loading } = useSession();
  const [barbers, setBarbers] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    fetch("/api/admin/barbers")
      .then((r) => r.json())
      .then((data) => { setBarbers(data.barbers || []); setLoadingData(false); });
  }, []);

  if (loading || !user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipe</h1>
          <p className="text-gray-500">Gerencie barbeiros e profissionais</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-900 text-white font-semibold hover:bg-blue-800 transition-colors">
          <Plus className="h-4 w-4" /> Novo Barbeiro
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {barbers.map((b, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                  {b.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{b.name}</p>
                  <p className="text-xs text-gray-500">{b.phone || "Sem telefone"}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Comissão: {b.commission_type === "none" ? "Sem comissão" : b.commission_type}</p>
                <p>{b.is_active ? "Ativo" : "Inativo"}</p>
              </div>
            </div>
          ))}
          {barbers.length === 0 && (
            <div className="col-span-3 text-center py-12 text-gray-500">
              Nenhum barbeiro cadastrado
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
