CREATE UNIQUE INDEX IF NOT EXISTS reviews_one_per_appointment ON reviews(appointment_id) WHERE appointment_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS review_requests (
 appointment_id INTEGER PRIMARY KEY REFERENCES appointments(id) ON DELETE CASCADE,
 client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
 due_at TIMESTAMPTZ NOT NULL, workflow_run_id TEXT, scheduling_until TIMESTAMPTZ,
 notification_id INTEGER UNIQUE REFERENCES notifications(id), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO review_requests(appointment_id,client_id,due_at)
 SELECT id,client_id,completed_at+INTERVAL '30 minutes' FROM appointments a
 WHERE status='completed' AND client_id IS NOT NULL AND completed_at>=NOW()-INTERVAL '24 hours'
 AND NOT EXISTS(SELECT 1 FROM reviews WHERE appointment_id=a.id)
 ON CONFLICT(appointment_id) DO NOTHING;
