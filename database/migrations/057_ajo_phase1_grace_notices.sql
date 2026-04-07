-- ============================================================================
-- PHASE 1 SUBPHASE 1.9: Grace Notices Table
-- ============================================================================

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

-- Indexes for grace notices
CREATE INDEX IF NOT EXISTS idx_ajo_grace_membership ON ajo_grace_notices(membership_id);
CREATE INDEX IF NOT EXISTS idx_ajo_grace_cycle ON ajo_grace_notices(cycle_id);
CREATE INDEX IF NOT EXISTS idx_ajo_grace_pending ON ajo_grace_notices(notified) WHERE notified = false;

-- ============================================================================
-- Function to auto-create grace notices when contribution is late
-- ============================================================================

DROP TRIGGER IF EXISTS trg_create_grace_notice ON ajo_member_history CASCADE;
DROP FUNCTION IF EXISTS create_grace_notice_on_late() CASCADE;

CREATE OR REPLACE FUNCTION create_grace_notice_on_late()
RETURNS TRIGGER AS $$
DECLARE
  v_membership_id INTEGER;
BEGIN
  -- Only trigger on late contributions
  IF NEW.status = 'late' AND OLD.status IS DISTINCT FROM 'late' THEN
    
    -- Get membership ID
    SELECT id INTO v_membership_id
    FROM ajo_group_members
    WHERE user_id = NEW.user_id AND group_id = NEW.group_id;

    -- Create grace notice (3 day grace period)
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
-- Verification Query
-- ============================================================================
-- SELECT * FROM ajo_grace_notices LIMIT 1;
