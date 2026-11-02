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
## Avaliações e convite após o atendimento — 02/11/2026

A conta do cliente exibe Avalie seu atendimento para reservas concluídas. Cada atendimento aceita uma nota inteira de 1 a 5 e comentário opcional de até 1000 caracteres, somente do titular. O cliente vê sua avaliação salva; o dono consulta em Avaliações. Ao voltar à aba, a conta atualiza os atendimentos.

Ao marcar Concluído, a conclusão e o pedido de lembrete são registrados na mesma transação. O prazo é de 30 minutos contados de completed_at, não do horário originalmente agendado. Vercel Workflow mantém uma espera durável no servidor. Após o prazo, se ainda não houver avaliação, cria notificação interna e trabalho push com link direto ao formulário. A criação é idempotente. Avaliar antes dispensa o convite; avaliar com envio ainda pendente cancela o trabalho de push correspondente. Não é possível recolher uma mensagem que já tenha sido aceita pelo provedor.

O convite de ativação aparece ao entrar no site; a permissão nativa exige toque do usuário. No iPhone, instalar na Tela de Início e abrir pelo ícone é necessário para Web Push (iOS 16.4+). A recusa e o botão Agora não são respeitados. Permissões já concedidas podem ser vinculadas à conta ao entrar, mas a desativação manual não é revertida automaticamente. A entrega depende do sistema, rede, Foco e permissões.

Implantação: aplicar migration 004 depois de 001–003, habilitar System Environment Variables no projeto Vercel e publicar com workflow/next. Não interceptar /.well-known/workflow/ no middleware. O manifesto e os endpoints internos de Workflow são gerados pelo SDK. O package.json não força commonjs, para os arquivos ESM gerados pelo SDK serem compilados corretamente. O cliente HTTP undici usa a linha corrigida 7.30.1+.

A migration 004 foi testada e aplicada ao Neon após backup br-raspy-truth-b6rgo96t. Ela também prepara convites dos atendimentos concluídos nas últimas 24 horas, preservando o prazo original de 30 minutos e dispensando quem já avaliou.

Validação: autorização e titularidade da avaliação, notas/comentários inválidos, duplicação, persistência no cliente/admin; espera real do Workflow e retomada com relógio acelerado exclusivamente na branch de teste; supressão de convites antes do prazo/já avaliados e criação sem duplicação. Push no iPhone físico requer o teste no aparelho. O cron diário continua como recuperação de agendamentos que falhem ao iniciar, sem limitar o Workflow a uma execução por dia.
## Agenda simplificada — 02/11/2026

Abrir dias agora usa dois passos: escolher os dias e informar começo/término. Atalhos: Só hoje, Só amanhã, Próximos 7 dias, Semana seguinte e turnos Manhã/Tarde/Noite. Pausas ficam em uma opção separada. Dias abertos podem ser alterados ou fechados; reservas existentes são preservadas.

A lista de inícios segue a duração do serviço, com mínimo de 30 minutos entre opções. Serviço de 30 minutos oferece 19:00, 19:30 etc.; serviço de 60 oferece 19:00, 20:00 etc. Serviços de 40/50 continuam usando a duração cadastrada, sem alterar seus preços ou reservas antigas. O servidor valida a mesma regra e impede sobreposições. O tempo pode ser ajustado em Serviços, por serviço.

Validação: cinco testes automatizados, incluindo cadência de 30/60 minutos, ocupação existente e encaixe no fim do período. APIs na branch isolada confirmaram 30/40/50/60 minutos, recusa de início 19:15 e bloqueio de uma hora inteira. Abertura de sete dias à noite conferida no navegador, na base de teste.
