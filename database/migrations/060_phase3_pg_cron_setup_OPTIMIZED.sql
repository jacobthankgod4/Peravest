-- ============================================================================
-- PHASE 3 SUBPHASE 3.3: pg_cron Setup - OPTIMIZED FOR VERCEL FREE (2 JOBS)
-- ============================================================================
-- Consolidated 5 cron jobs into 2 for Vercel free tier (max 2 cron jobs)

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================================================
-- JOB 1: MASTER HOURLY JOB (0 * * * *)
-- Combines: Cycle processing + Grace notifications + Score refresh
-- ============================================================================

DROP FUNCTION IF EXISTS master_hourly_ajo_job() CASCADE;

CREATE OR REPLACE FUNCTION master_hourly_ajo_job()
RETURNS JSON AS $$
DECLARE
  v_cycles_processed INT := 0;
  v_notifications_sent INT := 0;
  v_scores_refreshed INT := 0;
  v_error_msg TEXT := NULL;
  v_group RECORD;
  v_cycle_id INT;
  v_is_ready BOOLEAN;
  v_success BOOLEAN;
BEGIN
  BEGIN
    -- STEP 1: Process ready cycles (every hour)
    BEGIN
      -- Get all active groups and process their cycles
      FOR v_group IN
        SELECT id FROM ajo_groups WHERE status = 'active'
      LOOP
        -- Call RPC validate_cycle_readiness
        SELECT (validate_cycle_readiness(v_group.id)->>'ready')::BOOLEAN INTO v_is_ready;
        
        IF v_is_ready THEN
          -- Get cycle ID from validation result
          SELECT (validate_cycle_readiness(v_group.id)->>'cycle_id')::INT INTO v_cycle_id;
          
          -- Process cycle
          SELECT (process_atomic_ajo_cycle(v_cycle_id)->>'success')::BOOLEAN INTO v_success;
          IF v_success THEN
            v_cycles_processed := v_cycles_processed + 1;
          END IF;
        END IF;
      END LOOP;
    EXCEPTION WHEN OTHERS THEN
      v_error_msg := 'Cycle processing error: ' || SQLERRM;
    END;

    -- STEP 2: Send grace period notifications (every 3 hours - check if hour divisible by 3)
    IF EXTRACT(HOUR FROM NOW())::INT % 3 = 0 THEN
      BEGIN
        SELECT COUNT(*) INTO v_notifications_sent
        FROM ajo_grace_notices
        WHERE notified = false
          AND expires > NOW()
          AND EXTRACT(DAY FROM (expires - NOW())) IN (3, 2, 1);
        
        UPDATE ajo_grace_notices
        SET notified = true, notification_sent_at = NOW()
        WHERE notified = false
          AND expires > NOW()
          AND EXTRACT(DAY FROM (expires - NOW())) IN (3, 2, 1);
      EXCEPTION WHEN OTHERS THEN
        v_error_msg := COALESCE(v_error_msg || ' | ', '') || 'Notification error: ' || SQLERRM;
      END;
    END IF;

    -- STEP 3: Refresh reliability scores (every 6 hours - check if hour divisible by 6)
    IF EXTRACT(HOUR FROM NOW())::INT % 6 = 0 THEN
      BEGIN
        REFRESH MATERIALIZED VIEW CONCURRENTLY ajo_member_scores;
        v_scores_refreshed := 1;
      EXCEPTION WHEN OTHERS THEN
        v_error_msg := COALESCE(v_error_msg || ' | ', '') || 'Score refresh error: ' || SQLERRM;
      END;
    END IF;

    -- Log execution
    INSERT INTO cron_execution_logs (
      function_name, status, cycles_processed, errors, executed_at
    ) VALUES (
      'master_hourly_ajo_job',
      CASE WHEN v_error_msg IS NULL THEN 'success' ELSE 'partial_failure' END,
      v_cycles_processed,
      CASE WHEN v_error_msg IS NOT NULL THEN jsonb_build_array(v_error_msg) ELSE NULL END,
      NOW()
    );

    RETURN json_build_object(
      'success', v_error_msg IS NULL,
      'cycles_processed', v_cycles_processed,
      'notifications_sent', v_notifications_sent,
      'scores_refreshed', v_scores_refreshed,
      'error', v_error_msg,
      'timestamp', NOW()::TEXT
    );

  EXCEPTION WHEN OTHERS THEN
    v_error_msg := SQLERRM;
    RETURN json_build_object(
      'success', false,
      'error', v_error_msg,
      'timestamp', NOW()::TEXT
    );
  END;
