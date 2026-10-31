"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/session";
import { Star, Bell, CheckCircle, XCircle } from "lucide-react";

export default function NotificacoesPage() {
  const { user, loading } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    fetch("/api/admin/notifications")
      .then((r) => r.json())
      .then((data) => { setNotifications(data.notifications || []); setLoadingData(false); });
  }, []);

  if (loading || !user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
          <p className="text-gray-500">Central de notificações administrativas</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="space-y-3">
          {notifications.map((n, i) => (
            <div key={i} className={`p-4 rounded-xl border border-gray-100 ${n.is_read ? "bg-gray-50" : "bg-blue-50"}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${n.type === "warning" ? "bg-amber-100" : n.type === "error" ? "bg-rose-100" : "bg-blue-100"} flex-shrink-0`}>
                    <Bell className={`h-4 w-4 ${n.type === "warning" ? "text-amber-600" : n.type === "error" ? "text-rose-600" : "text-blue-600"}`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{n.title}</p>
                    <p className="text-sm text-gray-600">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString("pt-BR")}</p>
                  </div>
                </div>
                {!n.is_read && (
                  <button className="text-gray-400 hover:text-blue-600">
                    <CheckCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma notificação
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
