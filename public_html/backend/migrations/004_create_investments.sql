-- migrations/004_create_investments.sql
CREATE TABLE investments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  package_id INTEGER REFERENCES property_packages(id) ON DELETE SET NULL,
  amount DECIMAL(15,2) NOT NULL,
  shares INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  payment_reference VARCHAR(100),
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  maturity_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);