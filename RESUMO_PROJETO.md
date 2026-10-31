# 📋 RESUMO DO PROJETO — Barbearia Araújo (Versão Premium + Painel Administrativo Master)

## 1. O que é

Adaptação autorizada do site https://app-site-barbearia-araujo.vercel.app/ em uma **plataforma premium de gestão e agendamento**, reconstruída com Next.js 15 + React 19 + Tailwind CSS. Inclui site para clientes, **área do cliente** e um **painel administrativo completo** para controle operacional, financeiro, comercial e administrativo da barbearia.

---

## 2. Stack tecnológica

- **Framework:** Next.js 15 (App Router)
- **React:** 19
- **Estilização:** Tailwind CSS v3
- **Animações:** framer-motion
- **Ícones:** lucide-react
- **Banco:** Neon PostgreSQL serverless via `@neondatabase/serverless`
- **Deploy alvo:** Vercel
- **PWA:** manifest.json (instalável no celular)
- **Notificações:** Web Push (VAPID) - implementado

---

## 3. Estrutura de pastas

```
/app
  ├── layout.tsx              (raiz, fontes, metadata, viewport)
  ├── page.tsx                (site público: hero, serviços, como funciona, booking, depoimentos, galeria, CTA, footer)
  ├── agendar/
  │     └── page.tsx          (fluxo de agendamento em 3 etapas - público)
  ├── cliente/
  │     ├── page.tsx          (dashboard do cliente: meus agendamentos)
  │     ├── login/page.tsx    (login do cliente)
  │     └── cadastro/page.tsx (cadastro do cliente)
  ├── admin/
  │     ├── layout.tsx        (layout do painel com sidebar)
  │     ├── page.tsx          (dashboard admin com indicadores)
  │     ├── login/page.tsx    (login admin)
  │     ├── agenda/page.tsx   (agenda profissional)
  │     ├── clientes/page.tsx (CRM clientes admin)
  │     ├── servicos/page.tsx (serviços e preços)
  │     ├── equipe/page.tsx   (barbeiros)
  │     ├── financeiro/
  │     │     ├── page.tsx            (hub receitas/despesas/fluxo/fechamento)
  │     │     ├── receitas/page.tsx   (cadastro e listagem de receitas)
  │     │     ├── despesas/page.tsx   (cadastro e listagem de despesas)
  │     │     ├── fluxo-caixa/page.tsx (fluxo de caixa por período)
  │     │     └── fechamento/page.tsx (fechamento diário de caixa)
  │     ├── avaliacoes/page.tsx       (avaliações)
  │     ├── notificacoes/page.tsx     (central de notificações + PushSubscription)
  │     └── configuracoes/page.tsx    (configurações do sistema)
  ├── api/
  │     ├── appointments/route.ts   (POST: salva agendamento público)
  │     ├── lembretes/route.ts      (GET: agendamentos do dia)
  │     ├── auth/
  │     │     ├── login/route.ts        (login admin)
  │     │     ├── logout/route.ts       (logout admin)
  │     │     ├── me/route.ts           (verificar sessão admin)
  │     │     └── client/
  │     │           ├── register/route.ts (cadastro cliente)
  │     │           ├── login/route.ts    (login cliente)
  │     │           ├── me/route.ts       (verificar sessão cliente)
  │     │           └── logout/route.ts   (logout cliente)
  │     ├── cliente/
  │     │     └── appointments/route.ts (agendamentos do cliente logado)
  │     ├── admin/
  │     │     ├── dashboard/route.ts
  │     │     ├── appointments/route.ts (GET/POST)
  │     │     ├── clients/route.ts (GET/POST)
  │     │     ├── services/route.ts (GET/POST)
  │     │     ├── barbers/route.ts (GET)
  │     │     ├── estoque/route.ts (GET/POST)
  │     │     ├── financeiro/route.ts (dashboard)
  │     │     ├── financeiro/receitas/route.ts (GET/POST)
  │     │     ├── financeiro/despesas/route.ts (GET/POST)
  │     │     ├── financeiro/fluxo-caixa/route.ts (GET)
  │     │     ├── financeiro/fechamentos/route.ts (GET/POST)
  │     │     ├── avaliacoes/route.ts
  │     │     ├── notifications/route.ts (GET/POST)
  │     │     └── configuracoes/route.ts
  │     └── push/
  │           ├── vapid/route.ts      (GET: chave pública VAPID)
  │           ├── subscribe/route.ts  (POST/DELETE: inscrever dispositivo)
  │           ├── send/route.ts       (POST: enviar notificação push)
  │           └── devices/route.ts    (GET: listar dispositivos)
/components
  ├── Header, Hero, Services, HowItWorks, Booking, Testimonials, Gallery, CTA, Footer (site público)
  └── PushSubscription.tsx (ativa/desativa notificações push)
/lib
  ├── db.ts             (conexão Neon + tipos + initDb + helpers financeiros)
  ├── auth.ts           (autenticação admin e cliente, sessão, auditoria, hash senha)
  ├── session.ts        (hook de sessão admin)
  └── webpush.ts        (VAPID, registro/envio de notificações push)
/migrations
  └── 001_initial_schema.sql   (schema completo versionado com 20+ tabelas)
/public
  ├── manifest.json         (PWA)
  ├── sw.js                 (Service Worker para notificações push)
  └── icon-192.png, icon-512.png, favicon.ico, apple-touch-icon.png
/middleware.ts          (proteção de rotas /admin)
```

