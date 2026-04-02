# AJO SYSTEM DEPLOYMENT CHECKLIST

## 🎯 Pre-Deployment Verification

### ✅ Phase 1: Database Schema (CRITICAL)

**Status**: Check if tables exist

```sql
-- Run this query to check existing tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'ajo_%'
ORDER BY table_name;
```

**Expected Tables**:
- [ ] `ajo_groups`
- [ ] `ajo_group_members`
- [ ] `ajo_cycles`
- [ ] `ajo_transactions`
- [ ] `ajo_withdrawal_locks`
- [ ] `ajo_member_history`
- [ ] `ajo_savings`

---

### ✅ Phase 2: Database Functions

**Check existing functions**:

```sql
-- List all Ajo-related functions
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%ajo%'
ORDER BY routine_name;
```

**Expected Functions**:
- [ ] `process_ajo_contribution`
- [ ] `process_ajo_payout`
- [ ] `process_ajo_withdrawal` (Group)
- [ ] `process_personal_ajo_withdrawal` (Personal - NEW)
- [ ] `check_personal_ajo_withdrawal_eligibility` (NEW)
- [ ] `update_group_member_count`
- [ ] `check_group_completion`

---

## 🚀 Deployment Steps

### Step 1: Backup Database (CRITICAL)

```bash
# Create backup before migration
pg_dump -h your-host -U your-user -d your-db > ajo_backup_$(date +%Y%m%d).sql
```

### Step 2: Run Database Migrations (In Order)

#### Migration 1: Core Schema (if not exists)
```bash
# File: database/migrations/004_ajo_minimal_schema.sql
psql -h your-host -U your-user -d your-db -f database/migrations/004_ajo_minimal_schema.sql
```

**Verify**:
```sql
SELECT COUNT(*) FROM ajo_groups; -- Should return 0 (empty table)
```

#### Migration 2: Atomic Transaction Functions (if not exists)
```bash
# File: database/migrations/005_atomic_transaction_functions.sql
psql -h your-host -U your-user -d your-db -f database/migrations/005_atomic_transaction_functions.sql
```

**Verify**:
```sql
SELECT process_ajo_contribution(1, 1, 1, 1000, 'test'); -- Should fail gracefully
```

#### Migration 3: Group Withdrawal Functions (if not exists)
```bash
# File: database/migrations/006_withdrawal_functions.sql
psql -h your-host -U your-user -d your-db -f database/migrations/006_withdrawal_functions.sql
```

**Verify**:
```sql
SELECT process_ajo_withdrawal(1, 1); -- Should fail gracefully
```

#### Migration 4: Personal Ajo Withdrawal Functions (NEW - REQUIRED)
```bash
# File: database/migrations/007_personal_ajo_withdrawal.sql
psql -h your-host -U your-user -d your-db -f database/migrations/007_personal_ajo_withdrawal.sql
```

**Verify**:
```sql
SELECT check_personal_ajo_withdrawal_eligibility(1, 1); 
-- Should return JSON with can_withdraw: false
```

---

### Step 3: Deploy TypeScript Services

#### 3.1 Copy New Service Files

```bash
# Copy new services to your project
cp src/services/personalAjoWithdrawalService.ts your-project/src/services/
cp src/services/unifiedAjoWithdrawalManager.ts your-project/src/services/
```

#### 3.2 Verify Existing Services

Ensure these files exist and are up-to-date:
- [ ] `src/services/ajoGroupService.ts`
- [ ] `src/services/ajoContributionEngine.ts`
- [ ] `src/services/ajoPayoutScheduler.ts`
- [ ] `src/services/ajoWithdrawalController.ts`
- [ ] `src/services/ajoAtomicTransactionManager.ts`
- [ ] `src/services/ajoService.ts`

#### 3.3 Update Imports

Update any existing withdrawal code to use the new unified manager:

**Before**:
```typescript
import { ajoService } from './services/ajoService';
// Manual withdrawal logic
```

**After**:
```typescript
import { UnifiedAjoWithdrawalManager } from './services/unifiedAjoWithdrawalManager';

// Automatic routing based on type
const result = await UnifiedAjoWithdrawalManager.processWithdrawal({
  user_id: userId,
  ajo_id: ajoId,
  group_id: groupId,
  withdrawal_type: type
});
```

---

### Step 4: Update Frontend Components

#### 4.1 Update Withdrawal Components

Files to update:
- [ ] `src/components/Withdrawal.tsx`
- [ ] `src/components/AjoSavings.tsx`
- [ ] `src/components_main/Dashboard.tsx`

**Add eligibility checking**:
```typescript
const [eligibility, setEligibility] = useState(null);

useEffect(() => {
  const checkEligibility = async () => {
    const result = await UnifiedAjoWithdrawalManager.checkEligibility(
      userId, ajoId, groupId
    );
    setEligibility(result);
  };
  checkEligibility();
}, [userId, ajoId, groupId]);
```

#### 4.2 Add Penalty Warning UI

For Personal Ajo withdrawals:
```typescript
{eligibility?.details?.has_penalty && (
  <div className="alert alert-warning">
    ⚠️ Early withdrawal penalty: {eligibility.details.penalty_rate * 100}%
    <br />
    You will receive: ₦{amount * (1 - eligibility.details.penalty_rate)}
  </div>
)}
```

---

### Step 5: Testing (CRITICAL)

#### 5.1 Database Function Tests

