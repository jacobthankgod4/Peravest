-- ============================================================================
-- PHASE 1 CONSOLIDATED MIGRATION - Deploy All at Once
-- ============================================================================
-- This file contains all Phase 1 migrations in correct dependency order
-- Run this SINGLE file in Supabase SQL Editor to complete Phase 1
-- ============================================================================

-- ============================================================================
-- STEP 1: Core Tables (from 050_ajo_phase1_fixes.sql)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ajo_groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  max_members INTEGER NOT NULL CHECK (max_members BETWEEN 2 AND 50),
  current_members INTEGER DEFAULT 0 CHECK (current_members <= max_members),
  contribution_amount DECIMAL(15,2) NOT NULL CHECK (contribution_amount > 0),
  frequency VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  cycle_duration INTEGER NOT NULL CHECK (cycle_duration > 0),
  status VARCHAR(20) DEFAULT 'forming' CHECK (status IN ('forming', 'active', 'completed', 'cancelled')),
  created_by INTEGER NOT NULL REFERENCES user_accounts(Id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP,
  next_payout_date TIMESTAMP,
  current_cycle INTEGER DEFAULT 0,
  total_cycles INTEGER,
  reliability_threshold DECIMAL(3,1) DEFAULT 0.7,
  payout_bid_enabled BOOLEAN DEFAULT false,
  CONSTRAINT chk_dates CHECK (started_at IS NULL OR started_at >= created_at)
);