---

## 4. Rotas e APIs

### Site público

| Rota       | Descrição                |
| ---------- | ------------------------ |
| `/`        | Página principal premium |
| `/agendar` | Agendamento em 3 etapas  |

### Área do cliente

| Rota                | Descrição                    |
| ------------------- | ---------------------------- |
| `/cliente`          | Dashboard: meus agendamentos |
| `/cliente/login`    | Login do cliente             |
| `/cliente/cadastro` | Cadastro do cliente          |

### API pública

| Rota                | Método | Descrição                                 |
| ------------------- | ------ | ----------------------------------------- |
| `/api/appointments` | POST   | Salva agendamento (com fallback WhatsApp) |
| `/api/lembretes`    | GET    | Lista agendamentos do dia não confirmados |

### API cliente

| Rota                        | Método | Descrição                           |
| --------------------------- | ------ | ----------------------------------- |
| `/api/auth/client/register` | POST   | Cadastro de cliente                 |
| `/api/auth/client/login`    | POST   | Login do cliente (cookie de sessão) |
| `/api/auth/client/me`       | GET    | Verificar sessão do cliente         |
| `/api/auth/client/logout`   | POST   | Logout do cliente                   |
| `/api/cliente/appointments` | GET    | Agendamentos do cliente logado      |

### Área administrativa (protegida por middleware)

| Rota                                | Método   | Descrição                    |
| ----------------------------------- | -------- | ---------------------------- |
| `/admin/login`                      | GET/POST | Login do administrador       |
| `/api/auth/me`                      | GET      | Verificar sessão admin       |
| `/api/auth/logout`                  | POST     | Logout admin                 |
| `/api/admin/dashboard`              | GET      | Indicadores do dashboard     |
| `/api/admin/appointments`           | GET/POST | Agendamentos                 |
| `/api/admin/clients`                | GET/POST | Clientes CRM                 |
| `/api/admin/services`               | GET/POST | Serviços e preços            |
| `/api/admin/barbers`                | GET      | Equipe de barbeiros          |
| `/api/admin/estoque`                | GET/POST | Produtos e estoque           |
| `/api/admin/financeiro`             | GET      | Dashboard financeiro         |
| `/api/admin/financeiro/receitas`    | GET/POST | Receitas                     |
| `/api/admin/financeiro/despesas`    | GET/POST | Despesas                     |
| `/api/admin/financeiro/fluxo-caixa` | GET      | Fluxo de caixa por período   |
| `/api/admin/financeiro/fechamentos` | GET/POST | Fechamentos diários de caixa |
| `/api/admin/avaliacoes`             | GET      | Avaliações                   |
| `/api/admin/notifications`          | GET/POST | Notificações admin           |
| `/api/admin/configuracoes`          | GET      | Configurações do sistema     |

### Web Push (VAPID)

| Rota                  | Método      | Descrição                                         |
| --------------------- | ----------- | ------------------------------------------------- |
| `/api/push/vapid`     | GET         | Retorna chave pública VAPID                       |
| `/api/push/subscribe` | POST/DELETE | Inscreve/remove dispositivo push                  |
| `/api/push/send`      | POST        | Envia notificação push para todos os dispositivos |
| `/api/push/devices`   | GET         | Lista dispositivos inscritos                      |

---

## 5. Banco de dados — Neon PostgreSQL

Schema completo em `migrations/001_initial_schema.sql` com 20+ tabelas:

- **users** — usuários administrativos (admin, manager, barber)
- **clients** — CRM de clientes (com password_hash para login)
- **barbers** — barbeiros/equipe
- **barber_schedule** — horários de trabalho
- **services** — serviços (preço em centavos)
- **appointments** — agendamentos (vinculados a cliente e barbeiro)
- **payments** — pagamentos vinculados
- **revenues** — receitas reconhecidas
- **expense_categories** / **expenses** — despesas
- **products** / **stock_movements** — estoque
- **reviews** — avaliações
- **coupons** / **loyalty_transactions** — fidelidade
- **notifications** / **push_devices** — notificações e Web Push
- **audit_log** — log de auditoria
- **daily_closures** — fechamentos diários de caixa
- **settings** — configurações

Tabelas usam `IF NOT EXISTS` e seeds seguros (não sobrescrevem dados existentes).

---

## 6. Módulos implementados

### 6.1. Site Público

- Hero, Serviços (com preços), Como Funciona, Agendamento, Depoimentos, Galeria, CTA, Footer
- Responsivo (mobile-first)

### 6.2. Área do Cliente

- Cadastro e login com sessão de cookie
- Dashboard com lista de seus agendamentos (status, valor, pagamento)
- Botão para novo agendamento

### 6.3. Painel Administrativo