END;
$$ LANGUAGE plpgsql;

-- Schedule master hourly job
SELECT cron.schedule(
  'ajo-master-hourly',
  '0 * * * *',
  'SELECT master_hourly_ajo_job();'
);

-- ============================================================================
-- JOB 2: DAILY MAINTENANCE JOB (0 2 * * *)
-- Combines: Auto-cancel + Log cleanup
-- ============================================================================

DROP FUNCTION IF EXISTS daily_maintenance_ajo_job() CASCADE;

CREATE OR REPLACE FUNCTION daily_maintenance_ajo_job()
RETURNS JSON AS $$
DECLARE
  v_cancelled_count INT := 0;
  v_deleted_logs INT := 0;
  v_error_msg TEXT := NULL;
BEGIN
  BEGIN
    -- STEP 1: Auto-cancel incomplete contributions
    BEGIN
      -- Find cycles where deadline has passed
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

      -- Reduce reliability scores for defaulters
      UPDATE ajo_group_members
      SET reliability_score = GREATEST(0.0, reliability_score - 0.1)
      WHERE id IN (
        SELECT DISTINCT agm.id
        FROM ajo_group_members agm
        JOIN ajo_member_history amh ON agm.user_id = amh.user_id AND agm.group_id = amh.group_id
        WHERE amh.status = 'defaulted'
          AND amh.contribution_due_date < NOW()
      );

    EXCEPTION WHEN OTHERS THEN
      v_error_msg := 'Auto-cancel error: ' || SQLERRM;
    END;

    -- STEP 2: Cleanup old logs (older than 30 days)
    BEGIN
      DELETE FROM cron_execution_logs
      WHERE executed_at < NOW() - INTERVAL '30 days';

      GET DIAGNOSTICS v_deleted_logs = ROW_COUNT;

      DELETE FROM cron_alerts
      WHERE created_at < NOW() - INTERVAL '30 days';

    EXCEPTION WHEN OTHERS THEN
      v_error_msg := COALESCE(v_error_msg || ' | ', '') || 'Cleanup error: ' || SQLERRM;
    END;

    -- Log execution
    INSERT INTO cron_execution_logs (
      function_name, status, cycles_processed, errors, executed_at
    ) VALUES (
      'daily_maintenance_ajo_job',
      CASE WHEN v_error_msg IS NULL THEN 'success' ELSE 'partial_failure' END,
      v_cancelled_count,
      CASE WHEN v_error_msg IS NOT NULL THEN jsonb_build_array(v_error_msg) ELSE NULL END,
      NOW()
    );

    RETURN json_build_object(
      'success', v_error_msg IS NULL,
      'cycles_cancelled', v_cancelled_count,
      'logs_deleted', v_deleted_logs,
      'error', v_error_msg,
      'timestamp', NOW()::TEXT
    );

  EXCEPTION WHEN OTHERS THEN
    v_error_msg := SQLERRM;
    RETURN json_build_object(
      'success', false,
      'error', v_error_msg,
      'timestamp', NOW()::TEXT
    );
  END;
END;
$$ LANGUAGE plpgsql;

-- Schedule daily maintenance job at 2 AM
SELECT cron.schedule(
  'ajo-daily-maintenance',
  '0 2 * * *',
  'SELECT daily_maintenance_ajo_job();'
);

-- ============================================================================
-- STEP 3: Create cron execution logs table
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
-- STEP 4: Verification Queries
-- ============================================================================

-- View all scheduled cron jobs
-- SELECT jobname, schedule, command FROM cron.job;

-- View cron job execution history
-- SELECT jobname, start_time, end_time, status FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- View execution logs
-- SELECT * FROM cron_execution_logs ORDER BY executed_at DESC LIMIT 20;

-- ============================================================================
-- PHASE 3 SUBPHASE 3.3 COMPLETE - OPTIMIZED FOR VERCEL FREE TIER
-- ============================================================================
-- 2 Cron Jobs (Vercel free limit):
-- 1. Master Hourly (0 * * * *) - Cycles + Notifications + Scores
-- 2. Daily Maintenance (0 2 * * *) - Auto-cancel + Cleanup
