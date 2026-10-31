BEGIN;
CREATE TABLE IF NOT EXISTS auth_sessions (
  token_hash TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('admin', 'client')),
  subject_id INTEGER NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS auth_sessions_expiry ON auth_sessions(expires_at);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS image_url TEXT;
CREATE TABLE IF NOT EXISTS availability_windows (
  id SERIAL PRIMARY KEY,
  work_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  CHECK (end_time > start_time),
  UNIQUE(work_date, start_time, end_time)
);
CREATE INDEX IF NOT EXISTS availability_date ON availability_windows(work_date);
-- Uma cadeira: a exclusão de intervalos abaixo impede reservas simultâneas sobrepostas.
CREATE INDEX IF NOT EXISTS appointments_availability ON appointments(appointment_date, appointment_time);
DO $$ BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='appointments_no_overlap' AND conrelid='appointments'::regclass) THEN
ALTER TABLE appointments ADD CONSTRAINT appointments_no_overlap EXCLUDE USING gist (
  tsrange(appointment_date + appointment_time, appointment_date + appointment_time + duration_minutes * INTERVAL '1 minute', '[)') WITH &&
) WHERE (status NOT IN ('cancelled','no_show'));
END IF;
END $$;
CREATE TABLE IF NOT EXISTS service_promotions (
  service_id INTEGER PRIMARY KEY REFERENCES services(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  price_cents INTEGER NOT NULL CHECK(price_cents>=0),
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  CHECK(valid_until>=valid_from)
);

CREATE UNIQUE INDEX IF NOT EXISTS clients_registered_phone ON clients(regexp_replace(phone, '[^0-9]', '', 'g')) WHERE password_hash IS NOT NULL;
COMMIT;
