"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/session";
import {
  Settings,
  Bell,
  Lock,
  Phone,
  MapPin,
  Clock,
  CreditCard,
  DollarSign,
  Users,
  Mail,
  Shield,
  RotateCcw,
  Info,
  FileText,
  Barcode,
} from "lucide-react";
import PushSubscription from "@/components/PushSubscription";

type Tab = "geral" | "notificacoes" | "seguranca" | "pagamento" | "sistema";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "geral", label: "Geral", icon: Settings },
  { id: "notificacoes", label: "Notificações", icon: Bell },
  { id: "seguranca", label: "Segurança", icon: Shield },
  { id: "pagamento", label: "Pagamentos", icon: CreditCard },
  { id: "sistema", label: "Sistema", icon: Barcode },
];

export default function ConfiguracoesPage() {
  const { user, loading } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("geral");
  const [settings, setSettings] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const res = await fetch("/api/admin/configuracoes");
      const data = await res.json();
      setSettings(data.settings || []);
    } catch {
      // ignore
    } finally {
      setLoadingData(false);
    }
  }

  function getSetting(key: string, def: string = "") {
    const found = settings.find((s) => s.key === key);
    return found?.value ?? def;
  }

  async function saveSetting(key: string, value: string) {
    setSaving(true);
    try {
      await fetch("/api/admin/configuracoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value, category: "geral" }),
      });
      await loadSettings();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-500">
            Gerencie as configurações da Barbearia Araújo
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === t.id
                ? "border-blue-900 text-blue-900 bg-blue-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <t.icon className="h-4 w-4 mr-2" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Conteúdo das abas */}
      {activeTab === "geral" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Dados da Barbearia" icon={Info} color="bg-blue-50">
            <SettingRow
              label="Nome da Barbearia"
              key="nome_barbearia"
              value={getSetting("nome_barbearia", "Barbearia Araújo")}
              onSave={saveSetting}
              saving={saving}
            />
            <SettingRow
              label="Endereço"
              key="endereco"
              value={getSetting("endereco", "Manoel Olavo da Rosa, 1044")}
              onSave={saveSetting}
              saving={saving}
            />
            <SettingRow
              label="Telefone WhatsApp"
              key="telefone_whatsapp"
              value={getSetting("telefone_whatsapp", "(51) 96824-2866")}
              onSave={saveSetting}
              saving={saving}
            />
            <SettingRow
              label="E-mail de contato"
              key="email_contato"
              value={getSetting("email_contato", "contato@barbeariaaraujo.com")}
              onSave={saveSetting}
              saving={saving}
            />
            <SettingRow
              label="Horário de Funcionamento"
              key="horario_funcionamento"
              value={getSetting(
                "horario_funcionamento",
                "Ter a Sáb: 9h às 19h",
              )}
              onSave={saveSetting}
              saving={saving}
            />
          </Card>
        </div>
      )}

      {activeTab === "notificacoes" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Notificações Push" icon={Bell} color="bg-indigo-50">
            <p className="text-sm text-gray-600 mb-4">
              Receba alertas em tempo real no seu dispositivo sobre novos
              agendamentos, pagamentos e estoque baixo.
            </p>
            <PushSubscription />
            <div className="mt-6 p-4 rounded-xl border border-gray-100 bg-gray-50">
              <h3 className="text-sm font-bold text-gray-900 mb-3">
                Eventos disponíveis
              </h3>
              <div className="space-y-2">
                <NotificationToggle
                  label="Novo agendamento"
                  key="notify_new_appointment"
                  defaultChecked
                />
                <NotificationToggle
                  label="Agendamento confirmado"
                  key="notify_confirmed"
                  defaultChecked
                />
                <NotificationToggle
                  label="Agendamento cancelado"
                  key="notify_cancelled"
                  defaultChecked
                />
                <NotificationToggle
                  label="Pagamento Pix aprovado"
                  key="notify_pix_approved"
                  defaultChecked
                />
                <NotificationToggle
                  label="Estoque abaixo do mínimo"
                  key="notify_low_stock"
                  defaultChecked
                />
                <NotificationToggle
                  label="Nova avaliação"
                  key="notify_new_review"
                  defaultChecked
                />
              </div>
            </div>
          </Card>

          <Card
            title="Enviar Notificação de Teste"
            icon={FileText}
            color="bg-green-50"
          >
            <p className="text-sm text-gray-600 mb-4">
              Teste se as notificações push estão funcionando no seu
              dispositivo.
            </p>
            <div className="space-y-3">
              <button
                onClick={sendTestNotification}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 transition-all"
              >
                <Bell className="h-4 w-4" /> Enviar Teste Push
              </button>
              {saving && <p className="text-xs text-indigo-600">Enviando...</p>}
            </div>
          </Card>
        </div>
      )}

      {activeTab === "seguranca" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Sessão Ativa" icon={Shield} color="bg-green-50">
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Usuário</p>
                    <p className="text-xs text-gray-500">{user.name}</p>
                  </div>
                  <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                    Ativo
                  </span>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">E-mail</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Função</p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Alterar Senha" icon={Lock} color="bg-rose-50">
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Senha atual
                </label>
                <input
                  type="password"
                  name="current_password"
                  required
                  className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nova senha
                </label>
                <input
                  type="password"
                  name="new_password"
                  required
                  minLength={8}
                  className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Confirmar nova senha
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  required
                  minLength={8}
                  className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-all"
              >
                <Lock className="h-4 w-4" /> Alterar Senha
              </button>
            </form>
          </Card>
        </div>
      )}

      {activeTab === "pagamento" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            title="Formas de Pagamento"
            icon={DollarSign}
            color="bg-emerald-50"
          >
            <div className="space-y-4">
              <PaymentToggle label="Pix" key="pagamento_pix" defaultChecked />
              <PaymentToggle
                label="Dinheiro"
                key="pagamento_dinheiro"
                defaultChecked
              />
              <PaymentToggle label="Cartão de Débito" key="pagamento_debito" />
              <PaymentToggle
                label="Cartão de Crédito"
                key="pagamento_credito"
              />
              <PaymentToggle label="Outros" key="pagamento_outros" />
            </div>
          </Card>

          <Card title="Chave Pix" icon={Phone} color="bg-green-50">
            <SettingRow
              label="Chave Pix (e-mail/telefone/CNPJ)"
              key="chave_pix"
              value={getSetting("chave_pix", "")}
              onSave={saveSetting}
              saving={saving}
            />
            <div className="mt-4 p-3 rounded-lg border border-dashed border-gray-200 bg-gray-50 text-center">
              <p className="text-sm text-gray-500">
                A chave Pix será exibida aos clientes no momento do pagamento.
              </p>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "sistema" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            title="Backup e Restauração"
            icon={RotateCcw}
            color="bg-purple-50"
          >
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                <FileText className="h-4 w-4" /> Fazer Backup dos Dados
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                <Barcode className="h-4 w-4" /> Restaurar Backup
              </button>
              <div className="pt-2 text-xs text-gray-500 text-center">
                O backup inclui agendamentos, clientes, financeiro e estoque.
              </div>
            </div>
          </Card>

          <Card title="Sobre o Sistema" icon={Info} color="bg-gray-50">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-white">
                <span className="text-sm text-gray-600">Versão</span>
                <span className="text-sm font-medium text-gray-900">
                  2.0.0 Premium
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-white">
                <span className="text-sm text-gray-600">Banco de Dados</span>
                <span className="text-sm font-medium text-gray-900">
                  Neon PostgreSQL
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-white">
                <span className="text-sm text-gray-600">Hospedagem</span>
                <span className="text-sm font-medium text-gray-900">
                  Vercel
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-white">
                <span className="text-sm text-gray-600">
                  Última atualização
                </span>
                <span className="text-sm font-medium text-gray-900">
                  Out 2026
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function Card({
  children,
  title,
  icon: Icon,
  color,
}: {
  children: React.ReactNode;
  title: string;
  icon: any;
  color: string;
}) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${color}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-white">
          {<Icon className="h-5 w-5" />}
        </div>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function SettingRow({
  label,
  key,
  value,
  onSave,
  saving,
}: {
  label: string;
  key: string;
  value: string;
  onSave: (k: string, v: string) => void;
  saving: boolean;
}) {
  const [inputValue, setInputValue] = useState(value);
  const [edited, setEdited] = useState(false);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 transition-colors">
      <span className="text-sm text-gray-700 font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={edited ? inputValue : value}
          onChange={(e) => {
            setInputValue(e.target.value);
            setEdited(true);
          }}
          disabled={saving}
          className="pl-3 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-colors max-w-xs"
        />
        {edited && (
          <button
            onClick={() => onSave(key, inputValue)}
            disabled={saving}
            className="px-3 py-2 rounded-lg bg-blue-900 text-white text-sm font-medium hover:bg-blue-800 disabled:opacity-60 transition-colors"
          >
            Salvar
          </button>
        )}
      </div>
    </div>
  );
}

