# Payment System Production Readiness Implementation Guide

## Overview
This guide provides a non-destructive implementation plan to make the Ajo Savings, Target Savings, and SafeLock onboarding pages production-ready with live Paystack keys.

## Critical Issues & Solutions

### 1. Hardcoded Test Keys in Frontend

**Issue:** `src/pages/Checkout.tsx` (Line 32) uses hardcoded test Paystack key
```typescript
publicKey: 'pk_test_a128e776b95286af35323901ac125129d5326736'
```

**Solution:** Use environment variable
- **File:** `src/pages/Checkout.tsx`
- **Change:** Replace hardcoded key with `process.env.REACT_APP_PAYSTACK_PUBLIC_KEY`
- **Line:** 32
- **Action:** Non-destructive - only update the hardcoded string

---

### 2. Missing Backend Payment Verification Endpoint

**Issue:** `src/pages/PaymentVerification.tsx` calls `/api/payments/verify` endpoint that doesn't exist

**Solution:** Create backend payment verification route

**Files to Create:**
1. `backend/src/routes/payments.js` - New payment routes file
2. `backend/src/controllers/paymentController.js` - New payment controller

**Implementation Steps:**

#### Step 1: Create Payment Controller
**File:** `backend/src/controllers/paymentController.js`
```javascript
// Verify payment with Paystack
// POST /api/payments/verify
// Body: { reference: string }
// Returns: { success: boolean, data: transaction }
```

#### Step 2: Create Payment Routes
**File:** `backend/src/routes/payments.js`
```javascript
// POST /api/payments/verify - Verify payment reference
// POST /api/payments/webhook - Paystack webhook handler
```

#### Step 3: Register Routes in Backend
**File:** `backend/src/app.js`
- Add: `app.use('/api/payments', require('./routes/payments'));`

---

### 3. Missing Ajo/TargetSavings Creation Endpoints

**Issue:** Frontend navigates to checkout but no backend endpoint to create records

**Solution:** Create backend endpoints for Ajo and TargetSavings creation

**Files to Update:**
1. `backend/src/routes/investments.js` - Add Ajo endpoints
2. `backend/src/routes/investments.js` - Add TargetSavings endpoints

**Endpoints Needed:**
- `POST /api/investments/ajo` - Create Ajo savings record
- `POST /api/investments/target-savings` - Create TargetSavings record
- `GET /api/investments/ajo/:id` - Get Ajo details
- `GET /api/investments/target-savings/:id` - Get TargetSavings details

---

### 4. Secret Key Exposure in Frontend

**Issue:** `src/services/paystackService.ts` uses secret key in frontend code
```typescript
const PAYSTACK_SECRET = process.env.REACT_APP_PAYSTACK_SECRET_KEY;
```

**Solution:** Move all secret key operations to backend only

**Files to Update:**
1. `src/services/paystackService.ts` - Remove secret key usage
2. Create backend service for Paystack operations

**Backend File to Create:**
- `backend/src/services/paystackService.js` - Backend Paystack service

---

### 5. Missing Transaction Logging

**Issue:** No audit trail for payments

**Solution:** Create transaction logging system

**Database Migration Needed:**
- `database/029_create_payment_transactions_pg.sql` - Transaction log table

**Table Schema:**
```sql
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  "Id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "UserId" INT NOT NULL,
  "Type" VARCHAR(64) NOT NULL, -- 'ajo', 'target-savings', 'safelock'
  "Amount" NUMERIC(20,2) NOT NULL,
  "PaystackReference" VARCHAR(255) UNIQUE,
  "Status" VARCHAR(64) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  "Metadata" JSONB,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("UserId") REFERENCES public.users("Id")
);
```

---

### 6. Missing Paystack Webhook Handler

**Issue:** No webhook endpoint to handle Paystack payment confirmations

**Solution:** Create webhook endpoint

**File:** `backend/src/routes/payments.js`
- Add: `POST /api/payments/webhook` endpoint
- Verify webhook signature
- Update transaction status
- Trigger Ajo/TargetSavings creation on success

**Webhook Verification:**
- Use Paystack secret key to verify signature
- Header: `x-paystack-signature`

---

### 7. Missing Error Handling & Retries

**Issue:** No retry logic or timeout handling

**Solution:** Add error handling to frontend and backend

**Files to Update:**
1. `src/pages/Checkout.tsx` - Add error handling
2. `src/services/paystackService.ts` - Add retry logic
3. Backend payment controller - Add error responses

---

## Implementation Checklist

### Phase 1: Frontend Fixes (Non-Destructive)
- [ ] Update `src/pages/Checkout.tsx` line 32 to use env variable
- [ ] Update `src/services/paystackService.ts` to remove secret key
- [ ] Add error handling to `src/pages/Checkout.tsx`

### Phase 2: Database
- [ ] Create `database/029_create_payment_transactions_pg.sql`
- [ ] Run migration on database

### Phase 3: Backend Implementation
- [ ] Create `backend/src/controllers/paymentController.js`
- [ ] Create `backend/src/routes/payments.js`
- [ ] Create `backend/src/services/paystackService.js`
- [ ] Update `backend/src/routes/investments.js` with Ajo/TargetSavings endpoints
- [ ] Update `backend/src/app.js` to register payment routes
- [ ] Add environment variables to `backend/.env`

### Phase 4: Testing
- [ ] Test payment flow with test keys
- [ ] Test webhook handler
- [ ] Test error scenarios
- [ ] Verify transaction logging

