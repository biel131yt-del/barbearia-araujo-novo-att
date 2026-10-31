"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/session";
import { Package, Search, Plus, AlertTriangle } from "lucide-react";

export default function EstoquePage() {
  const { user, loading } = useSession();
  const [products, setProducts] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    fetch("/api/admin/estoque")
      .then((r) => r.json())
      .then((data) => { setProducts(data.products || []); setLoadingData(false); });
  }, []);

  if (loading || !user) return null;

  const lowStock = products.filter((p) => p.stock_quantity <= p.min_stock);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estoque e Produtos</h1>
          <p className="text-gray-500">Controle de estoque, vendas e suprimentos</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-900 text-white font-semibold hover:bg-blue-800 transition-colors">
          <Plus className="h-4 w-4" /> Novo Produto
        </button>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-600" />
          <div>
            <p className="text-sm font-bold text-rose-800">Estoque baixo</p>
            <p className="text-xs text-rose-700">{lowStock.length} produto(s) abaixo do mínimo</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500">Produto</th>
                <th className="px-4 py-3 font-medium text-gray-500">Categoria</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-right">Custo</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-right">Venda</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-right">Estoque</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-right">Mínimo</th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => {
                const isLow = p.stock_quantity <= p.min_stock;
                return (
                  <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${isLow ? "bg-rose-50" : ""}`}>
                    <td className="px-4 py-3 text-gray-900 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-gray-700">{p.category || "—"}</td>
                    <td className="px-4 py-3 text-gray-700 text-right">R$ {(p.cost_cents / 100).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-700 text-right">R$ {(p.price_cents / 100).toFixed(2)}</td>
                    <td className={`px-4 py-3 text-gray-700 text-right font-medium ${isLow ? "text-rose-700" : "text-gray-900"}`}>{p.stock_quantity}</td>
                    <td className="px-4 py-3 text-gray-700 text-right">{p.min_stock}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        isLow ? "bg-rose-100 text-rose-700" : "bg-green-100 text-green-700"
                      }`}>
                        {isLow ? "Baixo" : "OK"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-gray-400 hover:text-gray-600">
                        <Package className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    Nenhum produto cadastrado
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
