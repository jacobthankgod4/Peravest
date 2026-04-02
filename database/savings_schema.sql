-- AJO SAVINGS AND TARGET SAVINGS DATABASE SCHEMA
-- Run this in Supabase SQL Editor

-- 1. Create ajo_savings table
CREATE TABLE IF NOT EXISTS ajo_savings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES user_accounts(Id),
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

-- 2. Create target_savings table
CREATE TABLE IF NOT EXISTS target_savings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES user_accounts(Id),
  savings_type VARCHAR(20) NOT NULL CHECK (savings_type IN ('goal', 'emergency')),
  goal_name VARCHAR(255) NOT NULL,
  target_amount DECIMAL(15, 2) NOT NULL,
  current_amount DECIMAL(15, 2) DEFAULT 0,
  contribution_amount DECIMAL(15, 2) NOT NULL,
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('weekly', 'monthly')),
  duration INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  payment_reference VARCHAR(100) UNIQUE,
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create ajo_transactions table
CREATE TABLE IF NOT EXISTS ajo_transactions (
  id SERIAL PRIMARY KEY,
  ajo_id INTEGER NOT NULL REFERENCES ajo_savings(id),
  user_id INTEGER NOT NULL REFERENCES user_accounts(Id),
  amount DECIMAL(15, 2) NOT NULL,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('contribution', 'payout', 'withdrawal')),
  payment_reference VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create target_savings_transactions table
CREATE TABLE IF NOT EXISTS target_savings_transactions (
  id SERIAL PRIMARY KEY,
  target_savings_id INTEGER NOT NULL REFERENCES target_savings(id),
  user_id INTEGER NOT NULL REFERENCES user_accounts(Id),
  amount DECIMAL(15, 2) NOT NULL,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('contribution', 'withdrawal')),
  payment_reference VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ajo_user_id ON ajo_savings(user_id);
CREATE INDEX IF NOT EXISTS idx_ajo_status ON ajo_savings(status);
CREATE INDEX IF NOT EXISTS idx_ajo_payment_ref ON ajo_savings(payment_reference);

CREATE INDEX IF NOT EXISTS idx_target_user_id ON target_savings(user_id);
CREATE INDEX IF NOT EXISTS idx_target_status ON target_savings(status);
CREATE INDEX IF NOT EXISTS idx_target_payment_ref ON target_savings(payment_reference);

CREATE INDEX IF NOT EXISTS idx_ajo_trans_ajo_id ON ajo_transactions(ajo_id);
CREATE INDEX IF NOT EXISTS idx_ajo_trans_user_id ON ajo_transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_target_trans_target_id ON target_savings_transactions(target_savings_id);
CREATE INDEX IF NOT EXISTS idx_target_trans_user_id ON target_savings_transactions(user_id);

-- 6. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Create triggers for updated_at
CREATE TRIGGER update_ajo_savings_updated_at BEFORE UPDATE ON ajo_savings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_target_savings_updated_at BEFORE UPDATE ON target_savings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Enable Row Level Security (RLS)
ALTER TABLE ajo_savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE target_savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ajo_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE target_savings_transactions ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies (users can only see their own data)
CREATE POLICY "Users can view own ajo savings" ON ajo_savings
FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own ajo savings" ON ajo_savings
FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own ajo savings" ON ajo_savings
FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own target savings" ON target_savings
FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own target savings" ON target_savings
FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own target savings" ON target_savings
FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own ajo transactions" ON ajo_transactions
FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own target transactions" ON target_savings_transactions
FOR SELECT USING (auth.uid()::text = user_id::text);
