-- migrations/006_create_transactions.sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  investment_id INTEGER REFERENCES investments(id) ON DELETE SET NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('investment', 'withdrawal', 'refund', 'fee')),
  amount DECIMAL(15,2) NOT NULL,
  reference VARCHAR(100) NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  gateway VARCHAR(20),
  gateway_response JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
