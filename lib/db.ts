import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL!);

/* ============================================================================
   TIPOS (align com o schema 001)
   ============================================================================ */

export type User = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: "admin" | "manager" | "barber";
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

export type Client = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  birth_date: Date | null;
  created_at: Date;
  updated_at: Date;
  last_appointment: Date | null;
  total_appointments: number;
  total_spent: number;
  status: "active" | "inactive";
  notes: string | null;
  loyalty_points: number;
};

export type Barber = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  commission_type: "none" | "percent" | "fixed";
  commission_value: number;
  created_at: Date;
  updated_at: Date;
};

export type Service = {
  id: number;
  name: string;
  description: string | null;
  price_cents: number;
  duration_minutes: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: Date;
  updated_at: Date;
};

export type Appointment = {
  id: number;
  client_id: number | null;
  barber_id: number | null;
  service_id: number | null;
  client_name: string;
  client_phone: string;
  service_name: string;
  price_cents: number;
  duration_minutes: number;
  appointment_date: Date;
  appointment_time: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
  payment_status: "pending" | "paid" | "partial" | "refunded";
  payment_method: string | null;
  whatsapp_confirmed: boolean;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  completed_at: Date | null;
  cancelled_at: Date | null;
};

export type Payment = {
  id: number;
  appointment_id: number | null;
  amount_cents: number;
  payment_method: string;
  status: "pending" | "approved" | "rejected" | "expired";
  external_id: string | null;
  paid_at: Date | null;
  created_at: Date;
  notes: string | null;
};

export type Revenue = {
  id: number;
  appointment_id: number | null;
  payment_id: number | null;
  amount_cents: number;
  source: string;
  payment_method: string;
  received_at: Date;
  created_at: Date;
};

export type ExpenseCategory = {
  id: number;
  name: string;
  color: string;
  is_active: boolean;
  created_at: Date;
};

export type Expense = {
  id: number;
  category_id: number | null;
  name: string;
  description: string | null;
  amount_cents: number;
  due_date: Date;
  paid_date: Date | null;
  payment_method: string | null;
  status: "pending" | "paid" | "overdue";
  receipt_url: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
};

