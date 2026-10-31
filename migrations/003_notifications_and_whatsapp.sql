BEGIN;
ALTER TABLE push_devices ADD COLUMN IF NOT EXISTS client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS whatsapp_required BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS whatsapp_opened_at TIMESTAMPTZ;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS whatsapp_client_reported_at TIMESTAMPTZ;
CREATE TABLE IF NOT EXISTS push_jobs (
 id SERIAL PRIMARY KEY,notification_id INTEGER UNIQUE REFERENCES notifications(id) ON DELETE CASCADE,
 state TEXT NOT NULL DEFAULT 'pending',attempts INTEGER NOT NULL DEFAULT 0,
 next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),locked_until TIMESTAMPTZ,last_error TEXT,accepted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS push_jobs_pending ON push_jobs(state,next_attempt_at);
CREATE OR REPLACE FUNCTION notify_booking_change() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE n_id INTEGER; owner_id INTEGER; heading TEXT; content TEXT; preference TEXT;
BEGIN
 IF TG_OP='UPDATE' AND NEW.status=OLD.status THEN RETURN NEW; END IF;
 heading:=CASE WHEN TG_OP='INSERT' THEN 'Novo agendamento' WHEN NEW.status='confirmed' THEN 'Agendamento confirmado' WHEN NEW.status='cancelled' THEN 'Agendamento cancelado' WHEN NEW.status='completed' THEN 'Atendimento concluído' ELSE 'Agendamento atualizado' END;
 content:=NEW.client_name||' · '||NEW.service_name||' · '||to_char(NEW.appointment_date,'DD/MM/YYYY')||' às '||to_char(NEW.appointment_time,'HH24:MI');
 preference:=CASE WHEN TG_OP='INSERT' THEN 'notify_new_appointment' WHEN NEW.status='confirmed' THEN 'notify_confirmed' WHEN NEW.status='cancelled' THEN 'notify_cancelled' ELSE 'notify_status' END;
 IF NOT EXISTS(SELECT 1 FROM settings WHERE key=preference AND value='false') THEN
 FOR owner_id IN SELECT id FROM users WHERE is_active=true AND role IN ('admin','manager') LOOP
 INSERT INTO notifications(user_id,title,message,type,link) VALUES(owner_id,heading,content,'info','/admin/agenda') RETURNING id INTO n_id;
 INSERT INTO push_jobs(notification_id) VALUES(n_id);
 END LOOP;
 END IF;
 IF NEW.client_id IS NOT NULL THEN
 INSERT INTO notifications(client_id,title,message,type,link) VALUES(NEW.client_id,heading,NEW.service_name||' · '||to_char(NEW.appointment_date,'DD/MM/YYYY')||' às '||to_char(NEW.appointment_time,'HH24:MI'),'info','/cliente') RETURNING id INTO n_id;
 INSERT INTO push_jobs(notification_id) VALUES(n_id);
 END IF;
 RETURN NEW;
END $$;
CREATE OR REPLACE TRIGGER booking_notifications AFTER INSERT OR UPDATE OF status ON appointments FOR EACH ROW EXECUTE FUNCTION notify_booking_change();
INSERT INTO settings(key,value,category) VALUES('telefone_whatsapp','5551996824286','general') ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value;
CREATE UNIQUE INDEX IF NOT EXISTS one_pending_whatsapp_per_client ON appointments(client_id) WHERE whatsapp_required=true AND whatsapp_client_reported_at IS NULL AND status IN ('scheduled','confirmed');
COMMIT;
