-- migrations/003_create_property_packages.sql
CREATE TABLE property_packages (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  share_cost DECIMAL(15,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  period_months INTEGER NOT NULL,
  max_investors INTEGER NOT NULL,
  current_investors INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);