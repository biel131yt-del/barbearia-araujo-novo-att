-- ============================================================================
-- MIGRATION 001 - SCHEMA INICIAL BARBEARIA ARAÚJO
-- Preserva dados existentes da tabela appointments
-- ============================================================================

-- Tabela de usuários administrativos (preserva acesso existente)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin', -- admin, manager, barber
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de clientes (CRM)
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  password_hash TEXT,
  birth_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_appointment TIMESTAMP,
  total_appointments INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'active', -- active, inactive
  notes TEXT,
  loyalty_points INTEGER DEFAULT 0
);

-- Tabela de barbeiros / equipe
CREATE TABLE IF NOT EXISTS barbers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  commission_type TEXT DEFAULT 'none', -- none, percent, fixed
  commission_value DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Serviços realizados por cada barbeiro
CREATE TABLE IF NOT EXISTS barber_services (
  id SERIAL PRIMARY KEY,
  barber_id INTEGER REFERENCES barbers(id) ON DELETE CASCADE,
  service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(barber_id, service_id)
);

-- Disponibilidade dos barbeiros (horários de trabalho)
CREATE TABLE IF NOT EXISTS barber_schedule (
  id SERIAL PRIMARY KEY,
  barber_id INTEGER REFERENCES barbers(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0=domingo, 1=segunda, ...
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_working BOOLEAN DEFAULT TRUE,
  break_start TIME,
  break_end TIME,
  UNIQUE(barber_id, day_of_week)
);

-- Folgas e bloqueios individuais
CREATE TABLE IF NOT EXISTS barber_time_off (
  id SERIAL PRIMARY KEY,
  barber_id INTEGER REFERENCES barbers(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  is_all_day BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Horários bloqueados manuais
CREATE TABLE IF NOT EXISTS blocked_slots (
  id SERIAL PRIMARY KEY,
  barber_id INTEGER REFERENCES barbers(id) ON DELETE SET NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Serviços (preços, duração)
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0, -- armazenado em centavos para precisão
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Agendamentos (expande tabela existente)
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  barber_id INTEGER REFERENCES barbers(id) ON DELETE SET NULL,
  service_id INTEGER REFERENCES services(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  service_name TEXT NOT NULL,
  price_cents INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, confirmed, completed, cancelled, no_show
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, partial, refunded
  payment_method TEXT, -- pix, cash, debit_card, credit_card, other
  whatsapp_confirmed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP
);

-- Pagamentos vinculados a agendamentos
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
  amount_cents INTEGER NOT NULL,
  payment_method TEXT NOT NULL, -- pix, cash, debit_card, credit_card, other
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, expired
  external_id TEXT, -- ID do gateway (Mercado Pago, etc.)
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  notes TEXT
);

-- Receitas (reconhecimento de receita quando pagamento efetivamente recebido)
CREATE TABLE IF NOT EXISTS revenues (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
  payment_id INTEGER REFERENCES payments(id) ON DELETE SET NULL,
  amount_cents INTEGER NOT NULL,
  source TEXT NOT NULL, -- appointment, product_sale, manual
  payment_method TEXT NOT NULL,
  received_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Categorias financeiras (despesas)
CREATE TABLE IF NOT EXISTS expense_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6b7280',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Despesas
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES expense_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  amount_cents INTEGER NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  payment_method TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, overdue
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Produtos e estoque
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT,
  category TEXT,
  supplier TEXT,
  cost_cents INTEGER NOT NULL DEFAULT 0,
  price_cents INTEGER NOT NULL DEFAULT 0,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 0,
  is_for_sale BOOLEAN DEFAULT TRUE, -- verdadeiro = vende ao cliente, falso = uso interno
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Movimentações de estoque
CREATE TABLE IF NOT EXISTS stock_movements (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- entry, exit, adjustment
  quantity INTEGER NOT NULL,
  reason TEXT,
  reference_type TEXT, -- sale, purchase, adjustment
  reference_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT
);

-- Avaliações
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cupons e promoções
CREATE TABLE IF NOT EXISTS coupons (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL, -- percent, fixed
  discount_value_cents INTEGER NOT NULL DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  applies_to_all BOOLEAN DEFAULT TRUE,
  service_ids INTEGER[], -- array de IDs de serviços se applies_to_all = false
  created_at TIMESTAMP DEFAULT NOW()
);

-- Pontuação de fidelidade
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  type TEXT NOT NULL, -- earned, redeemed, expired
  reference_type TEXT, -- appointment, manual
  reference_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notificações administrativas
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, success, warning, error
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Dispositivos push (Web Push)
CREATE TABLE IF NOT EXISTS push_devices (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP
);

-- Log de auditoria
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Fechamentos diários de caixa
CREATE TABLE IF NOT EXISTS daily_closures (
  id SERIAL PRIMARY KEY,
  closure_date DATE NOT NULL UNIQUE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  cash_total_cents INTEGER DEFAULT 0,
  pix_total_cents INTEGER DEFAULT 0,
  card_total_cents INTEGER DEFAULT 0,
  other_total_cents INTEGER DEFAULT 0,
  adjustments_cents INTEGER DEFAULT 0,
  adjustments_note TEXT,
  status TEXT NOT NULL DEFAULT 'open', -- open, closed
  closed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Configurações do sistema
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  category TEXT DEFAULT 'general',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_barber ON appointments(barber_id);
CREATE INDEX IF NOT EXISTS idx_payments_appointment ON payments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_revenues_received_at ON revenues(received_at);
CREATE INDEX IF NOT EXISTS idx_expenses_due_date ON expenses(due_date);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_client ON reviews(client_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

-- ============================================================================
-- DADOS INICIAIS (seed seguro, não sobrescreve existentes)
-- ============================================================================

-- Usuário admin padrão (senha: admin123 - deve ser alterada)
INSERT INTO users (name, email, password_hash, role)
SELECT 'Administrador', 'admin@barbeariaaraujo.com', '\$2a\$10\$dummy.hash.placeholder', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@barbeariaaraujo.com');

-- Categorias de despesa iniciais
INSERT INTO expense_categories (name, color)
SELECT 'Aluguel', '#ef4444' WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE name = 'Aluguel');
INSERT INTO expense_categories (name, color)
SELECT 'Água', '#3b82f6' WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE name = 'Água');
INSERT INTO expense_categories (name, color)
SELECT 'Energia elétrica', '#f59e0b' WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE name = 'Energia elétrica');
INSERT INTO expense_categories (name, color)
SELECT 'Internet', '#8b5cf6' WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE name = 'Internet');
INSERT INTO expense_categories (name, color)
SELECT 'Produtos e materiais', '#10b981' WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE name = 'Produtos e materiais');
INSERT INTO expense_categories (name, color)
SELECT 'Manutenção', '#f97316' WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE name = 'Manutenção');
INSERT INTO expense_categories (name, color)
SELECT 'Equipamentos', '#6366f1' WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE name = 'Equipamentos');
INSERT INTO expense_categories (name, color)
SELECT 'Marketing', '#ec4899' WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE name = 'Marketing');
INSERT INTO expense_categories (name, color)
SELECT 'Salários e comissões', '#14b8a6' WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE name = 'Salários e comissões');
INSERT INTO expense_categories (name, color)
SELECT 'Impostos', '#dc2626' WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE name = 'Impostos');
INSERT INTO expense_categories (name, color)
SELECT 'Outros', '#6b7280' WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE name = 'Outros');

-- Serviços iniciais (preserva os existentes do site)
INSERT INTO services (name, description, price_cents, duration_minutes, is_featured)
SELECT 'Degradê', 'Degradê na máquina + acabamento fino', 3000, 40, FALSE
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Degradê');
INSERT INTO services (name, description, price_cents, duration_minutes, is_featured)
SELECT 'Degradê Navalhado', 'Degradê + detalhe com navalha', 3500, 50, TRUE
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Degradê Navalhado');
INSERT INTO services (name, description, price_cents, duration_minutes, is_featured)
SELECT 'Barba', 'Toalha quente + navalha + modelo', 1700, 30, FALSE
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Barba');
INSERT INTO services (name, description, price_cents, duration_minutes, is_featured)
SELECT 'Corte + Barba', 'Combo completo: degradê + barba', 4500, 60, FALSE
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Corte + Barba');
