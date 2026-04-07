-- ============================================================================
-- PHASE 3 SUBPHASE 3.6: Error Alerts & Monitoring Setup
-- ============================================================================

-- ============================================================================
-- Create alerts configuration table
-- ============================================================================

CREATE TABLE IF NOT EXISTS cron_alert_config (
  id SERIAL PRIMARY KEY,
  alert_type VARCHAR(50) NOT NULL,
  channel VARCHAR(255) NOT NULL,
  webhook_url TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Create alert history table
-- ============================================================================

CREATE TABLE IF NOT EXISTS cron_alerts (
  id SERIAL PRIMARY KEY,
  alert_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  details JSONB,
  sent_to JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cron_alerts_type ON cron_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_cron_alerts_severity ON cron_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_cron_alerts_created_at ON cron_alerts(created_at);

-- ============================================================================
-- Function to send alerts
-- ============================================================================

DROP FUNCTION IF EXISTS send_cron_alert(VARCHAR, VARCHAR, VARCHAR, TEXT, JSONB) CASCADE;

CREATE OR REPLACE FUNCTION send_cron_alert(
  p_alert_type VARCHAR,
  p_severity VARCHAR,
  p_title VARCHAR,
  p_message TEXT,
  p_details JSONB DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_config RECORD;
  v_sent_to JSONB := '[]'::JSONB;
  v_error_msg TEXT;
BEGIN
  -- Get alert configurations
  FOR v_config IN
    SELECT * FROM cron_alert_config
    WHERE alert_type = p_alert_type AND enabled = true
  LOOP
    BEGIN
      -- Send to webhook (Slack, etc.)
      PERFORM net.http_post(
        url := v_config.webhook_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json'
        ),
        body := jsonb_build_object(
          'text', p_title,
          'blocks', jsonb_build_array(
            jsonb_build_object(
              'type', 'section',
              'text', jsonb_build_object(
                'type', 'mrkdwn',
                'text', '*' || p_title || '*' || E'\n' || p_message
              )
            ),
            jsonb_build_object(
              'type', 'context',
              'elements', jsonb_build_array(
                jsonb_build_object(
                  'type', 'mrkdwn',
                  'text', 'Severity: ' || p_severity || ' | Time: ' || NOW()::TEXT
                )
              )
            )
          ),
          'severity', p_severity,
          'timestamp', EXTRACT(EPOCH FROM NOW())::INT
        )
      );

      v_sent_to := v_sent_to || jsonb_build_object(
        'channel', v_config.channel,
        'sent_at', NOW()::TEXT
      );

    EXCEPTION WHEN OTHERS THEN
      v_error_msg := SQLERRM;
      RAISE WARNING 'Failed to send alert to %: %', v_config.channel, v_error_msg;
    END;
  END LOOP;

  -- Log alert
  INSERT INTO cron_alerts (alert_type, severity, title, message, details, sent_to)
  VALUES (p_alert_type, p_severity, p_title, p_message, p_details, v_sent_to);

  RETURN json_build_object(
    'success', true,
    'sent_to', v_sent_to,
    'timestamp', NOW()::TEXT
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Enhanced cron execution with error alerts
-- ============================================================================

DROP FUNCTION IF EXISTS process_cycles_with_alerts() CASCADE;

CREATE OR REPLACE FUNCTION process_cycles_with_alerts()
RETURNS JSON AS $$
DECLARE
  v_result JSON;
  v_error_msg TEXT;
  v_cycles_processed INT := 0;
  v_errors_count INT := 0;
BEGIN
  BEGIN
    -- Call the main processing function
    -- This would call the Edge Function via HTTP
    -- For now, we'll log the execution

    INSERT INTO cron_execution_logs (
      function_name, status, cycles_processed, errors, executed_at
    ) VALUES (
      'process_cycles_with_alerts',
      'success',
      v_cycles_processed,
      NULL,
      NOW()
    );

    -- Send success alert if needed
    IF v_cycles_processed > 0 THEN
      PERFORM send_cron_alert(
        'cycle_processing',
        'info',
        'Ajo Cycles Processed Successfully',
        'Processed ' || v_cycles_processed || ' cycles',
        jsonb_build_object('cycles_processed', v_cycles_processed)
      );
    END IF;

    RETURN json_build_object(
      'success', true,
      'cycles_processed', v_cycles_processed,
      'timestamp', NOW()::TEXT
    );

  EXCEPTION WHEN OTHERS THEN
    v_error_msg := SQLERRM;
    v_errors_count := v_errors_count + 1;

    -- Send error alert
    PERFORM send_cron_alert(
      'cycle_processing',
      'error',
      'Ajo Cycle Processing Failed',
      'Error: ' || v_error_msg,
      jsonb_build_object('error', v_error_msg)
    );

    INSERT INTO cron_execution_logs (
      function_name, status, cycles_processed, errors, executed_at
    ) VALUES (
      'process_cycles_with_alerts',
      'failure',
      0,
      jsonb_build_array(v_error_msg),
      NOW()
    );

    RETURN json_build_object(
      'success', false,
      'error', v_error_msg,
      'timestamp', NOW()::TEXT
    );
  END;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Function to check cron job health
-- ============================================================================

DROP FUNCTION IF EXISTS check_cron_health() CASCADE;

CREATE OR REPLACE FUNCTION check_cron_health()
RETURNS TABLE(
  job_name VARCHAR,
  last_run TIMESTAMP,
  last_status VARCHAR,
  hours_since_run DECIMAL,
  health_status VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cel.function_name,
    MAX(cel.executed_at),
    (ARRAY_AGG(cel.status ORDER BY cel.executed_at DESC))[1],
    ROUND(EXTRACT(EPOCH FROM (NOW() - MAX(cel.executed_at))) / 3600, 2),
    CASE
      WHEN MAX(cel.executed_at) < NOW() - INTERVAL '2 hours' THEN 'UNHEALTHY'
      WHEN (ARRAY_AGG(cel.status ORDER BY cel.executed_at DESC))[1] = 'failure' THEN 'FAILED'
      WHEN (ARRAY_AGG(cel.status ORDER BY cel.executed_at DESC))[1] = 'partial_failure' THEN 'WARNING'
      ELSE 'HEALTHY'
    END
  FROM cron_execution_logs cel
  GROUP BY cel.function_name;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Setup default alert configurations
-- ============================================================================

-- Insert Slack webhook configuration (user must update with actual webhook)
INSERT INTO cron_alert_config (alert_type, channel, webhook_url, enabled)
VALUES (
  'cycle_processing',
  'slack-ajo-alerts',
  'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',
  false
);

-- ============================================================================
-- Verification Queries (run these manually in SQL editor)
-- ============================================================================
-- SELECT * FROM check_cron_health();
-- SELECT * FROM cron_alerts ORDER BY created_at DESC LIMIT 10;
-- SELECT * FROM cron_alert_config;
-- SELECT send_cron_alert('cycle_processing', 'info', 'Test Alert', 'This is a test alert');

-- ============================================================================
-- PHASE 3 SUBPHASE 3.6 COMPLETE
-- ============================================================================
