-- ============================================================================
-- SEED: Usuário Administrador com hash de senha real
-- Senha padrão: admin123 (SHA-256)
-- Altere após o primeiro acesso
-- ============================================================================

DO $$
DECLARE
  v_hash TEXT := encode(digest('admin123', 'sha256'), 'hex');
BEGIN
  INSERT INTO users (name, email, password_hash, role, is_active)
  VALUES ('Administrador', 'admin@barbeariaaraujo.com', v_hash, 'admin', true)
  ON CONFLICT (email) DO UPDATE
  SET password_hash = EXCLUDED.password_hash,
      role = 'admin',
      is_active = true;
END $$;

-- Verificar
SELECT id, name, email, role, is_active FROM users WHERE email = 'admin@barbeariaaraujo.com';
