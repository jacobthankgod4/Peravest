# AJO WITHDRAWAL IMPLEMENTATION - DEVELOPER QUICK REFERENCE

## 🚀 Quick Start Guide

### 1. Import the Unified Manager

```typescript
import { UnifiedAjoWithdrawalManager } from '@/services/unifiedAjoWithdrawalManager';
```

---

## 📋 Common Use Cases

### Use Case 1: Check if User Can Withdraw

```typescript
// For Group Ajo
const eligibility = await UnifiedAjoWithdrawalManager.checkEligibility(
  userId,
  undefined, // no ajoId for group
  groupId
);

// For Personal Ajo
const eligibility = await UnifiedAjoWithdrawalManager.checkEligibility(
  userId,
  ajoId,
  undefined // no groupId for personal
);

// Response
if (eligibility.can_withdraw) {
  console.log('User can withdraw!');
  console.log('Details:', eligibility.details);
} else {
  console.log('Cannot withdraw:', eligibility.reason);
}
```

### Use Case 2: Process Group Ajo Withdrawal

```typescript
const result = await UnifiedAjoWithdrawalManager.processWithdrawal({
  user_id: userId,
  group_id: groupId,
  withdrawal_type: 'group'
  // No amount needed - group Ajo pays full cycle amount
});

if (result.success) {
  console.log('Withdrawal successful!');
  console.log('Transaction ID:', result.transaction_id);
  console.log('Amount received:', result.amount);
} else {
  console.error('Withdrawal failed:', result.error);
}
```

### Use Case 3: Process Personal Ajo Withdrawal (Full)

```typescript
const result = await UnifiedAjoWithdrawalManager.processWithdrawal({
  user_id: userId,
  ajo_id: ajoId,
  withdrawal_type: 'personal'
  // No amount = withdraw full balance
});

if (result.success) {
  console.log('Amount withdrawn:', result.amount_withdrawn);
  console.log('Penalty charged:', result.penalty_amount);
  console.log('Remaining balance:', result.remaining_balance);
}
```

### Use Case 4: Process Personal Ajo Withdrawal (Partial)

```typescript
const result = await UnifiedAjoWithdrawalManager.processWithdrawal({
  user_id: userId,
  ajo_id: ajoId,
  amount: 50000, // Withdraw ₦50,000
  withdrawal_type: 'personal'
});

if (result.success) {
  console.log('Withdrew ₦50,000');
  console.log('Remaining:', result.remaining_balance);
}
```

### Use Case 5: Get User's Complete Ajo Summary

```typescript
const summary = await UnifiedAjoWithdrawalManager.getUserAjoSummary(userId);

console.log('Group Ajo:');
console.log('- Active groups:', summary.group_ajo.active_groups);
console.log('- Total contributed:', summary.group_ajo.total_contributed);
console.log('- Total received:', summary.group_ajo.total_received);
console.log('- Pending payout:', summary.group_ajo.pending_payout);

console.log('Personal Ajo:');
console.log('- Active savings:', summary.personal_ajo.active_savings);
console.log('- Total balance:', summary.personal_ajo.total_balance);
console.log('- Total withdrawn:', summary.personal_ajo.total_withdrawn);

console.log('Overall:');
console.log('- Total savings:', summary.overall.total_savings);
console.log('- Total withdrawals:', summary.overall.total_withdrawals);
```

### Use Case 6: Get Withdrawal History

```typescript
const history = await UnifiedAjoWithdrawalManager.getWithdrawalHistory(userId);

console.log('Group withdrawals:', history.group_withdrawals);
console.log('Personal withdrawals:', history.personal_withdrawals);
console.log('Total withdrawn:', history.total_withdrawn);
```

---

## 🎨 Frontend Component Example

### Withdrawal Button Component