CREATE INDEX IF NOT EXISTS idx_ajo_groups_status ON ajo_groups(status);
CREATE INDEX IF NOT EXISTS idx_ajo_groups_creator ON ajo_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_ajo_groups_frequency ON ajo_groups(frequency);

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
CREATE INDEX IF NOT EXISTS idx_ajo_members_active ON ajo_group_members(group_id, status) WHERE status = 'active';

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
CREATE INDEX IF NOT EXISTS idx_ajo_cycles_collecting ON ajo_cycles(group_id, status) WHERE status = 'collecting';
CREATE INDEX IF NOT EXISTS idx_ajo_cycles_pending ON ajo_cycles(group_id, status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_ajo_cycles_completed ON ajo_cycles(group_id, status) WHERE status = 'completed';

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
CREATE INDEX IF NOT EXISTS idx_ajo_transactions_cycle_type ON ajo_transactions(cycle_id, transaction_type, status);

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
CREATE INDEX IF NOT EXISTS idx_ajo_locks_user_active ON ajo_withdrawal_locks(user_id, released_at) WHERE released_at IS NULL;

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

CREATE INDEX IF NOT EXISTS idx_ajo_member_history_group_cycle ON ajo_member_history(group_id, cycle_id, user_id);

CREATE TABLE IF NOT EXISTS ajo_grace_notices (
  id SERIAL PRIMARY KEY,
  membership_id INTEGER NOT NULL REFERENCES ajo_group_members(id) ON DELETE CASCADE,
  cycle_id INTEGER NOT NULL REFERENCES ajo_cycles(id) ON DELETE CASCADE,
  notice_type VARCHAR(20) NOT NULL DEFAULT 'grace_period' 
    CHECK (notice_type IN ('grace_period', 'final_warning', 'default_notice')),
  notice_sent TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires TIMESTAMP NOT NULL,
  notified BOOLEAN DEFAULT false,
  notification_method VARCHAR(20) DEFAULT 'sms' 
    CHECK (notification_method IN ('sms', 'email', 'in_app', 'whatsapp')),
  notification_sent_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ajo_grace_membership ON ajo_grace_notices(membership_id);
CREATE INDEX IF NOT EXISTS idx_ajo_grace_cycle ON ajo_grace_notices(cycle_id);
CREATE INDEX IF NOT EXISTS idx_ajo_grace_pending ON ajo_grace_notices(notified) WHERE notified = false;

-- ============================================================================
-- STEP 2: RPC Functions
-- ============================================================================

DROP FUNCTION IF EXISTS validate_cycle_readiness(INT) CASCADE;

CREATE OR REPLACE FUNCTION validate_cycle_readiness(group_id INT)
RETURNS JSON AS $$
DECLARE
  v_cycle_id INT;
  v_total_expected DECIMAL(15,2);
  v_total_collected DECIMAL(15,2);
  v_member_count INT;
  v_contributions_count INT;
  v_is_ready BOOLEAN;
  v_missing_count INT;
BEGIN
  SELECT id, total_expected, total_collected 
  INTO v_cycle_id, v_total_expected, v_total_collected
  FROM ajo_cycles
  WHERE group_id = group_id 
    AND status = 'collecting'
  ORDER BY cycle_number DESC
  LIMIT 1;

  IF v_cycle_id IS NULL THEN
    RETURN json_build_object(
      'ready', false,
      'reason', 'No active collecting cycle found',
      'cycle_id', NULL
    );
  END IF;

  SELECT COUNT(*) INTO v_member_count
  FROM ajo_group_members
  WHERE group_id = group_id AND status = 'active';

  SELECT COUNT(*) INTO v_contributions_count
  FROM ajo_transactions
  WHERE cycle_id = v_cycle_id 
    AND transaction_type = 'contribution'
    AND status = 'completed';

  v_missing_count := v_member_count - v_contributions_count;
  v_is_ready := (v_missing_count = 0) OR 
                (NOW() > (SELECT contribution_deadline FROM ajo_cycles WHERE id = v_cycle_id));

  RETURN json_build_object(
    'ready', v_is_ready,
    'cycle_id', v_cycle_id,
    'total_expected', v_total_expected,
    'total_collected', v_total_collected,
    'member_count', v_member_count,
    'contributions_received', v_contributions_count,
    'missing_contributions', v_missing_count,
    'deadline_passed', NOW() > (SELECT contribution_deadline FROM ajo_cycles WHERE id = v_cycle_id),
    'completion_percentage', ROUND((v_contributions_count::DECIMAL / NULLIF(v_member_count::DECIMAL, 0) * 100), 2)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP FUNCTION IF EXISTS process_atomic_ajo_cycle(INT) CASCADE;

CREATE OR REPLACE FUNCTION process_atomic_ajo_cycle(cycle_id INT)
RETURNS JSON AS $$
DECLARE
  v_group_id INT;
  v_cycle_number INT;
  v_total_collected DECIMAL(15,2);
  v_payout_recipient_id INT;
  v_member_count INT;
  v_next_cycle_number INT;
  v_error_msg TEXT;
  v_recipient_user_id INT;
BEGIN
  BEGIN
    SELECT group_id, cycle_number, total_collected, payout_recipient_id
    INTO v_group_id, v_cycle_number, v_total_collected, v_payout_recipient_id
    FROM ajo_cycles
    WHERE id = cycle_id;

    IF v_group_id IS NULL THEN
      RETURN json_build_object('success', false, 'error', 'Cycle not found');
    END IF;

    IF NOT (SELECT (validate_cycle_readiness(v_group_id)->>'ready')::BOOLEAN) THEN
      RETURN json_build_object('success', false, 'error', 'Cycle not ready for processing');
    END IF;

    SELECT user_id INTO v_recipient_user_id
    FROM ajo_group_members
    WHERE id = v_payout_recipient_id;

    INSERT INTO ajo_transactions (
      group_id, cycle_id, user_id, amount, 
      transaction_type, status, created_at
    ) VALUES (
      v_group_id, cycle_id, v_recipient_user_id, v_total_collected,
      'payout', 'completed', NOW()
    );

    UPDATE ajo_cycles
    SET status = 'completed', payout_date = NOW(), payout_amount = v_total_collected
    WHERE id = cycle_id;

    UPDATE ajo_group_members
    SET payout_received = true, last_contribution_date = NOW()
    WHERE id = v_payout_recipient_id;

    SELECT COUNT(*) INTO v_member_count
    FROM ajo_group_members
    WHERE group_id = v_group_id AND status = 'active';

    v_next_cycle_number := v_cycle_number + 1;
    
    INSERT INTO ajo_cycles (
      group_id, cycle_number, start_date, end_date, 
      contribution_deadline, status, total_expected, created_at
    ) VALUES (
      v_group_id, v_next_cycle_number, NOW(), 
      NOW() + INTERVAL '1 month',
      NOW() + INTERVAL '25 days',
      'pending', 
      (SELECT contribution_amount FROM ajo_groups WHERE id = v_group_id) * v_member_count,
      NOW()
    );

    UPDATE ajo_groups
    SET current_cycle = v_next_cycle_number,
        next_payout_date = NOW() + INTERVAL '1 month'
    WHERE id = v_group_id;

    RETURN json_build_object(
      'success', true,
      'cycle_id', cycle_id,
      'cycle_number', v_cycle_number,
      'payout_amount', v_total_collected,
      'payout_recipient_id', v_recipient_user_id,
      'next_cycle_number', v_next_cycle_number,
      'message', 'Cycle processed successfully'
    );

  EXCEPTION WHEN OTHERS THEN
    v_error_msg := SQLERRM;
    RETURN json_build_object(
      'success', false,
      'error', v_error_msg,
      'cycle_id', cycle_id
    );
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 3: Triggers
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

DROP TRIGGER IF EXISTS trg_post_payment_ajo_update_history ON ajo_transactions CASCADE;
DROP FUNCTION IF EXISTS post_payment_ajo_update_history() CASCADE;

CREATE OR REPLACE FUNCTION post_payment_ajo_update_history()
RETURNS TRIGGER AS $$
DECLARE
  v_cycle_id INT;
  v_group_id INT;
  v_contribution_due_date TIMESTAMP;
  v_days_late INT;
  v_status VARCHAR(20);
BEGIN
  IF NEW.transaction_type = 'contribution' AND NEW.status = 'completed' THEN
    
    v_cycle_id := NEW.cycle_id;
    v_group_id := NEW.group_id;

    SELECT contribution_deadline INTO v_contribution_due_date
    FROM ajo_cycles
    WHERE id = v_cycle_id;

    v_days_late := EXTRACT(DAY FROM (NOW() - v_contribution_due_date));
    IF v_days_late < 0 THEN
      v_days_late := 0;
    END IF;

    IF v_days_late = 0 THEN
      v_status := 'paid';
    ELSE
      v_status := 'late';
    END IF;

    INSERT INTO ajo_member_history (
      user_id, group_id, cycle_id, contribution_due_date,
      contribution_date, amount_due, amount_paid, days_late, status
    ) VALUES (
      NEW.user_id, v_group_id, v_cycle_id, v_contribution_due_date,
      NOW(), NEW.amount, NEW.amount, v_days_late, v_status
    )
    ON CONFLICT (user_id, group_id, cycle_id) DO UPDATE SET
      contribution_date = NOW(),
      amount_paid = NEW.amount,
      days_late = v_days_late,
      status = v_status;

    UPDATE ajo_group_members
    SET last_contribution_date = NOW(),
        total_contributed = total_contributed + NEW.amount
    WHERE user_id = NEW.user_id AND group_id = v_group_id;

    UPDATE ajo_cycles
    SET total_collected = total_collected + NEW.amount
    WHERE id = v_cycle_id;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_post_payment_ajo_update_history
AFTER INSERT ON ajo_transactions
FOR EACH ROW
EXECUTE FUNCTION post_payment_ajo_update_history();

DROP TRIGGER IF EXISTS trg_create_grace_notice ON ajo_member_history CASCADE;
DROP FUNCTION IF EXISTS create_grace_notice_on_late() CASCADE;

CREATE OR REPLACE FUNCTION create_grace_notice_on_late()
RETURNS TRIGGER AS $$
DECLARE
  v_membership_id INTEGER;
BEGIN
  IF NEW.status = 'late' AND OLD.status IS DISTINCT FROM 'late' THEN
    
    SELECT id INTO v_membership_id
    FROM ajo_group_members
    WHERE user_id = NEW.user_id AND group_id = NEW.group_id;

    INSERT INTO ajo_grace_notices (
      membership_id, cycle_id, notice_type, 
      notice_sent, expires, notified
    ) VALUES (
      v_membership_id, NEW.cycle_id, 'grace_period',
      NOW(), NOW() + INTERVAL '3 days', false
    );

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_grace_notice
AFTER UPDATE ON ajo_member_history
FOR EACH ROW
EXECUTE FUNCTION create_grace_notice_on_late();

-- ============================================================================
-- STEP 4: Materialized View & Functions
-- ============================================================================

DROP MATERIALIZED VIEW IF EXISTS ajo_member_scores CASCADE;

CREATE MATERIALIZED VIEW ajo_member_scores AS
SELECT 
  amh.user_id,
  COUNT(*) as total_contributions,
  COUNT(*) FILTER (WHERE amh.status = 'paid') as on_time_contributions,
  COUNT(*) FILTER (WHERE amh.status = 'late') as late_contributions,
  COUNT(*) FILTER (WHERE amh.status = 'defaulted') as defaulted_contributions,
  ROUND(
    COUNT(*) FILTER (WHERE amh.status = 'paid')::DECIMAL / 
    NULLIF(COUNT(*), 0)::DECIMAL * 100, 
    2
  ) as on_time_percentage,
  ROUND(
    CASE 
      WHEN COUNT(*) = 0 THEN 1.0
      WHEN COUNT(*) FILTER (WHERE amh.status = 'defaulted') > 0 THEN 0.5
      WHEN COUNT(*) FILTER (WHERE amh.status = 'late') > COUNT(*) / 2 THEN 0.7
      WHEN COUNT(*) FILTER (WHERE amh.status = 'paid') = COUNT(*) THEN 1.0
      ELSE 0.8
    END, 2
  ) as reliability_score,
  MAX(amh.contribution_date) as last_contribution_date
FROM ajo_member_history amh
GROUP BY amh.user_id;

CREATE INDEX idx_ajo_member_scores_user ON ajo_member_scores(user_id);
CREATE INDEX idx_ajo_member_scores_reliability ON ajo_member_scores(reliability_score);

DROP FUNCTION IF EXISTS refresh_ajo_member_scores() CASCADE;

CREATE OR REPLACE FUNCTION refresh_ajo_member_scores()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY ajo_member_scores;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_member_reliability_score(p_user_id INTEGER)
RETURNS DECIMAL(3,2) AS $$
DECLARE
  v_score DECIMAL(3,2);
BEGIN
  SELECT reliability_score INTO v_score
  FROM ajo_member_scores
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(v_score, 1.0);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION can_member_join_group(p_user_id INTEGER, p_group_id INTEGER)
RETURNS JSON AS $$
DECLARE
  v_member_score DECIMAL(3,2);
  v_group_threshold DECIMAL(3,1);
  v_can_join BOOLEAN;
BEGIN
  v_member_score := get_member_reliability_score(p_user_id);
  
  SELECT reliability_threshold INTO v_group_threshold
  FROM ajo_groups
  WHERE id = p_group_id;
  
  v_can_join := v_member_score >= v_group_threshold;
  
  RETURN json_build_object(
    'can_join', v_can_join,
    'member_score', v_member_score,
    'group_threshold', v_group_threshold,
    'reason', CASE 
      WHEN v_can_join THEN 'Member meets reliability threshold'
      ELSE 'Member score (' || v_member_score || ') below group threshold (' || v_group_threshold || ')'
    END
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PHASE 1 COMPLETE
-- ============================================================================
-- All tables, functions, triggers, and views have been created successfully
-- Ready for Phase 2: Core Services Refactor
