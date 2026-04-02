-- Migration: Create transactions table (PostgreSQL)
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  investment_id INTEGER,
  withdrawal_id INTEGER,
  type VARCHAR(20) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  reference VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  gateway VARCHAR(20),
  gateway_response JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES users("Id") ON DELETE CASCADE,
  CONSTRAINT fk_transactions_investment FOREIGN KEY (investment_id) REFERENCES investment("Id_in") ON DELETE SET NULL,
  CONSTRAINT fk_transactions_withdrawal FOREIGN KEY (withdrawal_id) REFERENCES withdrawals(id) ON DELETE SET NULL,
  CONSTRAINT chk_transaction_type CHECK (type IN ('investment', 'withdrawal', 'refund', 'fee')),
  CONSTRAINT chk_transaction_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions(reference);