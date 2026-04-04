# Paystack to Flutterwave Migration - Atomic Implementation Plan

## Phase 1: Audit & Preparation
**Goal**: Identify all Paystack integration points

### Step 1.1: Find all Paystack references
```bash
grep -r "paystack" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src/
grep -r "PAYSTACK" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src/
grep -r "pk_test" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src/
```

### Step 1.2: Document all Paystack usage
- Payment initialization points
- Webhook handlers
- Transaction verification
- Error handling
- UI components showing Paystack branding

### Step 1.3: Verify Flutterwave setup
- Confirm REACT_APP_FLUTTERWAVE_PUBLIC_KEY in .env
- Test Flutterwave API connectivity

---

## Phase 2: Core Service Layer Migration
**Goal**: Replace payment service without breaking existing code

### Step 2.1: Update flutterwaveService.ts
- Ensure all payment methods match Paystack equivalents
- Add transaction verification
- Add webhook signature validation
- Add error handling

### Step 2.2: Update paymentService.ts
- Replace Paystack public key with Flutterwave
- Update payment initialization to use Flutterwave API
- Keep same function signatures for backward compatibility

### Step 2.3: Create payment adapter
- Create wrapper functions that map Paystack calls to Flutterwave
- Ensure same return types and error formats

---

## Phase 3: Component Updates
**Goal**: Update UI components to use Flutterwave

### Step 3.1: Update Checkout.tsx
- Replace Paystack payment handler with Flutterwave
- Update payment button text/branding if needed
- Test payment flow end-to-end

### Step 3.2: Update any other payment components
- Search for Paystack references in components
- Replace with Flutterwave equivalents
- Update error messages

### Step 3.3: Update payment status pages
- Ensure transaction status displays work with Flutterwave responses
- Update success/failure messages

---

## Phase 4: Configuration & Environment
**Goal**: Ensure all configs point to Flutterwave

### Step 4.1: Update .env files
- Remove REACT_APP_PAYSTACK_PUBLIC_KEY
- Remove REACT_APP_PAYSTACK_SECRET_KEY
- Verify REACT_APP_FLUTTERWAVE_PUBLIC_KEY exists

### Step 4.2: Update .env.example
- Document Flutterwave configuration
- Remove Paystack references

### Step 4.3: Update vercel.json
- Remove any Paystack-specific headers
- Ensure CSP allows Flutterwave scripts

---

## Phase 5: HTML & Script Tags
**Goal**: Replace Paystack script with Flutterwave

### Step 5.1: Update public/index.html
- Remove Paystack script tag
- Add Flutterwave script tag
- Verify script loads correctly

### Step 5.2: Test script loading
- Check browser console for script errors
- Verify Flutterwave object is available globally

---

## Phase 6: Testing & Validation
**Goal**: Ensure all payment flows work

### Step 6.1: Test payment initialization
- Register new user
- Attempt payment
- Verify Flutterwave modal opens

### Step 6.2: Test payment success flow
- Complete test payment
- Verify transaction recorded
- Verify user sees success message

### Step 6.3: Test payment failure flow
- Cancel payment
- Verify error handling
- Verify user can retry

### Step 6.4: Test webhook handling
- Verify Flutterwave webhooks are received
- Verify transaction status updates
- Verify no duplicate transactions

---

## Phase 7: Cleanup & Documentation
**Goal**: Remove all Paystack remnants

### Step 7.1: Remove Paystack files
- Delete old Paystack service files if separate
- Remove Paystack test files

### Step 7.2: Update documentation
- Update README with Flutterwave setup
- Document webhook configuration
- Document test credentials

### Step 7.3: Update comments
- Replace Paystack references in code comments
- Add Flutterwave documentation links

---

## Phase 8: Deployment & Monitoring
**Goal**: Deploy changes safely

### Step 8.1: Create feature branch
- Branch: `feat/paystack-to-flutterwave-migration`

### Step 8.2: Commit atomically
- Commit 1: Service layer updates
- Commit 2: Component updates
- Commit 3: Configuration updates
- Commit 4: Script tag updates
- Commit 5: Cleanup and documentation

### Step 8.3: Deploy to staging
- Test all payment flows in staging
- Monitor for errors

### Step 8.4: Deploy to production
- Deploy with monitoring
- Watch transaction logs
- Be ready to rollback if needed

---

## Rollback Plan
If issues occur:
1. Revert to previous commit
2. Restore Paystack configuration
3. Restore Paystack script tag
4. Redeploy

---

## Files to Modify
1. `src/services/flutterwaveService.ts` - Ensure complete
2. `src/services/paymentService.ts` - Update to use Flutterwave
3. `src/pages/Checkout.tsx` - Update payment handler
4. `.env` - Update keys
5. `.env.example` - Update documentation
6. `public/index.html` - Update script tag
7. `vercel.json` - Update headers if needed
8. Any other payment-related components

---

## Success Criteria
- ✅ All Paystack references removed from code
- ✅ Flutterwave payment initialization works
- ✅ Payment success flow completes
- ✅ Payment failure flow handles errors
- ✅ Webhooks process correctly
- ✅ No console errors related to payments
- ✅ Transactions recorded in database
- ✅ Users can complete full payment flow
