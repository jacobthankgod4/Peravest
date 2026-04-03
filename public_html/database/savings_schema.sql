-- PeraVest Target Savings Database Schema
-- Phase 1: Core Tables

-- Target Savings System
CREATE TABLE target_savings (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(Id),
  goal_name VARCHAR(255) NOT NULL,
  target_amount DECIMAL(20,2) NOT NULL,
  current_amount DECIMAL(20,2) DEFAULT 0,
  target_date DATE,
  interest_rate DECIMAL(5,2) DEFAULT 12.00,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Savings Transactions
CREATE TABLE savings_transactions (
  id SERIAL PRIMARY KEY,
  savings_id INT REFERENCES target_savings(id),
  amount DECIMAL(20,2) NOT NULL,
  transaction_type VARCHAR(20) NOT NULL, -- 'deposit', 'withdrawal', 'interest'
  reference VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ajo Groups System
CREATE TABLE ajo_groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contribution_amount DECIMAL(20,2) NOT NULL,
  frequency VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly'
  max_members INT NOT NULL,
  current_members INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ajo Memberships
CREATE TABLE ajo_memberships (
  id SERIAL PRIMARY KEY,
  group_id INT REFERENCES ajo_groups(id),
  user_id INT REFERENCES users(Id),
  position INT, -- payout order
  joined_at TIMESTAMP DEFAULT NOW()
);

-- Ajo Contributions
CREATE TABLE ajo_contributions (
  id SERIAL PRIMARY KEY,
  membership_id INT REFERENCES ajo_memberships(id),
  amount DECIMAL(20,2) NOT NULL,
  contribution_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);