-- ============================================================================
-- PHASE 3 SUBPHASE 3.3: pg_cron Setup for Hourly Processing
-- ============================================================================

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================================================
-- STEP 1: Hourly cycle processing cron job
-- ============================================================================

-- Schedule Edge Function call every hour
SELECT cron.schedule(
  'ajo-hourly-cycle-processing',
  '0 * * * *',  -- Every hour at minute 0
  $$
    SELECT net.http_post(
      url := 'https://' || current_setting('app.supabase_url') || '/functions/v1/cron_process_ajo_cycles',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key'),
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object('action', 'process_cycles')
    );
  $$
);

-- ============================================================================
-- STEP 2: Daily auto-cancel incomplete contributions
-- ============================================================================

-- Create function to auto-cancel incomplete contributions
DROP FUNCTION IF EXISTS auto_cancel_incomplete_contribs() CASCADE;

CREATE OR REPLACE FUNCTION auto_cancel_incomplete_contribs()
RETURNS TABLE(cancelled_count INT, error_message TEXT) AS $$
DECLARE
  v_cancelled_count INT := 0;
  v_error_msg TEXT := NULL;
BEGIN
  BEGIN
    -- Find cycles where deadline has passed and not all contributions received
    UPDATE ajo_cycles
    SET status = 'failed'
    WHERE status = 'collecting'
      AND contribution_deadline < NOW()
      AND total_collected < total_expected;

    GET DIAGNOSTICS v_cancelled_count = ROW_COUNT;

    -- Mark missing contributions as defaulted
    UPDATE ajo_member_history
    SET status = 'defaulted'
    WHERE status = 'pending'
      AND contribution_due_date < NOW()
      AND cycle_id IN (
        SELECT id FROM ajo_cycles WHERE status = 'failed'
      );

    RETURN QUERY SELECT v_cancelled_count, v_error_msg;

  EXCEPTION WHEN OTHERS THEN
    v_error_msg := SQLERRM;
    RETURN QUERY SELECT 0, v_error_msg;
  END;
END;
$$ LANGUAGE plpgsql;

-- Schedule daily auto-cancel at 2 AM
SELECT cron.schedule(
  'ajo-daily-auto-cancel',
  '0 2 * * *',  -- Every day at 2 AM
  'SELECT auto_cancel_incomplete_contribs();'
);

-- ============================================================================
-- STEP 3: Grace period notifications
-- ============================================================================

-- Create function to send grace period notifications
DROP FUNCTION IF EXISTS notify_grace_period_members() CASCADE;

CREATE OR REPLACE FUNCTION notify_grace_period_members()
RETURNS TABLE(notified_count INT, error_message TEXT) AS $$
DECLARE
  v_notified_count INT := 0;
  v_error_msg TEXT := NULL;
  v_grace_record RECORD;
BEGIN
  BEGIN
    -- Find grace notices that need to be sent
    FOR v_grace_record IN
      SELECT agn.id, agn.membership_id, agn.expires,
             EXTRACT(DAY FROM (agn.expires - NOW()))::INT as days_remaining
      FROM ajo_grace_notices agn
      WHERE agn.notified = false
        AND agn.expires > NOW()
        AND EXTRACT(DAY FROM (agn.expires - NOW())) IN (3, 2, 1)
    LOOP
      -- Send notification (integrate with SMS provider)
      UPDATE ajo_grace_notices
      SET notified = true, notification_sent_at = NOW()
      WHERE id = v_grace_record.id;

      v_notified_count := v_notified_count + 1;
    END LOOP;

    RETURN QUERY SELECT v_notified_count, v_error_msg;

  EXCEPTION WHEN OTHERS THEN
    v_error_msg := SQLERRM;
    RETURN QUERY SELECT 0, v_error_msg;
  END;
END;
$$ LANGUAGE plpgsql;

-- Schedule grace period notifications at 9 AM daily
SELECT cron.schedule(
  'ajo-grace-period-notify',
  '0 9 * * *',  -- Every day at 9 AM
  'SELECT notify_grace_period_members();'
);

-- ============================================================================
-- STEP 4: Materialized view refresh
-- ============================================================================

-- Schedule reliability scores refresh every 6 hours
SELECT cron.schedule(
  'ajo-refresh-member-scores',
  '0 */6 * * *',  -- Every 6 hours
  'SELECT refresh_ajo_member_scores();'
);

-- ============================================================================
-- STEP 5: Cleanup old logs
-- ============================================================================

-- Create function to cleanup old execution logs
DROP FUNCTION IF EXISTS cleanup_old_cron_logs() CASCADE;

CREATE OR REPLACE FUNCTION cleanup_old_cron_logs()
RETURNS TABLE(deleted_count INT, error_message TEXT) AS $$
DECLARE
  v_deleted_count INT := 0;
  v_error_msg TEXT := NULL;
BEGIN
  BEGIN
    -- Delete logs older than 30 days
    DELETE FROM cron_execution_logs
    WHERE executed_at < NOW() - INTERVAL '30 days';

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    RETURN QUERY SELECT v_deleted_count, v_error_msg;

  EXCEPTION WHEN OTHERS THEN
    v_error_msg := SQLERRM;
    RETURN QUERY SELECT 0, v_error_msg;
  END;
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup weekly on Sunday at 3 AM
SELECT cron.schedule(
  'ajo-cleanup-logs',
  '0 3 * * 0',  -- Every Sunday at 3 AM
  'SELECT cleanup_old_cron_logs();'
);

-- ============================================================================
-- STEP 6: Verification Queries
-- ============================================================================

-- View all scheduled cron jobs
-- SELECT jobname, schedule, command FROM cron.job;

-- View cron job execution history
-- SELECT jobname, start_time, end_time, status FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- ============================================================================
-- STEP 7: Create cron execution logs table
-- ============================================================================

CREATE TABLE IF NOT EXISTS cron_execution_logs (
  id SERIAL PRIMARY KEY,
  function_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('success', 'partial_failure', 'failure')),
  cycles_processed INTEGER DEFAULT 0,
  errors JSONB,
  executed_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cron_logs_function ON cron_execution_logs(function_name);
CREATE INDEX IF NOT EXISTS idx_cron_logs_executed_at ON cron_execution_logs(executed_at);

-- ============================================================================
-- PHASE 3 SUBPHASE 3.3 COMPLETE
-- ============================================================================