- Sidebar responsiva (desktop) + menu mobile (drawer)
- 12 módulos: Visão Geral, Agenda, Clientes, Serviços, Equipe, Financeiro, Estoque, Avaliações, Notificações, Configurações
- Logout, indicadores, estados vazios

### 6.4. Dashboard Principal

Indicadores calculados a partir de dados reais do Neon: agendamentos de hoje, próximos, concluídos, cancelados, receita recebida, receita prevista, resultado operacional, novos clientes, avaliação média.

### 6.5. Agenda Profissional

Listagem com filtros por data e busca, status visual, criação manual via API.

### 6.6. Clientes (CRM)

Lista com total de atendimentos, total gasto, status, busca por nome/telefone.

### 6.7. Serviços e Preços

Grid de serviços com preço, duração, destaque, criação via API.

### 6.8. Equipe (Barbeiros)

Lista de barbeiros com tipo de comissão, status ativo/inativo.

### 6.9. Financeiro Completo

- **Receitas:** cadastro, listagem, filtro por origem/forma pagamento
- **Despesas:** cadastro, listagem, filtro por categoria/status, alerta de vencidas
- **Fluxo de Caixa:** entradas, saídas, saldo final, movimentações por dia
- **Fechamento Diário:** dinheiro, pix, cartão, outros, ajustes, auditoria
- **Valores em centavos** (precisão monetária, sem ponto flutuante inadequado)

### 6.10. Estoque e Produtos

Cadastro de produtos, alerta de estoque baixo, histórico de movimentações.

### 6.11. Avaliações

Avaliação média, total, lista com estrelas e comentários.

### 6.12. Notificações (Central Administrativa)

Lista de notificações internas com status de leitura e link para tela respectiva.

### 6.13. Web Push (VAPID)

- Chave pública VAPID exposta via API
- Registro/remoção de dispositivos (Service Worker + pushManager)
- Envio de notificações para todos os dispositivos do usuário
- Service Worker (`public/sw.js`) para receber notificações mesmo com app fechado
- Componente `PushSubscription` na página de Configurações

### 6.14. Configurações

Configurações do sistema, segurança, notificações push.

---

## 7. Segurança e Auditoria

- **Middleware** protege todas as rotas `/admin` (exige sessão)
- **Autenticação admin** via cookie de sessão (httpOnly, secure em produção)
- **Autenticação cliente** via cookie de sessão
- **Audit log** registra operações importantes (usuário, ação, entidade, valores antigo/novo)
- Não registra senhas ou tokens
- Autorização no servidor

---

## 8. Status atual

- ✅ Código completo e funcional
- ✅ `npm run build` passa sem erros (Next.js 15, TypeScript 5)
- ✅ 51 rotas estáticas/dinâmicas, 29 APIs
- ✅ `.env.local` com `DATABASE_URL` do Neon já configurada
- ✅ `vercel.json` configurado (região `gru1`, cron de lembretes)
- ✅ `middleware.ts` protegendo rotas admin
- ✅ Financeiro completo implementado
- ✅ Web Push (VAPID) implementado
- ✅ Área do cliente implementada
- ⏳ Aguardando deploy na Vercel
- ⏳ Aguardando execução da migration `001_initial_schema.sql` no Neon
- ⏳ Variáveis VAPID (opcional): VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL

---

## 9. Variáveis de ambiente necessárias

| Variável            | Valor                                               |
| ------------------- | --------------------------------------------------- |
| `DATABASE_URL`      | `[CONFIGURAR DATABASE_URL NA VERCEL]`               |
| `VAPID_PUBLIC_KEY`  | (opcional) Gerar com `web-push generateVAPIDKeys()` |
| `VAPID_PRIVATE_KEY` | (opcional) Gerar com `web-push generateVAPIDKeys()` |
| `VAPID_EMAIL`       | (opcional) Ex: admin@barbeariaaraujo.com            |

---

## 10. Próximos passos (deploy)

1. **Executar migration no Neon:**
   - Conectar no Neon e rodar o SQL de `migrations/001_initial_schema.sql`

2. **Vercel:**

   ```
   vercel login
   vercel deploy --prod
   ```

   Ou conectar repositório Git no dashboard da Vercel.

3. **Variáveis de ambiente na Vercel:**
   - Project Settings → Environment Variables → adicionar `DATABASE_URL`
   - Opcional: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_EMAIL` para notificações push

4. **Primeiro acesso:**
   - Admin: `/admin/login` → `admin@barbeariaaraujo.com` / `admin123` (alterar após entrar)
   - Cliente: `/cliente/cadastro` → criar conta, depois `/cliente/login`

5. **Testar:**
   - Criar agendamento, cliente, serviço, despesa, produto
   - Verificar dashboard com dados reais
   - Validar responsividade mobile e desktop
   - Testar notificação push no iPhone (Safari → adicionar à Tela de Início)

---

## 11. Créditos / observações

- Desenvolvido preservando integralmente o site público existente
- Identidade visual da Barbearia Araújo mantida
- Número WhatsApp: 555196824286
- Endereço: Manoel Olavo da Rosa, 1044
- Sistema gerencial — não substitui contabilidade profissional ou obrigações fiscais (LGPD respeitada)
- O WhatsApp é canal complementar para notificações, nunca o único
