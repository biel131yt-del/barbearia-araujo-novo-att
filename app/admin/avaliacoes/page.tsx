"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/session";
import { Star, Users } from "lucide-react";

export default function AvaliacoesPage() {
  const { user, loading } = useSession();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    fetch("/api/admin/avaliacoes")
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setAvgRating(data.avg_rating || 0);
        setTotalReviews(data.total || 0);
        setLoadingData(false);
      });
  }, []);

  if (loading || !user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Avaliações</h1>
          <p className="text-gray-500">Feedback dos clientes da Barbearia Araújo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Avaliação Média</p>
          <p className="text-3xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
          <p className="text-xs text-gray-500">de 5 estrelas</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total de Avaliações</p>
          <p className="text-3xl font-bold text-gray-900">{totalReviews}</p>
          <p className="text-xs text-gray-500">avaliações recebidas</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center text-white font-bold text-xl">
            ★
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Estrelas</p>
            <p className="text-sm font-bold text-gray-900">⭐⭐⭐⭐⭐</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">Cliente</th>
                <th className="px-4 py-3 font-medium text-gray-500">Avaliação</th>
                <th className="px-4 py-3 font-medium text-gray-500">Comentário</th>
                <th className="px-4 py-3 font-medium text-gray-500">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviews.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-900 font-medium">{r.is_anonymous ? "Anônimo" : r.client_name || "Cliente"}</td>
                  <td className="px-4 py-3">
                    <div className="flex text-yellow-400">
                      {Array.from({ length: r.rating }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      {Array.from({ length: 5 - r.rating }).map((_, j) => (
                        <Star key={j + 5} className="h-4 w-4 text-gray-300" />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{r.comment || "Sem comentário"}</td>
                  <td className="px-4 py-3 text-gray-700">{new Date(r.created_at).toLocaleDateString("pt-BR")}</td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    Nenhuma avaliação recebida
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
