# Flutterwave Integration - Official Implementation

## Overview
This implementation follows Flutterwave's official API documentation:
https://developer.flutterwave.com/docs/getting-started

## Configuration

### 1. Get Flutterwave Keys
1. Go to https://dashboard.flutterwave.com/settings/apis
2. Copy your **Public Key** and **Secret Key**
3. Add to `.env`:
```
REACT_APP_FLUTTERWAVE_PUBLIC_KEY=pk_live_xxxxx
REACT_APP_FLUTTERWAVE_SECRET_KEY=sk_live_xxxxx
```

### 2. Environment Setup
- **Development**: Use test keys (pk_test_xxx, sk_test_xxx)
- **Production**: Use live keys (pk_live_xxx, sk_live_xxx)

## API Endpoints

### Payment Initialization
**Endpoint**: `POST /v3/payments`
**Method**: `flutterwaveService.initializePayment(config)`

```typescript
const config = {
  tx_ref: 'unique-reference-id',
  amount: 50000,
  currency: 'NGN',
  payment_options: 'card,mobilemoney,ussd',
  customer: {
    email: 'user@example.com',
    name: 'User Name'
  },
  customizations: {
    title: 'Payment Title',
    description: 'Payment Description',
    logo: '/logo.png'
  }
};

const response = await flutterwaveService.initializePayment(config);
```

### Payment Verification
**Endpoint**: `GET /v3/transactions/{id}/verify`
**Method**: `flutterwaveService.verifyPayment(transactionId)`

```typescript
const verification = await flutterwaveService.verifyPayment(transactionId);
// Returns: { status: 'success', data: { ... } }
```

### Get Transaction Details
**Endpoint**: `GET /v3/transactions/{id}`
**Method**: `flutterwaveService.getTransactionDetails(transactionId)`

### Refund Transaction
**Endpoint**: `POST /v3/transactions/{id}/refund`
**Method**: `flutterwaveService.refundTransaction(transactionId, amount?)`

### Verify Account Number
**Endpoint**: `GET /v3/accounts/resolve`
**Method**: `flutterwaveService.verifyAccountNumber(accountNumber, bankCode)`

### Initiate Transfer
**Endpoint**: `POST /v3/transfers`
**Method**: `flutterwaveService.initiateTransfer(transferData)`

### Get Banks
**Endpoint**: `GET /v3/banks/{country}`
**Method**: `flutterwaveService.getBanks(country)`

## Frontend Integration

### Inline Payment (Recommended)
```typescript
// 1. Load Flutterwave script in public/index.html
<script src="https://checkout.flutterwave.com/v3.js"></script>

// 2. Initialize payment in component
window.FlutterwaveCheckout({
  public_key: publicKey,
  tx_ref: reference,
  amount: amount,
  currency: 'NGN',
  payment_options: 'card,mobilemoney,ussd',
  customer: {
    email: email,
    name: name
  },
  customizations: {
    title: 'Payment Title',
    description: 'Payment Description',
    logo: '/logo.png'
  },
  callback: (response) => {
    if (response.status === 'successful') {
      // Verify payment on backend
      verifyPayment(response.transaction_id);
    }
  },
  onclose: () => {
    // Handle payment dialog close
  }
});
```

## Webhook Integration

### Setup Webhook URL
1. Go to https://dashboard.flutterwave.com/settings/webhooks
2. Set webhook URL: `https://your-domain.com/api/webhooks/flutterwave`
3. Select events to listen to

### Verify Webhook Signature
```typescript
const isValid = flutterwaveService.verifyWebhookSignature(payload, signature);
```

### Webhook Events
- `charge.completed` - Payment successful
- `charge.failed` - Payment failed
- `transfer.completed` - Transfer successful
- `transfer.failed` - Transfer failed

## Response Formats

### Successful Payment Response
```json
{
  "status": "success",
  "message": "Charge successful",
  "data": {
    "id": 123456,
    "tx_ref": "unique-ref",
    "flw_ref": "FLW123456",
    "amount": 50000,
    "currency": "NGN",
    "charged_amount": 50000,
    "status": "successful",
    "customer": {
      "email": "user@example.com",
      "name": "User Name"
    }
  }
}
```

### Failed Payment Response
```json
{
  "status": "error",
  "message": "Payment failed",
  "data": null
}
```

## Error Handling

### Common Errors
- **Invalid Public Key**: Check REACT_APP_FLUTTERWAVE_PUBLIC_KEY
- **Network Error**: Check API connectivity
- **Invalid Amount**: Amount must be > 0
- **Invalid Currency**: Use 'NGN' for Nigeria

### Error Codes
- `400` - Bad Request
- `401` - Unauthorized (invalid keys)
- `404` - Not Found
- `500` - Server Error

## Testing

### Test Cards
- **Visa**: 4242 4242 4242 4242
- **Mastercard**: 5531 8866 5592 2950
- **Verve**: 5061 0200 0000 0000 019

### Test OTP
- Any 6-digit number

### Test Amount
- Any amount (test mode has no limits)

## Security Best Practices

1. **Never expose Secret Key** in frontend code
2. **Always verify payments** on backend before processing
3. **Use HTTPS** for all payment endpoints
4. **Validate webhook signatures** before processing
5. **Store transaction references** for reconciliation
6. **Implement rate limiting** on payment endpoints
7. **Log all payment transactions** for audit trail

## Troubleshooting

### Payment Modal Not Opening
- Check if Flutterwave script is loaded
- Verify public key is correct
- Check browser console for errors

### Payment Verification Fails
- Ensure transaction ID is correct
- Check if payment was actually successful
- Verify secret key is correct

### Webhook Not Received
- Check webhook URL is accessible
- Verify webhook is enabled in dashboard
- Check firewall/security settings

## References
- Official Docs: https://developer.flutterwave.com/docs/getting-started
- API Reference: https://developer.flutterwave.com/reference
- Dashboard: https://dashboard.flutterwave.com
- Support: https://support.flutterwave.com
