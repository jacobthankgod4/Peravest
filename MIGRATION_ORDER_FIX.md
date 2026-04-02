# MIGRATION ORDER - FIX FOR "ajo_savings does not exist" ERROR

## Problem
The error `relation "ajo_savings" does not exist` occurs because the withdrawal functions reference a table that hasn't been created yet.

## Solution: Run Migrations in This Order

### Step 1: Create ajo_savings Table (REQUIRED FIRST)
```bash
psql -h your-host -U your-user -d your-db -f database/migrations/006b_ajo_savings_table.sql
```

**What it does:**
- Creates `ajo_savings` table for personal Ajo
- Modifies `ajo_transactions` to support both group and personal Ajo
- Adds necessary indexes

**Verify:**
```sql
SELECT table_name FROM information_schema.tables WHERE table_name = 'ajo_savings';
-- Should return: ajo_savings
```

### Step 2: Create Personal Ajo Withdrawal Functions
```bash
psql -h your-host -U your-user -d your-db -f database/migrations/007_personal_ajo_withdrawal.sql
```

**What it does:**
- Creates `process_personal_ajo_withdrawal()` function
- Creates `check_personal_ajo_withdrawal_eligibility()` function

**Verify:**
```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_name LIKE '%personal_ajo%';
-- Should return: 
-- process_personal_ajo_withdrawal
-- check_personal_ajo_withdrawal_eligibility
```

---

## Complete Migration Order (From Scratch)

If starting fresh, run in this order:

1. **004_ajo_minimal_schema.sql** - Group Ajo tables
2. **005_atomic_transaction_functions.sql** - Contribution functions
3. **006_withdrawal_functions.sql** - Group withdrawal functions
4. **006b_ajo_savings_table.sql** - Personal Ajo table ⭐ NEW
5. **007_personal_ajo_withdrawal.sql** - Personal withdrawal functions ⭐ NEW

---

## Quick Fix (If You Already Ran 007 and Got Error)

```sql
-- Drop the failed functions
DROP FUNCTION IF EXISTS process_personal_ajo_withdrawal;
DROP FUNCTION IF EXISTS check_personal_ajo_withdrawal_eligibility;

-- Run 006b first
\i database/migrations/006b_ajo_savings_table.sql

-- Then run 007 again
\i database/migrations/007_personal_ajo_withdrawal.sql
```

---

## Verification Script

Run this to check everything is in place:

```sql
-- Check tables
SELECT 'ajo_groups' as table_name, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ajo_groups') 
       THEN '✅' ELSE '❌' END as status
UNION ALL
SELECT 'ajo_savings', 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ajo_savings') 
       THEN '✅' ELSE '❌' END
UNION ALL
SELECT 'ajo_transactions', 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ajo_transactions') 
       THEN '✅' ELSE '❌' END;

-- Check functions
SELECT routine_name, '✅' as status
FROM information_schema.routines
WHERE routine_name IN (
  'process_ajo_contribution',
  'process_ajo_payout',
  'process_ajo_withdrawal',
  'process_personal_ajo_withdrawal',
  'check_personal_ajo_withdrawal_eligibility'
)
ORDER BY routine_name;
```

Expected output:
```
table_name        | status
------------------|-------
ajo_groups        | ✅
ajo_savings       | ✅
ajo_transactions  | ✅

routine_name                              | status
------------------------------------------|-------
check_personal_ajo_withdrawal_eligibility | ✅
process_ajo_contribution                  | ✅
process_ajo_payout                        | ✅
process_ajo_withdrawal                    | ✅
process_personal_ajo_withdrawal           | ✅
```

---

## Summary

**The Fix:**
1. Run `006b_ajo_savings_table.sql` FIRST
2. Then run `007_personal_ajo_withdrawal.sql`

This ensures the `ajo_savings` table exists before creating functions that reference it.
