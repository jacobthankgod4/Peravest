-- ============================================================================
-- AJO PHASE 1 FIXES - Corrected Migration
-- ============================================================================
-- This migration ensures all Ajo tables exist with correct column names
-- Uses INTEGER user_id (references user_accounts.Id) not UUID

-- ============================================================================
-- 1. ENSURE AJO_GROUPS TABLE EXISTS (with correct columns)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ajo_groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  max_members INTEGER NOT NULL CHECK (max_members BETWEEN 2 AND 50),
  current_members INTEGER DEFAULT 0 CHECK (current_members <= max_members),
  contribution_amount DECIMAL(15,2) NOT NULL CHECK (contribution_amount > 0),
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('weekly', 'monthly')),
  cycle_duration INTEGER NOT NULL CHECK (cycle_duration > 0),
  status VARCHAR(20) DEFAULT 'forming' CHECK (status IN ('forming', 'active', 'completed', 'cancelled')),
  created_by INTEGER NOT NULL REFERENCES user_accounts(Id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP,
  next_payout_date TIMESTAMP,
  current_cycle INTEGER DEFAULT 0,
  total_cycles INTEGER,
  CONSTRAINT chk_dates CHECK (started_at IS NULL OR started_at >= created_at)
);

CREATE INDEX IF NOT EXISTS idx_ajo_groups_status ON ajo_groups(status);
CREATE INDEX IF NOT EXISTS idx_ajo_groups_creator ON ajo_groups(created_by);

-- ============================================================================
-- 2. ENSURE AJO_GROUP_MEMBERS TABLE EXISTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS ajo_group_members (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES ajo_groups(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES user_accounts(Id),
  position INTEGER NOT NULL,
  join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'defaulted', 'completed')),
  payout_order INTEGER,
  last_contribution_date TIMESTAMP,
  total_contributed DECIMAL(15,2) DEFAULT 0,
  payout_received BOOLEAN DEFAULT FALSE,
  reliability_score DECIMAL(3,2) DEFAULT 1.00 CHECK (reliability_score BETWEEN 0 AND 1),
  CONSTRAINT uk_group_user UNIQUE (group_id, user_id),
  CONSTRAINT uk_group_position UNIQUE (group_id, position),
  CONSTRAINT uk_group_payout_order UNIQUE (group_id, payout_order)
);

CREATE INDEX IF NOT EXISTS idx_ajo_members_user ON ajo_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_ajo_members_group_status ON ajo_group_members(group_id, status);

-- ============================================================================
-- 3. ENSURE AJO_CYCLES TABLE EXISTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS ajo_cycles (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES ajo_groups(id) ON DELETE CASCADE,
  cycle_number INTEGER NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  contribution_deadline TIMESTAMP NOT NULL,
  payout_recipient_id INTEGER REFERENCES ajo_group_members(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'collecting', 'locked', 'completed', 'failed', 'cancelled')),
  total_expected DECIMAL(15,2) NOT NULL,
  total_collected DECIMAL(15,2) DEFAULT 0,
  payout_amount DECIMAL(15,2) DEFAULT 0,
  payout_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_group_cycle UNIQUE (group_id, cycle_number),
  CONSTRAINT chk_cycle_dates CHECK (end_date > start_date AND contribution_deadline <= end_date),
  CONSTRAINT chk_amounts CHECK (total_collected <= total_expected)
);

CREATE INDEX IF NOT EXISTS idx_ajo_cycles_group_status ON ajo_cycles(group_id, status);

-- ============================================================================
-- 4. ENSURE AJO_TRANSACTIONS TABLE EXISTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS ajo_transactions (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES ajo_groups(id),
  cycle_id INTEGER REFERENCES ajo_cycles(id),
  user_id INTEGER NOT NULL REFERENCES user_accounts(Id),
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('contribution', 'payout', 'refund', 'penalty')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  payment_reference VARCHAR(255),
  payment_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  metadata JSONB,
  CONSTRAINT chk_processed_date CHECK (processed_at IS NULL OR processed_at >= created_at)
);

CREATE INDEX IF NOT EXISTS idx_ajo_transactions_user_type ON ajo_transactions(user_id, transaction_type);
CREATE INDEX IF NOT EXISTS idx_ajo_transactions_cycle ON ajo_transactions(cycle_id);

-- ============================================================================
-- 5. ENSURE AJO_WITHDRAWAL_LOCKS TABLE EXISTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS ajo_withdrawal_locks (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES ajo_groups(id) ON DELETE CASCADE,
  cycle_id INTEGER REFERENCES ajo_cycles(id),
  user_id INTEGER REFERENCES user_accounts(Id),
  lock_type VARCHAR(20) NOT NULL CHECK (lock_type IN ('cycle_incomplete', 'contribution_pending', 'payout_processing', 'dispute')),
  locked_until TIMESTAMP NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  released_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ajo_locks_active ON ajo_withdrawal_locks(group_id, user_id) WHERE released_at IS NULL;

-- ============================================================================
-- 6. ENSURE AJO_MEMBER_HISTORY TABLE EXISTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS ajo_member_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES user_accounts(Id),
  group_id INTEGER NOT NULL REFERENCES ajo_groups(id),
  cycle_id INTEGER NOT NULL REFERENCES ajo_cycles(id),
  contribution_due_date TIMESTAMP NOT NULL,
  contribution_date TIMESTAMP,
  amount_due DECIMAL(15,2) NOT NULL,
  amount_paid DECIMAL(15,2) DEFAULT 0,
  days_late INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'late', 'defaulted'))
);

-- ============================================================================
-- 7. CREATE TRIGGER FOR MEMBER COUNT UPDATE
-- ============================================================================
DROP TRIGGER IF EXISTS trg_update_member_count ON ajo_group_members CASCADE;
DROP FUNCTION IF EXISTS update_group_member_count() CASCADE;

CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE ajo_groups 
    SET current_members = current_members + 1 
    WHERE id = NEW.group_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE ajo_groups 
    SET current_members = current_members - 1 
    WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_member_count
  AFTER INSERT OR DELETE ON ajo_group_members
  FOR EACH ROW EXECUTE FUNCTION update_group_member_count();

-- ============================================================================
-- 8. MIGRATION COMPLETE
-- ============================================================================
-- All Ajo tables now exist with correct column names and relationships
