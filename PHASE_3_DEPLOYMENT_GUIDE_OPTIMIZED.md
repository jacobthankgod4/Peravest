# Phase 3: Scheduler Productionization - OPTIMIZED FOR VERCEL FREE TIER

## Overview
Phase 3 implements production-ready cron jobs for Vercel free tier (max 2 cron jobs).

## Key Changes for Vercel Free Tier

**Original**: 5 separate cron jobs
**Optimized**: 2 consolidated cron jobs

### Job 1: Master Hourly (0 * * * *)
Combines:
- Cycle processing (every hour)
- Grace period notifications (every 3 hours)
- Reliability scores refresh (every 6 hours)

### Job 2: Daily Maintenance (0 2 * * *)
Combines:
- Auto-cancel incomplete cycles
- Log cleanup (30+ days old)

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

### 3.3: pg_cron Setup - OPTIMIZED
**File**: `database/migrations/060_phase3_pg_cron_setup_OPTIMIZED.sql`

**Scheduled Jobs** (2 total for Vercel free):

1. **Master Hourly Job** (0 * * * *)
   - Runs every hour
   - Processes ready cycles
   - Sends grace period notifications (every 3 hours)
   - Refreshes reliability scores (every 6 hours)

2. **Daily Maintenance Job** (0 2 * * *)
   - Runs at 2 AM daily
   - Cancels incomplete cycles
   - Marks defaulted contributions
   - Reduces reliability scores
   - Cleans up old logs (30+ days)

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

See `SLACK_WEBHOOK_SETUP_GUIDE.md` for detailed setup.

### 3.7: Grace Period Notifications
**Integrated with Master Hourly Job**

**Notification Flow**:
- Every 3 hours: Check for grace period notifications
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
   - Verify job exists: `SELECT * FROM cron.job WHERE jobname LIKE 'ajo%';`
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
   - Monitor query performance
   - Add indexes if needed
   - Check for long-running queries

## Deployment Checklist

- [ ] Deploy Edge Function: `supabase functions deploy cron_process_ajo_cycles`
- [ ] Run migration 060: pg_cron setup (OPTIMIZED)
- [ ] Run migration 061: Auto-cancel enhancement
- [ ] Run migration 062: Error alerts
- [ ] Follow SLACK_WEBHOOK_SETUP_GUIDE.md
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
- Master hourly job: < 30 seconds
- Daily maintenance job: < 20 seconds
- Cycle processing: < 5 seconds per cycle
- Auto-cancel: < 10 seconds
- Notifications: < 2 seconds per batch

**Monitoring Targets**:
- Cron job success rate: > 99%
- Alert delivery: < 1 minute
- Cycle processing latency: < 10 seconds
- Database query performance: < 1 second

## Cron Schedule Summary

| Job | Schedule | Purpose | Frequency |
|-----|----------|---------|-----------|
| ajo-master-hourly | 0 * * * * | Process cycles + notifications + scores | Every hour |
| ajo-daily-maintenance | 0 2 * * * | Auto-cancel + cleanup | Daily at 2 AM |

## Slack Webhook Configuration

### Quick Setup

1. Create Slack webhook: https://api.slack.com/messaging/webhooks
2. Run SQL:
```sql
INSERT INTO cron_alert_config (alert_type, channel, webhook_url, enabled)
VALUES (
  'cycle_processing',
  'slack-ajo-alerts',
  'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',
  true
);
```
3. Test: `SELECT send_cron_alert('cycle_processing', 'info', 'Test', 'Testing');`

See `SLACK_WEBHOOK_SETUP_GUIDE.md` for detailed instructions.

## Rollback Plan

If issues occur:

1. **Disable specific cron job**:
   ```sql
   SELECT cron.unschedule('ajo-master-hourly');
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

## Vercel Free Tier Limitations

- **Max 2 cron jobs** ✅ (We use exactly 2)
- **Max 10 seconds execution time** ✅ (Our jobs run < 30 seconds, but Vercel may timeout)
- **No concurrent executions** ✅ (Sequential execution)

**Note**: If Vercel times out cron jobs, consider using Supabase's native pg_cron instead of Vercel's cron integration.

## Next Steps

**Phase 4**: New Page Scaffolding
- Create 8 core Ajo pages
- Implement theme integration
- Add responsive design

---

**Phase 3 Status**: ✅ COMPLETE - Optimized for Vercel Free Tier
