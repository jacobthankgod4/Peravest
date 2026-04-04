# Flutterwave Complete Integration Guide

## Overview
This document covers the complete integration of Flutterwave payment processing with database tracking, webhooks, and email notifications.

## Components Integrated

### 1. Database Schema
**File**: `database/migrations/040_flutterwave_transactions.sql`

Tables created:
- `flutterwave_transactions` - Stores all payment transactions
- `payment_status_log` - Tracks status changes
- `email_notifications` - Logs email notifications

### 2. Backend Webhook Handler
**File**: `backend/src/routes/webhooks.js`

Handles:
- Webhook signature verification
- Payment success/failure processing
- Investment creation (property, ajo, target-savings, safelock)
- Email notifications

### 3. Email Service
**File**: `backend/src/utils/emailService.js`

Sends:
- Payment confirmation emails
- Payment failure emails
- Investment confirmation emails

### 4. Payment Tracking Service
**File**: `backend/src/utils/paymentTrackingService.js`

Provides:
- Transaction creation and retrieval
- Status tracking and history
- Payment verification
- Refund processing
- Transaction statistics

### 5. Frontend Services
**Files**: 
- `src/services/flutterwaveService.ts` - Flutterwave API wrapper
- `src/services/paymentService.ts` - Payment abstraction layer
- `src/pages/Checkout.tsx` - Payment UI

## Setup Instructions

### Step 1: Database Migration
Run the migration in Supabase:
```sql
-- Go to Supabase SQL Editor
-- Copy contents of database/migrations/040_flutterwave_transactions.sql
-- Run the migration
```

### Step 2: Environment Variables
Add to `.env`:
```
# Flutterwave
REACT_APP_FLUTTERWAVE_PUBLIC_KEY=pk_live_xxxxx
REACT_APP_FLUTTERWAVE_SECRET_KEY=sk_live_xxxxx

# Email Service
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Supabase
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### Step 3: Backend Setup
1. Install dependencies:
```bash
npm install nodemailer
```

2. Register webhook route in `backend/src/app.js`:
```javascript
const webhookRoutes = require('./routes/webhooks');
app.use('/api/webhooks', webhookRoutes);
```

3. Configure Flutterwave webhook:
- Go to https://dashboard.flutterwave.com/settings/webhooks
- Set webhook URL: `https://your-domain.com/api/webhooks/flutterwave`
- Select events: `charge.completed`, `charge.failed`

### Step 4: Frontend Setup
1. Ensure Flutterwave script is in `public/index.html`:
```html
<script src="https://checkout.flutterwave.com/v3.js"></script>
```

2. Update `.env` with Flutterwave public key

## Payment Flow

### 1. User Initiates Payment
- User fills checkout form
- Frontend creates transaction reference
- Flutterwave modal opens

### 2. Payment Processing
- User completes payment in Flutterwave modal
- Flutterwave processes payment
- Webhook is triggered

### 3. Webhook Handling
- Backend receives webhook
- Signature is verified
- Transaction status is updated
- Investment is created
- Email is sent

### 4. User Confirmation
- User sees success message
- Dashboard is updated
- Email confirmation is received

## API Endpoints

### Create Transaction
```javascript
POST /api/payments/initialize
{
  "amount": 50000,
  "email": "user@example.com",
  "name": "User Name",
  "investmentType": "property",
  "propertyId": 123,
  "packageId": 456
}
```

### Get Transaction Status
```javascript
GET /api/payments/status/:txRef
```

### Verify Payment
```javascript
GET /api/payments/verify/:transactionId
```

### Get User Transactions
```javascript
GET /api/payments/transactions
```

## Payment Tracking Service Usage

### Create Transaction
```javascript
const PaymentTrackingService = require('./utils/paymentTrackingService');

const transaction = await PaymentTrackingService.createTransaction({
  userId: 'user-uuid',
  amount: 50000,
  txRef: 'PROP_1234567890_abc123',
  customerEmail: 'user@example.com',
  customerName: 'User Name',
  investmentType: 'property',
  propertyId: 123,
  packageId: 456
});
```

