-- PREREQUISITE: Create ajo_savings table for Personal Ajo
-- Run this BEFORE 007_personal_ajo_withdrawal.sql

-- Create ajo_savings table
CREATE TABLE IF NOT EXISTS ajo_savings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  ajo_type VARCHAR(20) NOT NULL CHECK (ajo_type IN ('group', 'personal')),
  contribution_amount DECIMAL(15, 2) NOT NULL,
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('weekly', 'monthly')),
  duration INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_commitment DECIMAL(15, 2) NOT NULL,
  current_balance DECIMAL(15, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  payment_reference VARCHAR(100) UNIQUE,
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Modify ajo_transactions to support both group and personal Ajo
DO $$ 
BEGIN
  -- Add ajo_id column if it doesn't exist (for personal Ajo)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='ajo_transactions' AND column_name='ajo_id') THEN
    ALTER TABLE ajo_transactions ADD COLUMN ajo_id INTEGER;
  END IF;
  
  -- Add transaction_date column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='ajo_transactions' AND column_name='transaction_date') THEN
    ALTER TABLE ajo_transactions ADD COLUMN transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
  END IF;
  
  -- Make group_id nullable (for personal Ajo transactions)
  ALTER TABLE ajo_transactions ALTER COLUMN group_id DROP NOT NULL;
  
  -- Make cycle_id nullable (for personal Ajo transactions)
  ALTER TABLE ajo_transactions ALTER COLUMN cycle_id DROP NOT NULL;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ajo_savings_user_id ON ajo_savings(user_id);
CREATE INDEX IF NOT EXISTS idx_ajo_savings_status ON ajo_savings(status);
CREATE INDEX IF NOT EXISTS idx_ajo_savings_type_user ON ajo_savings(ajo_type, user_id, status);
CREATE INDEX IF NOT EXISTS idx_ajo_transactions_ajo_id ON ajo_transactions(ajo_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_ajo_savings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ajo_savings_updated_at 
BEFORE UPDATE ON ajo_savings
FOR EACH ROW EXECUTE FUNCTION update_ajo_savings_updated_at();

-- Verify table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ajo_savings') THEN
    RAISE NOTICE 'SUCCESS: ajo_savings table created';
  ELSE
    RAISE EXCEPTION 'FAILED: ajo_savings table not created';
  END IF;
END $$;