### Phase 5: Production Deployment
- [ ] Update `.env` with live Paystack keys
- [ ] Update `backend/.env` with live Paystack secret
- [ ] Run database migrations
- [ ] Deploy backend changes
- [ ] Deploy frontend changes

---

## Environment Variables

### Frontend (.env)
```
REACT_APP_PAYSTACK_PUBLIC_KEY=pk_live_xxxxx  # Live key for production
REACT_APP_API_URL=https://api.peravest.com   # Production API URL
```

### Backend (.env)
```
PAYSTACK_SECRET_KEY=sk_live_xxxxx            # Live secret for production
PAYSTACK_PUBLIC_KEY=pk_live_xxxxx            # Live public key
WEBHOOK_SECRET=your_webhook_secret           # For webhook verification
```

---

## File References Summary

### Frontend Files to Modify
1. `src/pages/Checkout.tsx` - Fix hardcoded key, add error handling
2. `src/services/paystackService.ts` - Remove secret key usage
3. `src/pages/PaymentVerification.tsx` - Already correct, no changes needed

### Backend Files to Create
1. `backend/src/controllers/paymentController.js` - NEW
2. `backend/src/routes/payments.js` - NEW
3. `backend/src/services/paystackService.js` - NEW

### Backend Files to Update
1. `backend/src/app.js` - Register payment routes
2. `backend/src/routes/investments.js` - Add Ajo/TargetSavings endpoints

### Database Files to Create
1. `database/029_create_payment_transactions_pg.sql` - NEW

### Configuration Files
1. `.env` - Update with live keys
2. `backend/.env` - Update with live keys

---

## Key Implementation Details

### Checkout.tsx Changes
**Location:** `src/pages/Checkout.tsx` line 32
**Current:**
```typescript
publicKey: 'pk_test_a128e776b95286af35323901ac125129d5326736'
```
**New:**
```typescript
publicKey: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY || ''
```

### Payment Verification Flow
1. User completes Paystack payment
2. Paystack redirects to callback with reference
3. Frontend calls `/api/payments/verify` with reference
4. Backend verifies with Paystack API
5. Backend creates Ajo/TargetSavings record
6. Frontend shows success/failure

### Webhook Flow
1. Paystack sends webhook to `/api/payments/webhook`
2. Backend verifies webhook signature
3. Backend updates transaction status
4. Backend triggers any necessary actions
5. Backend returns 200 OK to Paystack

---

## Security Considerations

1. **Secret Key Protection**
   - Never expose `PAYSTACK_SECRET_KEY` in frontend
   - Only use in backend environment variables
   - Rotate keys regularly

2. **Webhook Verification**
   - Always verify webhook signature
   - Use constant-time comparison for signatures
   - Log all webhook attempts

3. **CSRF Protection**
   - Add CSRF tokens to payment forms
   - Validate origin headers
   - Use SameSite cookies

4. **Rate Limiting**
   - Limit payment verification requests
   - Limit webhook endpoints
   - Implement exponential backoff for retries

5. **Data Validation**
   - Validate all payment amounts
   - Validate user permissions
   - Sanitize all inputs

---

## Testing Checklist

### Unit Tests
- [ ] Payment verification logic
- [ ] Webhook signature verification
- [ ] Transaction creation
- [ ] Error handling

### Integration Tests
- [ ] Full payment flow with test keys
- [ ] Webhook delivery and processing
- [ ] Database transaction logging
- [ ] Email notifications

### Manual Tests
- [ ] Test payment with test card
- [ ] Test failed payment scenario
- [ ] Test webhook retry logic
- [ ] Test error messages

---

## Rollback Plan

If issues occur during production deployment:

1. **Revert Frontend:** Restore previous `.env` with test keys
2. **Revert Backend:** Restore previous backend code
3. **Database:** Keep transaction logs (non-destructive)
4. **Communication:** Notify users of temporary payment issues

---

## Monitoring & Alerts

### Metrics to Monitor
- Payment success rate
- Average payment processing time
- Failed payment count
- Webhook delivery success rate
- Transaction logging accuracy

### Alerts to Set Up
- Payment failure rate > 5%
- Webhook delivery failures
- Database transaction errors
- API response time > 5s

---

## Support & Troubleshooting

### Common Issues

**Issue:** "Payment system loading..."
- **Cause:** Paystack script not loaded
- **Solution:** Check CDN availability, verify public key

**Issue:** "Payment verification failed"
- **Cause:** Backend endpoint not responding
- **Solution:** Check backend logs, verify API URL

**Issue:** "Transaction not created"
- **Cause:** Database error or missing endpoint
- **Solution:** Check database logs, verify migrations ran

---

## Next Steps

1. Review this document with team
2. Create feature branch for implementation
3. Follow Phase 1-5 checklist
4. Test thoroughly with test keys
5. Deploy to staging environment
6. Final testing with live keys
7. Deploy to production

---

## References

- Paystack Documentation: https://paystack.com/docs
- Paystack API Reference: https://paystack.com/docs/api/
- Webhook Documentation: https://paystack.com/docs/webhooks/
- Test Cards: https://paystack.com/docs/payments/test-authentication/

---

**Last Updated:** 2024
**Status:** Ready for Implementation
**Estimated Effort:** 4-6 hours
**Risk Level:** Low (non-destructive changes)
