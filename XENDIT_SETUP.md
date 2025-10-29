# Xendit Payment Integration Guide

## Setup Instructions

### 1. Get Xendit API Keys

1. Go to [Xendit Dashboard](https://dashboard.xendit.co/)
2. Sign up or login
3. Navigate to **Settings** → **Developers** → **API Keys**
4. Copy your **Test/Development Secret Key** (starts with `xnd_development_...`)

### 2. Add to Environment Variables

Add to your `.env.local`:

```env
# Xendit Configuration
XENDIT_SECRET_KEY=xnd_development_your_secret_key_here
XENDIT_WEBHOOK_TOKEN=your_webhook_verification_token_here
NEXT_PUBLIC_XENDIT_PUBLIC_KEY=xnd_public_development_your_public_key_here

# App URL for webhooks
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Xendit Dev Mode Features

**Available Payment Methods in Test Mode:**
- Credit/Debit Cards
- E-Wallets (GoPay, OVO, Dana, LinkAja)
- Virtual Accounts (BCA, BNI, BRI, Mandiri, Permata)
- Retail Outlets (Alfamart, Indomaret)
- QRIS

**Test Card Numbers:**
```
Success: 4000000000000002
Failure: 4000000000000010
3DS Auth: 4000000000001091
```

**Test E-Wallet:**
- Use any phone number in test mode
- Auto-succeeds after redirect

### 4. Webhook Setup (for production)

1. In Xendit Dashboard → **Settings** → **Webhooks**
2. Add webhook URL: `https://yourdomain.com/api/webhooks/xendit`
3. Select events:
   - `invoice.paid`
   - `invoice.expired`
   - `invoice.failed`

### 5. Testing

**Test Invoice Creation:**
```bash
curl -X POST https://api.xendit.co/v2/invoices \
  -u xnd_development_your_secret_key: \
  -d external_id=test-invoice-123 \
  -d amount=100000 \
  -d payer_email=test@example.com \
  -d description="Test Order"
```

**Test Payment:**
- Click the invoice URL
- Select payment method
- Use test credentials above

## Integration Flow

```
Customer              Your App                 Xendit
   |                     |                        |
   |-- Place Order ----->|                        |
   |                     |-- Create Invoice ----->|
   |                     |<-- Invoice URL --------|
   |<-- Redirect --------|                        |
   |                                              |
   |-- Pay on Xendit ---------------------------->|
   |<-- Payment Page -----------------------------|
   |                                              |
   |-- Complete Payment ------------------------->|
   |                     |<-- Webhook (paid) -----|
   |                     |-- Update Order ------->|
   |<-- Order Confirmed -|                        |
```

## Important Notes

- **Test mode** transactions are NOT real
- No actual money is charged
- Test data is cleared periodically
- Webhooks work in test mode too
- Always verify webhook signatures
- Store invoice IDs in your database

## API Limits (Test Mode)

- Invoice creation: Unlimited
- Payment attempts: Unlimited
- Expiry time: Min 1 hour, Max 24 hours

## Go Live Checklist

- [ ] Replace test keys with production keys
- [ ] Update webhook URLs
- [ ] Test with real small amount
- [ ] Enable production payment methods
- [ ] Set up monitoring/alerts
- [ ] Document refund process
