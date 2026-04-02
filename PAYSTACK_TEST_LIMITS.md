# Paystack Test Mode Limitations

## Issue
When testing payments for amounts over ₦50,000, Paystack returns:
```
Error: Your transaction was declined due to insufficient funds in your bank account.
```

## Root Cause
**This is NOT a bug in the application.** Paystack test mode has a hard limit of ₦50,000 per transaction.

## Verification
The application is sending the correct amount:
- Amount displayed: ₦10,000,000
- Amount sent to Paystack: 1,000,000,000 kobo (₦10,000,000 × 100)
- Conversion is correct: `amount: total * 100`

## Paystack Test Card Limits
- **Maximum transaction**: ₦50,000
- **Test cards**: 
  - Success: 4084084084084081
  - Insufficient funds: 5060666666666666666
  - All test cards are limited to ₦50,000

## Solution Implemented
Added warning banner on checkout page when:
1. Using test mode (pk_test_xxx)
2. Amount exceeds ₦50,000

Warning message:
> "Paystack test cards have a ₦50,000 limit. This ₦10,000,000 transaction will fail in test mode. Use live keys for production."

## Testing Recommendations

### For Development (Test Mode)
Test with amounts ≤ ₦50,000:
- ₦5,000 packages ✅
- ₦10,000 packages ✅
- ₦30,000 packages ✅
- ₦50,000 packages ✅
- ₦100,000+ packages ❌ (will fail in test mode)

### For Production (Live Mode)
Use live Paystack keys:
- `REACT_APP_PAYSTACK_PUBLIC_KEY=pk_live_xxx`
- No transaction limits (subject to Paystack account limits)
- Real card charges apply

## Test Mode vs Live Mode

| Feature | Test Mode | Live Mode |
|---------|-----------|-----------|
| Public Key | pk_test_xxx | pk_live_xxx |
| Max Amount | ₦50,000 | No limit* |
| Real Charges | No | Yes |
| Test Cards | Works | Fails |
| Real Cards | Fails | Works |

*Subject to Paystack account limits and card limits

## Code Changes
File: `src/pages/Checkout.tsx`
- Added `isTestMode` detection
- Added `exceedsTestLimit` check
- Display warning banner when limit exceeded
- Payment still processes (will fail at Paystack level)

## Recommendation
For testing high-value transactions:
1. Use amounts ≤ ₦50,000 in test mode
2. Switch to live keys for production
3. Or mock the payment in development (bypass Paystack)
