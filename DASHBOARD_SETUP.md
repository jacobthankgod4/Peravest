# 🚀 DASHBOARD SETUP INSTRUCTIONS

## Why Dashboard is Empty

The dashboard is blank because the Supabase tables haven't been created yet.

## STEP-BY-STEP FIX:

### 1. Create Supabase Tables

1. Go to: https://supabase.com/dashboard/project/vqlybihufqliujmgwcgz/editor
2. Click "New Query" or open SQL Editor
3. Copy ALL contents from `supabase_migration.sql` file
4. Paste into SQL Editor
5. Click "Run" or press Ctrl+Enter
6. Wait for "Success" message

### 2. Verify Tables Were Created

1. Go to: https://supabase.com/dashboard/project/vqlybihufqliujmgwcgz/editor
2. Click "Table Editor" in left sidebar
3. You should see these new tables:
   - `investments`
   - `withdrawals`
   - `savings_programs`

### 3. Check Browser Console

1. Open browser console (F12)
2. Go to Dashboard page
3. Look for these logs:
   - 🔵 Loading dashboard data...
   - ✅ Balance: 0
   - ✅ Investments: []

If you see ❌ errors, share them with me.

### 4. Test With Sample Data (Optional)

Run this in Supabase SQL Editor to add test investment:

```sql
-- Get your user ID first
SELECT id, email FROM auth.users;

-- Replace YOUR_USER_ID with actual ID from above
INSERT INTO public.investments (user_id, property_id, amount, interest_rate, duration_months, maturity_date)
VALUES (
  'YOUR_USER_ID',
  1,
  50000,
  15,
  12,
  NOW() + INTERVAL '12 months'
);
```

### 5. Refresh Dashboard

After running SQL, refresh the dashboard page. You should see:
- Balance: ₦57,500 (50,000 + 15% interest)
- 1 investment card showing

---

## Troubleshooting

**If you see "relation does not exist" error:**
- Tables weren't created. Re-run migration SQL.

**If you see "permission denied" error:**
- RLS policies not created. Re-run migration SQL.

**If dashboard still blank:**
- Open browser console (F12)
- Share the error messages with me
