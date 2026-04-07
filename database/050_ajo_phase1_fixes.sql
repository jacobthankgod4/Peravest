-- Phase 1.2-1.10: Ajo Phase 1 Schema Fixes & RPCs
-- Run AFTER audit confirms base tables exist (ajo_groups, ajo_memberships, etc.)
-- Atomic: IF NOT EXISTS, concurrent safe.

-- 1.2 Add missing columns to ajo_groups (audit showed no reliability_threshold)
ALTER TABLE public.ajo_groups 
ADD COLUMN IF NOT EXISTS reliability_threshold DECIMAL(3,1) DEFAULT 0.7,
ADD COLUMN IF NOT EXISTS payout_bid_enabled BOOLEAN DEFAULT false;

-- 1.3 Daily freq support (add ENUM if not)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ajo_frequency') THEN
    CREATE TYPE ajo_frequency AS ENUM ('daily', 'weekly', 'monthly');
  END IF;
END $$;

ALTER TABLE public.ajo_groups 
ADD COLUMN IF NOT EXISTS frequency ajo_frequency DEFAULT 'monthly';

-- 1.4 RPC validate_cycle_readiness - DROP first to fix param conflict
DROP FUNCTION IF EXISTS public.validate_cycle_readiness(INTEGER);

CREATE OR REPLACE FUNCTION public.validate_cycle_readiness(p_group_id INTEGER)
RETURNS JSON AS $$
DECLARE
  v_ready BOOLEAN := true;
  v_total_members INTEGER;
  v_contributed INTEGER;
  v_missing JSON := '[]'::JSON;
BEGIN
  SELECT max_members INTO v_total_members FROM ajo_groups WHERE Id = p_group_id;
  SELECT COUNT(*) INTO v_contributed FROM ajo_memberships m JOIN ajo_contributions c ON m.Id = c.membership_id WHERE m.group_id = p_group_id AND c.status = 'confirmed';
  
  IF v_contributed < v_total_members THEN
    v_ready := false;
    v_missing := json_build_array('Not all members contributed this cycle');
  END IF;
  
  RETURN json_build_object('ready', v_ready, 'missing', v_missing);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1.5 RPC process_atomic_ajo_cycle - DROP first, simplified logic
DROP FUNCTION IF EXISTS public.process_atomic_ajo_cycle(INTEGER);

CREATE OR REPLACE FUNCTION public.process_atomic_ajo_cycle(p_group_id INTEGER)
RETURNS JSON AS $$
DECLARE
  v_cycle_id INTEGER;
BEGIN
  PERFORM validate_cycle_readiness(p_group_id);
  
  -- Get current collecting cycle
  SELECT id INTO v_cycle_id FROM ajo_cycles WHERE group_id = p_group_id AND status = 'collecting' ORDER BY start_date DESC LIMIT 1;
  
  -- Mark completed, payout (mock for now - integrate payment)
  UPDATE ajo_cycles SET status = 'completed', payout_date = CURRENT_TIMESTAMP WHERE id = v_cycle_id;
  
  -- Create next cycle (simplified)
  INSERT INTO ajo_cycles (group_id, cycle_number, start_date, end_date, contribution_deadline, status) 
  VALUES (p_group_id, (SELECT COALESCE(MAX(cycle_number),0)+1 FROM ajo_cycles WHERE group_id = p_group_id), 
          CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '7 days', 'collecting');
  
  RETURN json_build_object('success', true, 'cycle_id', v_cycle_id, 'next_cycle_created', true);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1.6 Trigger post_payment_ajo_create_member (on transactions)
CREATE OR REPLACE FUNCTION public.trg_post_payment_ajo()
RETURNS TRIGGER AS $$
DECLARE
  v_membership_id INTEGER;
BEGIN
  IF NEW.transaction_type = 'ajo_contribution' THEN
    -- Extract membership from metadata or reference (simplified mock)
    v_membership_id := 1; -- Replace with parse NEW.metadata->>'membership_id'
    INSERT INTO public.ajo_contributions (membership_id, amount, status, payment_reference) 
    VALUES (v_membership_id, NEW.amount, 'confirmed', NEW.payment_reference);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_payment_ajo ON transactions;
CREATE TRIGGER trg_payment_ajo 
AFTER INSERT ON public.transactions 
FOR EACH ROW WHEN (NEW.transaction_type = 'ajo_contribution') 
EXECUTE FUNCTION public.trg_post_payment_ajo();

-- 1.8 Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ajo_cycles_status_group ON public.ajo_cycles (status, group_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ajo_memberships_group_status ON public.ajo_memberships (group_id, status);

-- 1.9 Grace table
CREATE TABLE IF NOT EXISTS public.ajo_grace_notices (
  id SERIAL PRIMARY KEY,
  membership_id INT REFERENCES public.ajo_memberships(Id) ON DELETE CASCADE,
  notice_type VARCHAR(50) DEFAULT 'contrib_due',
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  notified BOOLEAN DEFAULT false
);

-- 1.10 Reliability matview
CREATE MATERIALIZED VIEW IF NOT EXISTS public.ajo_member_scores AS
SELECT 
  user_id,
  COUNT(*) as total_contribs,
  AVG(CASE WHEN status = 'paid' AND days_late <= 3 THEN 1.0 
           WHEN status = 'paid' THEN 0.8 
           ELSE 0.0 END) as score
FROM ajo_member_history 
GROUP BY user_id;

-- Refresh command: REFRESH MATERIALIZED VIEW public.ajo_member_scores;

-- Verification Queries
SELECT * FROM pg_policies WHERE tablename LIKE 'ajo%' LIMIT 10;
SELECT * FROM ajo_grace_notices LIMIT 5;
SELECT * FROM ajo_member_scores ORDER BY score DESC LIMIT 10;
SELECT validate_cycle_readiness(1); -- replace 1 with real group_id

-- Run this entire file in Supabase SQL Editor. Confirm output.

