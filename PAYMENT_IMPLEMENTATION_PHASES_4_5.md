# Payment System Implementation - Phases 4 & 5

## Phase 4: Testing

### Unit Tests to Create

**File:** `backend/src/controllers/__tests__/paymentController.test.js`
```javascript
// Test payment verification
// Test webhook signature verification
// Test transaction logging
// Test error handling
```

**File:** `src/__tests__/Checkout.test.tsx`
```javascript
// Test environment variable loading
// Test error handling for missing public key
// Test payment button functionality
```

### Integration Tests

1. **Full Payment Flow**
   - User completes onboarding
   - Navigates to checkout
   - Completes Paystack payment
   - Backend verifies payment
   - Ajo/TargetSavings record created
   - User redirected to dashboard

2. **Webhook Testing**
   - Send test webhook from Paystack
   - Verify signature validation
   - Verify transaction status update
   - Verify Ajo/TargetSavings creation

3. **Error Scenarios**
   - Missing public key
   - Failed payment
   - Invalid webhook signature
   - Database errors
   - Network timeouts

### Manual Testing Checklist

- [ ] Test with Paystack test keys
- [ ] Test with test card: 4084084084084081
- [ ] Test failed payment scenario
- [ ] Test webhook delivery
- [ ] Verify transaction logging in database
- [ ] Check email notifications (if implemented)
- [ ] Test error messages display correctly

---

## Phase 5: Production Deployment

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Code review completed
- [ ] Security audit passed
- [ ] Database migrations tested on staging
- [ ] Environment variables configured
- [ ] Paystack webhook URL configured
- [ ] Error logging configured
- [ ] Monitoring alerts set up

### Environment Variables to Update

**Frontend (.env)**
```
REACT_APP_PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
REACT_APP_API_URL=https://api.peravest.com
```

**Backend (.env)**
```
PAYSTACK_SECRET_KEY=sk_live_xxxxx
PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
WEBHOOK_SECRET=your_webhook_secret
DATABASE_URL=production_database_url
NODE_ENV=production
```

### Deployment Steps

1. **Database Migration**
   ```bash
   # Run migration on production database
   psql -U postgres -d peravest_prod -f database/029_create_payment_transactions_pg.sql
   ```

2. **Backend Deployment**
   ```bash
   # Deploy backend changes
   git pull origin main
   npm install
   npm run build
   pm2 restart peravest-api
   ```

3. **Frontend Deployment**
   ```bash
   # Deploy frontend changes
   git pull origin main
   npm install
   npm run build
   # Deploy build/ folder to CDN or web server
   ```

4. **Paystack Configuration**
   - Update webhook URL in Paystack dashboard
   - Webhook URL: `https://api.peravest.com/api/payments/webhook`
   - Verify webhook secret is configured

5. **Verification**
   - Test payment flow with live keys
   - Verify webhook delivery
   - Check transaction logging
   - Monitor error logs

### Rollback Plan

If issues occur:

1. **Immediate Actions**
   - Revert to previous backend version
   - Revert to previous frontend version
   - Restore previous environment variables

2. **Communication**
   - Notify users of temporary payment issues
   - Provide support contact information
   - Set up status page

3. **Investigation**
   - Check error logs
   - Review webhook delivery logs
   - Check database transaction logs
   - Contact Paystack support if needed

### Post-Deployment Monitoring

**Metrics to Monitor**
- Payment success rate (target: >95%)
- Average payment processing time (target: <5s)
- Failed payment count
- Webhook delivery success rate (target: >99%)
- Transaction logging accuracy
- API response times
- Database query performance

**Alerts to Configure**
- Payment failure rate > 5%
- Webhook delivery failures
- Database errors
- API response time > 5s
- Transaction logging failures

### Support & Troubleshooting

**Common Production Issues**

1. **"Payment verification failed"**
   - Check Paystack API status
   - Verify secret key is correct
   - Check network connectivity
   - Review error logs

2. **"Webhook not received"**
   - Verify webhook URL in Paystack dashboard
   - Check firewall rules
   - Verify webhook secret
   - Check server logs

3. **"Transaction not created"**
   - Check database connectivity
   - Verify migrations ran successfully
   - Check user permissions
   - Review error logs

### Success Criteria

- [ ] All payments processed successfully
- [ ] Webhook delivery 100% successful
- [ ] Transaction logging accurate
- [ ] No security vulnerabilities
- [ ] Performance meets targets
- [ ] User experience smooth
- [ ] Support tickets minimal

---

## Files Modified/Created Summary

### Frontend Files
- ✅ `src/pages/Checkout.tsx` - Updated with env variable and error handling
- ✅ `src/services/paystackService.ts` - Removed secret key, routes to backend

### Backend Files
- ✅ `backend/src/controllers/paymentController.js` - NEW
- ✅ `backend/src/routes/payments.js` - NEW
- ✅ `backend/src/utils/paystackService.js` - NEW
- ✅ `backend/src/controllers/investmentController.js` - Updated with Ajo/TargetSavings functions
- ✅ `backend/src/routes/investments.js` - Updated with new endpoints
- ✅ `backend/src/app.js` - Updated to register payment routes

### Database Files
- ✅ `database/029_create_payment_transactions_pg.sql` - NEW

### Configuration Files
- ⏳ `.env` - Update with live keys (Phase 5)
- ⏳ `backend/.env` - Update with live keys (Phase 5)

---

## Next Steps

1. **Immediate (Today)**
   - Review all changes
   - Run Phase 4 tests
   - Fix any issues found

2. **Short Term (This Week)**
   - Deploy to staging environment
   - Perform integration testing
   - Get security review

3. **Medium Term (Next Week)**
   - Final testing with live keys
   - Deploy to production
   - Monitor closely

4. **Long Term (Ongoing)**
   - Monitor metrics
   - Respond to issues
   - Optimize performance
   - Plan enhancements

---

## Contact & Support

For questions or issues:
- Review PAYMENT_SYSTEM_PRODUCTION_READINESS.md
- Check error logs
- Contact Paystack support: support@paystack.com
- Internal team: [your team contact]

---

**Status:** Ready for Phase 4 Testing
**Last Updated:** 2024
**Estimated Time to Production:** 1-2 weeks