```sql
-- Test 1: Personal Ajo Withdrawal Eligibility
INSERT INTO ajo_savings (user_id, ajo_type, contribution_amount, frequency, duration, start_date, end_date, total_commitment, current_balance, status)
VALUES (1, 'personal', 10000, 'monthly', 12, CURRENT_DATE, CURRENT_DATE + INTERVAL '12 months', 120000, 50000, 'active');

SELECT check_personal_ajo_withdrawal_eligibility(1, 1);
-- Expected: can_withdraw: false (if < 30 days)

-- Test 2: Personal Ajo Withdrawal (after 30 days)
UPDATE ajo_savings SET start_date = CURRENT_DATE - INTERVAL '31 days' WHERE id = 1;

SELECT check_personal_ajo_withdrawal_eligibility(1, 1);
-- Expected: can_withdraw: true, has_penalty: true

-- Test 3: Process Withdrawal
SELECT process_personal_ajo_withdrawal(1, 1, 10000);
-- Expected: success: true, penalty_amount: 500 (5%)

-- Cleanup
DELETE FROM ajo_savings WHERE id = 1;
```

#### 5.2 TypeScript Service Tests

Create test file: `src/services/__tests__/unifiedAjoWithdrawal.test.ts`

```typescript
import { UnifiedAjoWithdrawalManager } from '../unifiedAjoWithdrawalManager';

describe('Unified Ajo Withdrawal Manager', () => {
  test('should check personal Ajo eligibility', async () => {
    const result = await UnifiedAjoWithdrawalManager.checkEligibility(
      testUserId,
      testAjoId,
      undefined
    );
    expect(result.type).toBe('personal');
  });

  test('should process personal Ajo withdrawal', async () => {
    const result = await UnifiedAjoWithdrawalManager.processWithdrawal({
      user_id: testUserId,
      ajo_id: testAjoId,
      amount: 10000,
      withdrawal_type: 'personal'
    });
    expect(result.success).toBe(true);
  });
});
```

#### 5.3 Integration Tests

**Test Scenarios**:
- [ ] Create personal Ajo
- [ ] Try to withdraw before 30 days (should fail)
- [ ] Wait 30 days (or update start_date)
- [ ] Withdraw with penalty (before maturity)
- [ ] Withdraw without penalty (after maturity)
- [ ] Partial withdrawal
- [ ] Full withdrawal
- [ ] Create group Ajo
- [ ] Contribute to cycle
- [ ] Try to withdraw before turn (should fail)
- [ ] Withdraw on turn (should succeed)

---

### Step 6: Monitoring & Rollback Plan

#### 6.1 Monitor These Metrics

```sql
-- Active withdrawals
SELECT COUNT(*) FROM ajo_transactions 
WHERE transaction_type IN ('withdrawal', 'payout') 
AND status = 'pending';

-- Failed withdrawals
SELECT COUNT(*) FROM ajo_transactions 
WHERE transaction_type IN ('withdrawal', 'payout') 
AND status = 'failed'
AND created_at > CURRENT_DATE;

-- Active withdrawal locks
SELECT COUNT(*) FROM ajo_withdrawal_locks 
WHERE released_at IS NULL;
```

#### 6.2 Rollback Plan (If Issues Occur)

```sql
-- Rollback Step 1: Drop new functions
DROP FUNCTION IF EXISTS process_personal_ajo_withdrawal;
DROP FUNCTION IF EXISTS check_personal_ajo_withdrawal_eligibility;

-- Rollback Step 2: Restore from backup
psql -h your-host -U your-user -d your-db < ajo_backup_YYYYMMDD.sql

-- Rollback Step 3: Revert code changes
git revert <commit-hash>
```

---

## ✅ Post-Deployment Verification

### Verify All Systems Operational

```sql
-- 1. Check table counts
SELECT 
  'ajo_groups' as table_name, COUNT(*) as count FROM ajo_groups
UNION ALL
SELECT 'ajo_savings', COUNT(*) FROM ajo_savings
UNION ALL
SELECT 'ajo_transactions', COUNT(*) FROM ajo_transactions;

-- 2. Check function availability
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name LIKE '%ajo%';

-- 3. Check for errors in logs
SELECT * FROM ajo_transactions 
WHERE status = 'failed' 
AND created_at > CURRENT_DATE - INTERVAL '1 day';
```

### Frontend Verification

- [ ] Personal Ajo withdrawal button appears
- [ ] Eligibility check works
- [ ] Penalty warning displays correctly
- [ ] Withdrawal processes successfully
- [ ] Balance updates correctly
- [ ] Transaction history shows withdrawal
- [ ] Group Ajo withdrawal still works

---

## 🎉 Deployment Complete!

### Success Criteria

- [x] All database migrations applied
- [x] All functions created successfully
- [x] TypeScript services deployed
- [x] Frontend components updated
- [x] Tests passing
- [x] No errors in logs
- [x] Users can withdraw from both Group and Personal Ajo

### Documentation

- [x] `AJO_BUSINESS_LOGIC_COMPLETE.md` - Complete implementation details
- [x] `AJO_DEVELOPER_GUIDE.md` - Developer quick reference
- [x] `AJO_DEPLOYMENT_CHECKLIST.md` - This file

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue**: Function not found
```sql
-- Solution: Re-run migration
\i database/migrations/007_personal_ajo_withdrawal.sql
```

**Issue**: Permission denied
```sql
-- Solution: Grant execute permissions
GRANT EXECUTE ON FUNCTION process_personal_ajo_withdrawal TO your_user;
```

**Issue**: TypeScript import errors
```bash
# Solution: Rebuild project
npm run build
```

---

**Deployment Date**: _____________  
**Deployed By**: _____________  
**Version**: 1.0.0  
**Status**: ⬜ Pending | ⬜ In Progress | ⬜ Complete
