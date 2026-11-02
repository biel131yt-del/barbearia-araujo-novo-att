"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/session";
import {
  Download,
  LayoutDashboard,
  Calendar,
  Users,
  CreditCard,
  Package,
  Star,
  Settings,
  LogOut,
  Menu,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";

const MENU_ITEMS = [
  { name: "Visão Geral", href: "/admin", icon: LayoutDashboard },
  { name: "Agenda", href: "/admin/agenda", icon: Calendar },
  { name: "Clientes", href: "/admin/clientes", icon: Users },
  { name: "Serviços", href: "/admin/servicos", icon: CreditCard },
  { name: "Promoções", href: "/admin/promocoes", icon: Star },
  { name: "Equipe", href: "/admin/equipe", icon: Users },
  { name: "Financeiro", href: "/admin/financeiro", icon: CreditCard },
  { name: "Estoque", href: "/admin/estoque", icon: Package },
  { name: "Avaliações", href: "/admin/avaliacoes", icon: Star },
  { name: "Notificações", href: "/admin/notificacoes", icon: Star },
  { name: "Configurações", href: "/admin/configuracoes", icon: Settings },
  { name: "Instalar app admin", href: "/admin/instalar", icon: Download },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Only show header/sidebar if not on login page */}
      {!isLoginPage && (
        <>
          {/* Mobile Header */}
          <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-20">
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="text-gray-600 hover:text-gray-900"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link href="/admin" className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-white font-bold text-sm">
                BA
              </span>
              <span className="font-bold text-lg tracking-tight">
                Barbearia Araújo
              </span>
            </Link>
          </div>

          {/* Desktop Sidebar */}
          <aside className="hidden md:flex w-64 flex-col border-r border-gray-200 bg-white h-screen fixed left-0 top-0 z-20">
            <div className="p-6 border-b border-gray-200">
              <Link href="/admin" className="flex items-center gap-2">
                <span className="w-10 h-10 rounded-xl bg-blue-900 flex items-center justify-center text-white font-bold">
                  BA
                </span>
                <span className="font-bold text-xl tracking-tight">
                  Barbearia Araújo
                </span>
              </Link>
            </div>
            <nav className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-1">
              {MENU_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin" &&
                    pathname.startsWith(item.href + "/"));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-5 w-5" /> Sair
              </button>
            </div>
          </aside>

          {/* Mobile Drawer Backdrop */}
          {mobileOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
          )}
          {/* Mobile Drawer Panel */}
          <div
            className={`fixed inset-y-0 left-0 z-40 w-72 overflow-y-auto bg-white border-r border-gray-200 transform transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:hidden`}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <span className="font-bold text-lg">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {MENU_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors block ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-gray-200 mt-auto">
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors block"
              >
                <LogOut className="h-5 w-5" /> Sair
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main Content - always rendered */}
      <div
        className={`md:ml-64 min-h-screen pb-12 ${isLoginPage ? "md:ml-0" : ""}`}
      >
        <main className="container mx-auto px-4 py-6">{children}</main>
      </div>
    </div>
  );
}
