# Barbearia Araújo — operação e implantação

O agendamento usa contas persistentes, serviços do banco, períodos de disponibilidade e proteção contra sobreposição. A operação considera uma cadeira por vez.

## Atualização do calendário e do painel

- Cliente escolhe mês, vê somente dias abertos com espaço para a duração do serviço e depois escolhe um horário livre, no fuso de Brasília.
- Toda nova reserva exige passar pela etapa de WhatsApp. A tela volta após recarregar e uma segunda reserva fica bloqueada enquanto a primeira tiver essa etapa pendente. O destino confirmado é (51) 99682-4286.
- O WhatsApp abre uma mensagem pronta. O cliente precisa tocar em Enviar no WhatsApp e declarar que enviou ao voltar. O sistema registra essa declaração; não consegue comprovar entrega nem enviar automaticamente sem uma integração com a API do WhatsApp.
- Estoque: criação, edição, ativação, entradas, saídas e histórico. A atualização do saldo e a movimentação são atômicas; uma saída maior que o saldo é recusada.
- Equipe: criação, edição, ativação e comissão. O cadastro não transforma a agenda em atendimento simultâneo de vários profissionais.
- Painel inicial mostra métricas reais por dia, semana ou mês. Fechamento de caixa registra um resumo das receitas da data, com ajustes e proteção contra fechamento duplicado. Despesas e lançamentos posteriores não alteram esse resumo.
- Configurações salvam contato, endereço, tema, cores e preferências de alertas. O botão de sol/lua muda o tema neste navegador. Exportação e importação incluem somente preferências; não são backup do banco.

## Notificações no iPhone

1. Abrir o site no Safari em iOS/iPadOS 16.4 ou superior.
2. Usar Compartilhar → Adicionar à Tela de Início e abrir pelo ícone instalado.
3. No painel do dono, entrar em Notificações; na conta do cliente, abrir as notificações do próprio aparelho.
4. Tocar em Ativar notificações e permitir o pedido do sistema.
5. Usar Enviar teste e conferir o recebimento no aparelho. Conferir também permissões do iOS e modo Foco.

Reservas e mudanças de status geram uma notificação interna e um trabalho persistente de push para o dono e o cliente. Preferências do dono são respeitadas. Inscrições expiradas são removidas e falhas transitórias ficam para novas tentativas. O processamento acontece após ações e na rotina diária já existente. Não foi adicionado serviço pago de mensagens.

O estado “aceita pelo serviço push” não comprova exibição ou leitura no aparelho. Entrega depende de instalação, permissão, conexão e sistema operacional. A validação automatizada não substitui o teste em um iPhone físico.

Referência: https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/

## Implantação

1. Para banco novo, executar migrations 001, 002 e 003 em ordem. Para o banco existente já com 001/002, aplicar somente 003. Criar uma branch de restauração antes de alterar produção e testar em uma branch isolada.
2. Definir DATABASE_URL no ambiente correspondente. Não reutilizar dados de produção em testes de gravação.
3. Para push, definir VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY e VAPID_EMAIL. As chaves devem pertencer ao mesmo par e não devem ser regeneradas a cada publicação.
4. Definir CRON_SECRET em produção para autenticar a rotina diária da Vercel. Sem essa variável, o endpoint exige uma sessão administrativa.
5. Executar npm test, npm run typecheck e npm run build. Publicar pelo GitHub/Vercel e conferir as rotas no domínio principal.

A migration 003 foi testada com reexecução segura e aplicada ao Neon de produção em 31/10/2026. Backup anterior a essa mudança: br-red-field-b66ds2q6, sem compute. Testes de gravação ficaram na branch isolada br-lucky-unit-b6n2kvbz.

## Verificação realizada

Testes locais e APIs na branch isolada cobriram calendário mensal, reserva e conflito, etapa de WhatsApp persistente, notificações internas e leitura, isolamento de contas, validação de inscrições push, estoque e histórico, equipe, configurações, painel e fechamento de caixa. As telas de calendário, estoque, temas e WhatsApp foram verificadas no navegador, inclusive no tamanho de celular. A compilação de produção passou.

## Pendências operacionais

- Fazer o teste de push no iPhone físico do dono e nos aparelhos dos clientes que autorizarem.
- Trocar a senha administrativa inicial pelo painel.
- A DATABASE_URL removida do antigo resumo ainda existe no histórico público do repositório: rotacionar a credencial no Neon e atualizar os ambientes da Vercel.
- Fotos continuam por URL HTTPS; não há upload de arquivos, pagamento online ou agendamento offline.
- Contas antigas sem senha precisam de um processo de convite/recuperação com verificação.

## Instalação separada no iPhone — 02/11/2026

No Safari, abrir /admin/instalar, entrar com a conta admin e usar Compartilhar → Adicionar à Tela de Início. O ícone Araújo Admin tem identidade própria e inicia em /admin; o app de clientes mantém sua identidade e inicia em /cliente. Os dois podem coexistir. Uma nova instalação pode pedir login novamente.

O manifesto administrativo exige uma sessão ativa com role admin, usa credenciais no link e não pode ser armazenado em cache compartilhado. Clientes, visitantes e cookies inválidos não obtêm esse manifesto nem as páginas administrativas. As APIs administrativas também exigem role admin. A instalação não concede privilégios. O iPhone ainda permite salvar qualquer URL como atalho: isso não libera o painel.

Validado no navegador e por HTTP: manifesto público, manifesto admin autenticado, páginas de instalação, credenciais no HTML, bloqueio de clientes/visitantes/cookies falsos e revogação após logout. Confirmar a instalação final no iPhone físico.