export type Product = {
  id: number;
  name: string;
  description: string | null;
  sku: string | null;
  category: string | null;
  supplier: string | null;
  cost_cents: number;
  price_cents: number;
  stock_quantity: number;
  min_stock: number;
  is_for_sale: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

export type StockMovement = {
  id: number;
  product_id: number;
  type: "entry" | "exit" | "adjustment";
  quantity: number;
  reason: string | null;
  reference_type: string | null;
  reference_id: number | null;
  created_at: Date;
  created_by: string | null;
};

export type Review = {
  id: number;
  client_id: number | null;
  appointment_id: number | null;
  rating: number;
  comment: string | null;
  is_anonymous: boolean;
  created_at: Date;
};

export type Coupon = {
  id: number;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value_cents: number;
  max_uses: number | null;
  used_count: number;
  valid_from: Date;
  valid_until: Date;
  is_active: boolean;
  applies_to_all: boolean;
  service_ids: number[];
  created_at: Date;
};

export type LoyaltyTransaction = {
  id: number;
  client_id: number;
  points: number;
  type: "earned" | "redeemed" | "expired";
  reference_type: string | null;
  reference_id: number | null;
  created_at: Date;
};

export type Notification = {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  link: string | null;
  is_read: boolean;
  created_at: Date;
};

export type PushDevice = {
  id: number;
  user_id: number;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  user_agent: string | null;
  created_at: Date;
  last_used_at: Date | null;
};

export type AuditLog = {
  id: number;
  user_id: number | null;
  action: string;
  entity_type: string;
  entity_id: number | null;
  old_values: any;
  new_values: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
};

export type DailyClosure = {
  id: number;
  closure_date: Date;
  user_id: number | null;
  cash_total_cents: number;
  pix_total_cents: number;
  card_total_cents: number;
  other_total_cents: number;
  adjustments_cents: number;
  adjustments_note: string | null;
  status: "open" | "closed";
  closed_at: Date | null;
  created_at: Date;
};

export type Setting = {
  id: number;
  key: string;
  value: string | null;
  category: string;
  updated_at: Date;
};

/* ============================================================================
   INICIALIZAÇÃO (cria todas as tabelas se não existirem)
   ============================================================================ */

export async function initDb() {
  // appointments (preserva existente)
  await sql`
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
      status TEXT NOT NULL DEFAULT 'scheduled',
      payment_status TEXT NOT NULL DEFAULT 'pending',
      payment_method TEXT,
      whatsapp_confirmed BOOLEAN DEFAULT FALSE,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      completed_at TIMESTAMP,
      cancelled_at TIMESTAMP
    )
  `;

  // users
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // clients
  await sql`
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
      status TEXT DEFAULT 'active',
      notes TEXT,
      loyalty_points INTEGER DEFAULT 0
    )
  `;

  // barbers
  await sql`
    CREATE TABLE IF NOT EXISTS barbers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      commission_type TEXT DEFAULT 'none',
      commission_value DECIMAL(10,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // services
  await sql`
    CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price_cents INTEGER NOT NULL DEFAULT 0,
      duration_minutes INTEGER NOT NULL DEFAULT 30,
      is_active BOOLEAN DEFAULT TRUE,
      is_featured BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // payments
  await sql`
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
      amount_cents INTEGER NOT NULL,
      payment_method TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      external_id TEXT,
      paid_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      notes TEXT
    )
  `;

  // revenues
  await sql`
    CREATE TABLE IF NOT EXISTS revenues (
      id SERIAL PRIMARY KEY,
      appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
      payment_id INTEGER REFERENCES payments(id) ON DELETE SET NULL,
      amount_cents INTEGER NOT NULL,
      source TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      received_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // expense_categories
  await sql`
    CREATE TABLE IF NOT EXISTS expense_categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#6b7280',
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // expenses
  await sql`
    CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      category_id INTEGER REFERENCES expense_categories(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      description TEXT,
      amount_cents INTEGER NOT NULL,
      due_date DATE NOT NULL,
      paid_date DATE,
      payment_method TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      receipt_url TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // products
  await sql`
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
      is_for_sale BOOLEAN DEFAULT TRUE,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // stock_movements
  await sql`
    CREATE TABLE IF NOT EXISTS stock_movements (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      reason TEXT,
      reference_type TEXT,
      reference_id INTEGER,
      created_at TIMESTAMP DEFAULT NOW(),
      created_by TEXT
    )
  `;

  // reviews
  await sql`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
      appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      is_anonymous BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // coupons
  await sql`
    CREATE TABLE IF NOT EXISTS coupons (
      id SERIAL PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT NOT NULL,
      discount_value_cents INTEGER NOT NULL DEFAULT 0,
      max_uses INTEGER,
      used_count INTEGER DEFAULT 0,
      valid_from DATE NOT NULL,
      valid_until DATE NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      applies_to_all BOOLEAN DEFAULT TRUE,
      service_ids INTEGER[],
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // loyalty_transactions
  await sql`
    CREATE TABLE IF NOT EXISTS loyalty_transactions (
      id SERIAL PRIMARY KEY,
      client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
      points INTEGER NOT NULL,
      type TEXT NOT NULL,
      reference_type TEXT,
      reference_id INTEGER,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // notifications
  await sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info',
      link TEXT,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // push_devices
  await sql`
    CREATE TABLE IF NOT EXISTS push_devices (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      endpoint TEXT NOT NULL,
      p256dh_key TEXT NOT NULL,
      auth_key TEXT NOT NULL,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      last_used_at TIMESTAMP
    )
  `;

  // audit_log
  await sql`
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
    )
  `;

  // daily_closures
  await sql`
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
      status TEXT NOT NULL DEFAULT 'open',
      closed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // settings
  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      id SERIAL PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      category TEXT DEFAULT 'general',
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // índices
  await sql`CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_expenses_due_date ON expenses(due_date)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_quantity)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at)`;

  // seed seguro (não sobrescreve)
  await sql`
    INSERT INTO users (name, email, password_hash, role)
    SELECT 'Administrador', 'admin@barbeariaaraujo.com', '\$2a\$10\$dummy.hash.placeholder', 'admin'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@barbeariaaraujo.com')
  `;

  const defaultCategories = [
    ['Aluguel', '#ef4444'], ['Água', '#3b82f6'], ['Energia elétrica', '#f59e0b'],
    ['Internet', '#8b5cf6'], ['Produtos e materiais', '#10b981'], ['Manutenção', '#f97316'],
    ['Equipamentos', '#6366f1'], ['Marketing', '#ec4899'], ['Salários e comissões', '#14b8a6'],
    ['Impostos', '#dc2626'], ['Outros', '#6b7280'],
  ];
  for (const [name, color] of defaultCategories) {
    await sql`
      INSERT INTO expense_categories (name, color)
      SELECT ${name}, ${color}
      WHERE NOT EXISTS (SELECT 1 FROM expense_categories WHERE name = ${name})
    `;
  }

  const defaultServices = [
    ['Degradê', 'Degradê na máquina + acabamento fino', 3000, 40, false],
    ['Degradê Navalhado', 'Degradê + detalhe com navalha', 3500, 50, true],
    ['Barba', 'Toalha quente + navalha + modelo', 1700, 30, false],
    ['Corte + Barba', 'Combo completo: degradê + barba', 4500, 60, false],
  ];
  for (const [name, desc, price, duration, featured] of defaultServices) {
    await sql`
      INSERT INTO services (name, description, price_cents, duration_minutes, is_featured)
      SELECT ${name}, ${desc}, ${price}, ${duration}, ${featured}
      WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = ${name})
    `;
  }
}

/* ============================================================================
   HELPERS FINANCEIROS (centavos -> decimal)
   ============================================================================ */

export function centsToReal(cents: number): number {
  return Math.round(cents) / 100;
}

export function realToCents(real: number): number {
  return Math.round(real * 100);
}
