-- Migration: Create payment_logs table (PostgreSQL)
CREATE TABLE IF NOT EXISTS payment_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  transaction_id INTEGER,
  reference VARCHAR(100) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  gateway VARCHAR(20) NOT NULL,
  gateway_reference VARCHAR(100),
  gateway_response JSON,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payment_logs_user FOREIGN KEY (user_id) REFERENCES users("Id") ON DELETE CASCADE,
  CONSTRAINT chk_payment_status CHECK (status IN ('pending', 'processing', 'success', 'failed', 'abandoned'))
);

CREATE INDEX IF NOT EXISTS idx_payment_logs_user_id ON payment_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_reference ON payment_logs(reference);
CREATE INDEX IF NOT EXISTS idx_payment_logs_gateway_reference ON payment_logs(gateway_reference);
CREATE INDEX IF NOT EXISTS idx_payment_logs_status ON payment_logs(status);