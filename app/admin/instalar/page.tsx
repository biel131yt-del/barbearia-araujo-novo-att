import type { Metadata } from "next";
export const metadata: Metadata = { title: "Instalar Araújo Admin" };
export default function InstalarAdmin() {
  return (
    <section className="max-w-2xl space-y-5">
      <h1 className="text-2xl font-bold">Instalar o app administrativo</h1>
      <p className="text-gray-600">
        Tenha um ícone Araújo Admin separado do aplicativo dos clientes. Apenas
        a conta do administrador pode usar o painel.
      </p>
      <div className="bg-white border rounded-2xl p-5 space-y-4">
        <h2 className="font-semibold">No iPhone</h2>
        <ol className="list-decimal pl-5 space-y-3 text-sm">
          <li>
            Abra o Safari. Se estiver dentro do aplicativo dos clientes, volte
            ao Safari primeiro.
          </li>
          <li>
            Entre neste endereço e faça login com a conta do administrador:
          </li>
        </ol>
        <p className="select-all break-all rounded-xl bg-gray-50 border p-3 text-sm">
          https://barbearia-araujo-projeto-novo.vercel.app/admin/instalar
        </p>
        <ol start={3} className="list-decimal pl-5 space-y-3 text-sm">
          <li>Toque em Compartilhar e depois em Adicionar à Tela de Início.</li>
          <li>
            Confira o nome Araújo Admin. Se aparecer Abrir como App, deixe
            ativado e toque em Adicionar.
          </li>
          <li>
            Abra o novo ícone. Se o iPhone pedir, entre novamente com a conta do
            administrador.
          </li>
        </ol>
      </div>
      <p className="text-sm text-gray-500">
        Você pode manter o app dos clientes instalado. Depois, ative as
        notificações dentro do app administrativo, em Notificações.
      </p>
    </section>
  );
}