```typescript
import React, { useState, useEffect } from 'react';
import { UnifiedAjoWithdrawalManager } from '@/services/unifiedAjoWithdrawalManager';

interface WithdrawalButtonProps {
  userId: number;
  ajoId?: number;
  groupId?: number;
  type: 'group' | 'personal';
}

export const WithdrawalButton: React.FC<WithdrawalButtonProps> = ({
  userId,
  ajoId,
  groupId,
  type
}) => {
  const [eligibility, setEligibility] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkEligibility();
  }, [userId, ajoId, groupId]);

  const checkEligibility = async () => {
    const result = await UnifiedAjoWithdrawalManager.checkEligibility(
      userId,
      ajoId,
      groupId
    );
    setEligibility(result);
  };

  const handleWithdraw = async () => {
    setLoading(true);
    
    const result = await UnifiedAjoWithdrawalManager.processWithdrawal({
      user_id: userId,
      ajo_id: ajoId,
      group_id: groupId,
      withdrawal_type: type
    });

    if (result.success) {
      alert(`Withdrawal successful! Amount: ₦${result.amount}`);
      if (result.penalty_amount) {
        alert(`Penalty charged: ₦${result.penalty_amount}`);
      }
    } else {
      alert(`Withdrawal failed: ${result.error}`);
    }

    setLoading(false);
    checkEligibility(); // Refresh eligibility
  };

  if (!eligibility) return <div>Loading...</div>;

  return (
    <div>
      {eligibility.can_withdraw ? (
        <button 
          onClick={handleWithdraw} 
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Processing...' : 'Withdraw Funds'}
        </button>
      ) : (
        <div className="alert alert-warning">
          <p>Cannot withdraw: {eligibility.reason}</p>
          {eligibility.details?.next_eligible_date && (
            <p>Available from: {new Date(eligibility.details.next_eligible_date).toLocaleDateString()}</p>
          )}
        </div>
      )}

      {eligibility.details?.has_penalty && (
        <div className="alert alert-info">
          <p>⚠️ Early withdrawal penalty: {eligibility.details.penalty_rate * 100}%</p>
        </div>
      )}
    </div>
  );
};
```

---

## 🔍 Error Handling

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Not your turn for payout" | Group Ajo: Not user's cycle | Wait for your payout cycle |
| "Minimum lock-in period not met" | Personal Ajo: < 30 days | Wait until 30 days from start |
| "Insufficient balance" | Personal Ajo: Amount > balance | Reduce withdrawal amount |
| "Cycle not completed" | Group Ajo: Missing contributions | Wait for all members to contribute |
| "Already received payout" | Group Ajo: Already withdrawn | Cannot withdraw twice |

---

## 📊 Withdrawal Rules Reference

### Group Ajo Rules
- ✅ **When**: Only on your scheduled turn (based on `payout_order`)
- ✅ **Amount**: Full cycle payout (all contributions)
- ✅ **Penalty**: None (if on schedule)
- ✅ **Frequency**: Once per cycle
- ✅ **Requirement**: All members must contribute first

### Personal Ajo Rules
- ✅ **When**: Anytime after 30-day lock-in period
- ✅ **Amount**: Partial or full balance
- ✅ **Penalty**: 5% if before maturity date
- ✅ **Frequency**: Unlimited (until balance depleted)
- ✅ **Requirement**: Minimum 30 days from start

---

## 🧪 Testing Checklist

### Group Ajo Withdrawal Tests
- [ ] User can withdraw on their turn
- [ ] User cannot withdraw before their turn
- [ ] User cannot withdraw if cycle incomplete
- [ ] User cannot withdraw twice
- [ ] Withdrawal locks work correctly
- [ ] Payout amount is correct

### Personal Ajo Withdrawal Tests
- [ ] User cannot withdraw before 30 days
- [ ] User can withdraw after 30 days
- [ ] Penalty applied for early withdrawal
- [ ] No penalty after maturity
- [ ] Partial withdrawal works
- [ ] Full withdrawal works
- [ ] Balance updates correctly

---

## 🔧 Database Functions Reference

### Group Ajo
```sql
-- Check eligibility (automatic in TypeScript service)
-- Process withdrawal
SELECT process_ajo_withdrawal(user_id, group_id);
```

### Personal Ajo
```sql
-- Check eligibility
SELECT check_personal_ajo_withdrawal_eligibility(user_id, ajo_id);

-- Process withdrawal
SELECT process_personal_ajo_withdrawal(user_id, ajo_id, amount);
```

---

## 📞 Support

For issues or questions:
1. Check `AJO_BUSINESS_LOGIC_COMPLETE.md` for detailed documentation
2. Review database migration files in `database/migrations/`
3. Examine service files in `src/services/`

---

**Last Updated**: 2025-02-17  
**Version**: 1.0.0
