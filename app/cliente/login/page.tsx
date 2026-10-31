"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, Phone } from "lucide-react";

export default function ClienteLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/client/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Telefone ou senha inválidos");
        setLoading(false);
        return;
      }
      router.push("/agendar");
    } catch {
      setError("Erro ao conectar com o servidor");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
      <div className="w-full max-w-md px-6">
        <div className="mb-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-900 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
            BA
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Minha Conta</h1>
          <p className="text-gray-600">
            Acesso ao seu histórico e agendamentos
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Telefone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="(51) 9XXXX-XXXX"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
            {error && (
              <div className="rounded-xl bg-red-50 p-3 border border-red-100 flex items-center gap-2">
                <span className="h-5 w-5 text-red-600">⚠</span>
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white bg-blue-900 hover:bg-blue-800 disabled:opacity-60 transition-all"
            >
              {loading ? "Entrando..." : "Entrar"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
        <p className="mt-6 text-center text-sm text-gray-500">
          Primeira vez?{" "}
          <a
            href="/cliente/cadastro"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Cadastre-se
          </a>
        </p>
      </div>
    </div>
  );
}
