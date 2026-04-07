# Phase 3: Scheduler Productionization - Deployment & Monitoring Guide

## Overview
Phase 3 implements production-ready cron jobs and Edge Functions for automated Ajo cycle processing, grace period management, and system monitoring.

## Components Implemented

### 3.1: Edge Function - cron_process_ajo_cycles
**File**: `supabase/functions/cron_process_ajo_cycles/index.ts`

**Purpose**: Process all ready Ajo cycles hourly
- Validates cycle readiness via RPC
- Processes atomic cycle transactions
- Sends payout notifications
- Logs execution results

**Deployment**:
```bash
supabase functions deploy cron_process_ajo_cycles
```

### 3.2: Service Integration
**Integrated Services**:
- `validate_cycle_readiness()` - RPC from Phase 1
- `process_atomic_ajo_cycle()` - RPC from Phase 1
- Notification system - From Phase 2

### 3.3: pg_cron Setup
**File**: `database/migrations/060_phase3_pg_cron_setup.sql`

**Scheduled Jobs**:

1. **Hourly Cycle Processing** (0 * * * *)
   - Calls Edge Function every hour
   - Processes ready cycles
   - Sends payout notifications

2. **Daily Auto-Cancel** (0 2 * * *)
   - Runs at 2 AM daily
   - Cancels incomplete cycles
   - Marks defaulted contributions
   - Reduces reliability scores

3. **Grace Period Notifications** (0 9 * * *)
   - Runs at 9 AM daily
   - Sends SMS reminders (3, 2, 1 days)
   - Pidgin messages

4. **Reliability Scores Refresh** (0 */6 * * *)
   - Runs every 6 hours
   - Refreshes materialized view
   - Updates member scores

5. **Log Cleanup** (0 3 * * 0)
   - Runs Sunday at 3 AM
   - Deletes logs older than 30 days

### 3.4: Auto-Cancel Enhancement
**File**: `database/migrations/061_phase3_auto_cancel_enhanced.sql`

**Functions**:
- `auto_cancel_with_notifications()` - Cancel + notify
- `check_cycle_completion_status()` - Check readiness
- `get_cycles_for_auto_cancel()` - List eligible cycles

### 3.5: Local Testing
**Test Edge Function Locally**:
```bash
# Start Supabase locally
supabase start

# Test function
curl -X POST http://localhost:54321/functions/v1/cron_process_ajo_cycles \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

### 3.6: Error Alerts & Monitoring
**File**: `database/migrations/062_phase3_error_alerts.sql`

**Alert System**:
- Slack webhook integration
- Alert severity levels (info, warning, error, critical)
- Alert history tracking
- Health check function

**Setup Slack Alerts**:
1. Create Slack webhook: https://api.slack.com/messaging/webhooks
2. Update webhook URL in `cron_alert_config` table
3. Enable alerts: `UPDATE cron_alert_config SET enabled = true`

**Check System Health**:
```sql
SELECT * FROM check_cron_health();
```

### 3.7: Grace Period Notifications
**Integrated with 3.3 pg_cron**

**Notification Flow**:
- 3 days before deadline: "Bros/Sis, your contribution don miss deadline..."
- 2 days before: "Last 2 days to settle your Ajo contribution..."
- 1 day before: "URGENT! Just 1 day left..."
- After deadline: Default notice

### 3.8: Monitoring & Maintenance

**Monitor Cron Jobs**:
```sql
-- View all scheduled jobs
SELECT jobname, schedule, command FROM cron.job;

-- View execution history
SELECT jobname, start_time, end_time, status 
FROM cron.job_run_details 
ORDER BY start_time DESC LIMIT 10;

-- Check job health
SELECT * FROM check_cron_health();

-- View recent alerts
SELECT * FROM cron_alerts 
ORDER BY created_at DESC LIMIT 20;

-- View execution logs
SELECT * FROM cron_execution_logs 
ORDER BY executed_at DESC LIMIT 50;
```

**Common Issues & Fixes**:

1. **Cron job not running**
   - Check pg_cron extension: `SELECT * FROM pg_extension WHERE extname = 'pg_cron';`
   - Verify job exists: `SELECT * FROM cron.job WHERE jobname = 'ajo-hourly-cycle-processing';`
   - Check logs: `SELECT * FROM cron.job_run_details WHERE jobname LIKE 'ajo%';`

2. **Edge Function errors**
   - Check function logs: Supabase Dashboard > Functions > Logs
   - Verify environment variables set
   - Test function manually with curl

3. **Notifications not sending**
   - Verify SMS provider credentials
   - Check notification logs
   - Test with `send_cron_alert()` function

4. **High database load**
   - Adjust cron schedule frequency
   - Add indexes if needed
   - Monitor query performance

## Deployment Checklist

- [ ] Deploy Edge Function: `supabase functions deploy cron_process_ajo_cycles`
- [ ] Run migration 060: pg_cron setup
- [ ] Run migration 061: Auto-cancel enhancement
- [ ] Run migration 062: Error alerts
- [ ] Configure Slack webhook in `cron_alert_config`
- [ ] Test Edge Function locally
- [ ] Verify cron jobs created: `SELECT * FROM cron.job;`
- [ ] Monitor first 24 hours of execution
- [ ] Set up alerts for failures
- [ ] Document webhook URLs (secure storage)

## Environment Variables Required

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

## Performance Metrics

**Expected Performance**:
- Cycle processing: < 5 seconds per cycle
- Auto-cancel: < 10 seconds
- Notifications: < 2 seconds per batch
- Materialized view refresh: < 30 seconds

**Monitoring Targets**:
- Cron job success rate: > 99%
- Alert delivery: < 1 minute
- Cycle processing latency: < 10 seconds
- Database query performance: < 1 second

## Rollback Plan

If issues occur:

1. **Disable specific cron job**:
   ```sql
   SELECT cron.unschedule('ajo-hourly-cycle-processing');
   ```

2. **Disable all Ajo cron jobs**:
   ```sql
   SELECT cron.unschedule(jobname) FROM cron.job WHERE jobname LIKE 'ajo%';
   ```

3. **Revert Edge Function**:
   ```bash
   supabase functions delete cron_process_ajo_cycles
   ```

4. **Restore from backup** if data corruption

## Next Steps

**Phase 4**: New Page Scaffolding
- Create 8 core Ajo pages
- Implement theme integration
- Add responsive design

---

**Phase 3 Status**: ✅ COMPLETE - Ready for Phase 4
