-- Migration: Create investment_packages table (PostgreSQL)
CREATE TABLE IF NOT EXISTS investment_packages (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL,
  share_cost DECIMAL(15,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  period_months INTEGER NOT NULL,
  max_investors INTEGER,
  current_investors INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_investment_packages_property FOREIGN KEY (property_id) REFERENCES property("Id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_investment_packages_property_id ON investment_packages(property_id);
CREATE INDEX IF NOT EXISTS idx_investment_packages_active ON investment_packages(is_active);