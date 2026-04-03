-- migrations/007_create_portfolios.sql
CREATE TABLE portfolios (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_invested DECIMAL(15,2) DEFAULT 0,
  total_returns DECIMAL(15,2) DEFAULT 0,
  active_investments INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