### Get Transaction Status
```javascript
const transaction = await PaymentTrackingService.getTransactionByRef('PROP_1234567890_abc123');
console.log(transaction.status); // 'pending', 'successful', 'failed'
```

### Get User Transactions
```javascript
const { transactions, total } = await PaymentTrackingService.getUserTransactions(userId);
```

### Update Status
```javascript
await PaymentTrackingService.updateTransactionStatus(
  transactionId,
  'successful',
  'Payment verified'
);
```

### Get Statistics
```javascript
const stats = await PaymentTrackingService.getTransactionStats(userId);
console.log(stats);
// {
//   total_transactions: 5,
//   successful: 4,
//   failed: 1,
//   pending: 0,
//   total_amount: 250000
// }
```

## Email Templates

### Payment Confirmation
- Sent when payment is successful
- Includes: amount, reference, investment type, date
- HTML formatted with PeraVest branding

### Payment Failure
- Sent when payment fails
- Includes: amount, reference, failure reason
- Includes retry link

## Webhook Events

### charge.completed
Triggered when payment is completed (successful or failed)
```json
{
  "event": "charge.completed",
  "data": {
    "id": 123456,
    "tx_ref": "PROP_1234567890_abc123",
    "flw_ref": "FLW123456789",
    "amount": 50000,
    "currency": "NGN",
    "status": "successful",
    "processor_response": "Approved",
    "charged_amount": 50000,
    "app_fee": 500,
    "merchant_fee": 0
  }
}
```

### charge.failed
Triggered when payment fails
```json
{
  "event": "charge.failed",
  "data": {
    "id": 123456,
    "tx_ref": "PROP_1234567890_abc123",
    "status": "failed",
    "processor_response": "Card declined"
  }
}
```

## Error Handling

### Common Errors

**Invalid Signature**
- Webhook signature doesn't match
- Check REACT_APP_FLUTTERWAVE_SECRET_KEY

**Transaction Not Found**
- Transaction wasn't created before webhook
- Check if frontend created transaction in database

**Email Send Failed**
- Email credentials are incorrect
- Check EMAIL_USER and EMAIL_PASSWORD

**Investment Creation Failed**
- Database constraints violated
- Check RLS policies on investment tables

## Testing

### Test Webhook Locally
```bash
# Use ngrok to expose local server
ngrok http 3000

# Set webhook URL in Flutterwave dashboard to ngrok URL
# Make test payment with test card
```

### Test Cards
- Visa: 4242 4242 4242 4242
- Mastercard: 5531 8866 5592 2950
- Verve: 5061 0200 0000 0000 019

### Test OTP
- Any 6-digit number

## Monitoring

### Check Pending Transactions
```javascript
const pending = await PaymentTrackingService.getPendingTransactions(24);
console.log(`${pending.length} transactions pending for 24+ hours`);
```

### Get Transaction History
```javascript
const history = await PaymentTrackingService.getTransactionStatusHistory(transactionId);
history.forEach(log => {
  console.log(`${log.created_at}: ${log.old_status} → ${log.new_status}`);
});
```

## Security Best Practices

1. **Verify Webhook Signatures** - Always verify webhook signatures
2. **Use HTTPS** - All payment endpoints must use HTTPS
3. **Store Secrets Securely** - Never commit secrets to git
4. **Validate Amounts** - Always validate payment amounts on backend
5. **Log Transactions** - Keep detailed logs for audit trail
6. **Rate Limiting** - Implement rate limiting on payment endpoints
7. **PCI Compliance** - Never store card details

## Troubleshooting

### Webhook Not Received
- Check webhook URL is accessible
- Verify webhook is enabled in Flutterwave dashboard
- Check firewall/security settings
- Review Flutterwave webhook logs

### Payment Not Recorded
- Check if transaction was created in database
- Verify webhook signature
- Check email logs for errors
- Review backend logs

### Email Not Sent
- Verify email credentials
- Check email service configuration
- Review email service logs
- Test with test email address

## References
- Flutterwave Docs: https://developer.flutterwave.com/docs/getting-started
- Webhook Docs: https://developer.flutterwave.com/docs/webhooks/
- Dashboard: https://dashboard.flutterwave.com
