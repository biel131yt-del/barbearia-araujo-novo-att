# Atualização do fluxo de agendamento

Implementado: cadastro com senha persistida e login automático, sessões opacas (cliente: até 180 dias; administrador: 7 dias), catálogo do banco com foto opcional por URL HTTPS, disponibilidade em lote por datas e períodos, reserva com validação no servidor e proteção contra sobreposição, clientes com métricas reais e link de mensagem personalizada para WhatsApp, ofertas por serviço/data, conclusão de atendimento com receita única, lançamentos de receitas e despesas, pagamento de despesas e instalação PWA.

## Implantação

1. Autorizar a integração Neon e confirmar que o banco é o mesmo do projeto Vercel `barbearia-araujo-projeto-novo`.
2. Inspecionar o esquema existente, duplicidades de telefone em contas cadastradas e sobreposições de agendamentos. A migration 002 aborta e preserva os dados caso exista conflito; não elimina registros.
3. Testar `migrations/002_booking_and_sessions.sql` em uma branch Neon de desenvolvimento. A migration 001 foi corrigida para instalações novas (ordem da tabela services); não deve ser reaplicada cegamente em um banco legado.
4. Validar no navegador: cadastrar, fechar/reabrir e manter acesso; editar serviços; abrir dias e intervalos; reservar; verificar reserva no cliente e no admin; concluir e conferir uma única receita; cadastrar/pagar despesa; testar oferta dentro/fora das datas e instalação no celular.
5. Aplicar a migration 002 ao banco de produção antes de publicar esta versão. Fazer backup/branch de restauração antes da mudança. As sessões antigas serão invalidadas: entrar novamente.
6. Publicar a versão validada e verificar os mesmos fluxos no domínio de produção. Não há dias abertos por padrão: o administrador precisa escolher a disponibilidade.

## Limites e pendências

- O modelo atende uma cadeira/um barbeiro por vez, conforme a operação descrita. A tela legada de equipe não muda essa regra.
- Fotos são cadastradas por link HTTPS. Upload de arquivos para storage não foi implementado.
- O WhatsApp abre uma conversa para revisão/envio manual. Não há envio automático nem uso de API paga.
- O aplicativo é uma PWA; não é um aplicativo publicado nas lojas. Não permite reservar offline.
- Não há cobrança online. Concluir um atendimento significa registrar pagamento recebido no local.
- Clientes internos sem senha não podem assumir uma conta apenas informando telefone. É preciso definir um fluxo de convite/recuperação com verificação para migrar cadastros antigos com segurança.
- A credencial DATABASE_URL que estava no resumo foi removida do arquivo atual, mas permanece no histórico público: rotacionar no Neon e atualizar a Vercel.
- Atualização de 31/10/2026: Neon conectado. A estrutura de produção tinha somente users, clients e barbers. As migrations 001 (ordem corrigida) e 002 foram validadas em branch isolada e aplicadas em transação a produção. Foram preservados o usuário administrador e a ausência de clientes/agendamentos. O código ainda não foi publicado na Vercel nem sincronizado com o GitHub por bloqueios de autorização.
- `npm audit` sinaliza avisos preexistentes em Next e PostCSS, sem correção automática disponível. Não foi aplicado upgrade forçado.

## Verificação local

- `npm test`: migrações em PostgreSQL isolado (PGlite), reexecução segura, reservas, conflitos, duração, fechamento, preço, promoção e receita sem duplicação; horários e fuso de Brasília.
- `npm run typecheck`.
- `npm run build` com DATABASE_URL fictícia válida para a compilação; não valida acesso ao banco real.

## Validação no Neon — 31/10/2026

- Projeto: `odd-night-77525369` — Felipe Barbearia araujo Versão 2.
- Produção: `br-wild-cloud-b64wpayy` (`neondb`).
- Backup anterior às migrations, sem compute: `br-super-bonus-b6vij9dg`.
- Branch isolada com registros fictícios de teste: `br-lucky-unit-b6n2kvbz`.
- APIs validadas com o servidor local ligado à branch isolada: login admin 200; cadastro 201; sessão cliente 200; disponibilidade 200; reserva 201; repetição 409; visitante sem login 401; histórico 200; conclusão 200; conclusão repetida 409; receitas 200 com uma entrada; cadastro e pagamento de despesa 201/200; oferta 200 e preço descontado pela data; logout e novo login 200.
- UI: login administrativo, agenda com períodos separados, login cliente, seleção de serviço, consulta de horários reais, revisão com preço promocional e confirmação “Horário reservado!”.
- Produção após migrations: 1 usuário, 0 clientes, 0 agendamentos, 4 serviços iniciais e 0 receitas. Os testes não contaminaram produção.
- Pendências externas: autorizar o time da Vercel para a integração e renovar o GitHub CLI (o token local expirou; a integração de GitHub recusou escrita com 403). Não publicar de uma versão antiga do GitHub, pois ela não contém estas correções.
