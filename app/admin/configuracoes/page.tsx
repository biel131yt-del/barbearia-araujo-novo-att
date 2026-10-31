"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/session";
import { Settings, Bell, Lock } from "lucide-react";
import PushSubscription from "@/components/PushSubscription";

export default function ConfiguracoesPage() {
  const { user, loading } = useSession();
  const [settings, setSettings] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    fetch("/api/admin/configuracoes")
      .then((r) => r.json())
      .then((data) => { setSettings(data.settings || []); setLoadingData(false); });
  }, []);

  if (loading || !user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500">Configurações gerais da Barbearia Araújo</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Configurações do Sistema</h2>
        <div className="space-y-4">
          {settings.map((s, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50">
              <div className="flex items-center gap-3">
                <Settings className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">{s.key}</span>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-500">{s.value || "Não definido"}</span>
              </div>
            </div>
          ))}
          {settings.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma configuração cadastrada
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-gray-600" />
          Segurança
        </h2>
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-gray-100 bg-gray-50">
            <p className="text-sm font-medium text-gray-900">Usuário logado</p>
            <p className="text-xs text-gray-500">{user.name} ({user.email})</p>
          </div>
          <div className="p-4 rounded-lg border border-gray-100 bg-gray-50">
            <p className="text-sm font-medium text-gray-900">Função</p>
            <p className="text-xs text-gray-500">{user.role}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-gray-600" />
          Notificações Push
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Configure notificações push para o iPhone do proprietário. O WhatsApp é um canal complementar, nunca o único.
        </p>
        <PushSubscription />
      </div>
    </div>
  );
}