function NotificationToggle({
  label,
  key,
  defaultChecked = false,
}: {
  label: string;
  key: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <label className="flex items-center justify-between p-2 rounded-lg border border-gray-100 bg-white cursor-pointer hover:bg-gray-50 transition-colors">
      <span className="text-sm text-gray-700">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        className="rounded text-blue-600 focus:ring-blue-500"
      />
    </label>
  );
}

function PaymentToggle({
  label,
  key,
  defaultChecked = false,
}: {
  label: string;
  key: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <label className="flex items-center justify-between p-2 rounded-lg border border-gray-100 bg-white cursor-pointer hover:bg-gray-50 transition-colors">
      <span className="text-sm text-gray-700">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        className="rounded text-green-600 focus:ring-green-500"
      />
    </label>
  );
}

function sendTestNotification() {
  // Chama a API de envio de push
  fetch("/api/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "🔔 Teste de Notificação",
      body: "As notificações push da Barbearia Araújo estão funcionando!",
      link: "/admin",
      type: "info",
    }),
  })
    .then((r) => r.json())
    .then((data) => {
      if (data.sent > 0) {
        alert(`Notificação enviada para ${data.sent} dispositivo(s)!`);
      } else {
        alert("Nenhum dispositivo inscrito. Ative as notificações primeiro.");
      }
    })
    .catch(() => alert("Erro ao enviar notificação."));
}

async function handlePasswordChange(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const form = e.currentTarget;
  const data = new FormData(form);
  if (data.get("new_password") !== data.get("confirm_password")) {
    alert("As senhas não coincidem.");
    return;
  }
  const button = form.querySelector("button");
  if (button) button.disabled = true;
  try {
    const r = await fetch("/api/auth/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        current_password: data.get("current_password"),
        new_password: data.get("new_password"),
      }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error);
    form.reset();
    alert("Senha alterada. As outras sessões foram encerradas.");
  } catch (e) {
    alert(e instanceof Error ? e.message : "Falha ao alterar senha");
  } finally {
    if (button) button.disabled = false;
  }
}
