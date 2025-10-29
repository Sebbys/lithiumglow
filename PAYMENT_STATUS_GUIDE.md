# Xendit Payment Status - Development Guide

## Problem: Payment Status Always "Pending"

### Root Cause
In **development** (localhost), Xendit webhooks **cannot reach your server** because:
- Webhooks require a **publicly accessible URL**
- `localhost` is not accessible from the internet
- Xendit sends payment notifications via webhooks to update order status

### How Payment Status Works

#### Production Flow (Webhooks Work)
```
Customer pays → Xendit processes → Webhook sent to your server → Status updated automatically
```

#### Development Flow (Webhooks DON'T Work)
```
Customer pays → Xendit processes → ❌ Can't reach localhost → Status stays "pending"
```

---

## Solution: Manual Payment Status Checker

### For Development/Testing

We created a **manual payment checker API** that you can use to update payment status:

**API Endpoint:**
```
GET /api/orders/[orderId]/check-payment
```

**How it works:**
1. Fetches the invoice status from Xendit directly
2. Compares it with your database
3. Updates the order if payment status changed
4. Returns the current status

---

## Usage

### Option 1: Use the "Check Payment Status" Button

When viewing an order with pending payment:
1. Go to `/orders/[orderId]`
2. Click **"Check Payment Status"** button
3. The system will:
   - Query Xendit API for invoice status
   - Update the order in your database if paid
   - Show a toast notification with the result

### Option 2: Use the API Directly

**cURL:**
```bash
curl http://localhost:3000/api/orders/YOUR_ORDER_ID/check-payment
```

**Browser:**
```
http://localhost:3000/api/orders/YOUR_ORDER_ID/check-payment
```

**Response:**
```json
{
  "success": true,
  "orderId": "abc-123",
  "invoiceId": "xendit-invoice-id",
  "invoiceStatus": "PAID",
  "paymentStatus": "paid",
  "updated": true
}
```

---

## Xendit Invoice Status Values

According to Xendit Node SDK documentation:

| Status | Description |
|--------|-------------|
| `PENDING` | Invoice created, awaiting payment |
| `PAID` | Payment received |
| `SETTLED` | Payment settled (same as PAID) |
| `EXPIRED` | Invoice expired (usually after 24 hours) |

---

## Testing Payment Flow in Development

### Step-by-Step:

1. **Create an Order**
   - Checkout with Xendit payment
   - Order created with status: `pending`
   - Payment status: `pending`

2. **Complete Payment**
   - Click "Proceed to Payment"
   - You're redirected to Xendit invoice page
   - Complete payment (use test cards)
   - Xendit redirects to success page

3. **Update Payment Status**
   - Go to order details: `/orders/[orderId]`
   - Click **"Check Payment Status"** button
   - Status should update to `paid` if payment was successful

---

## Production Setup

### Required: Setup Webhook URL

In production, you MUST configure webhooks:

1. **Go to Xendit Dashboard**
   - https://dashboard.xendit.co/settings/developers#webhooks

2. **Add Webhook URL**
   ```
   https://yourdomain.com/api/webhooks/xendit
   ```

3. **Set Webhook Token** (Optional but recommended)
   - Generate a secure random token
   - Add to your `.env`:
     ```
     XENDIT_WEBHOOK_TOKEN=your-secret-token
     ```
   - Xendit will send this in the `x-callback-token` header

4. **Test Webhook**
   - Xendit dashboard has a "Test Webhook" button
   - Check your server logs to verify it's working

### Webhook Events

Your webhook handler listens for these events:

```typescript
{
  "external_id": "your-order-id",  // This is your order ID
  "status": "PAID",                // PENDING, PAID, SETTLED, EXPIRED
  "id": "xendit-invoice-id",
  "paid_amount": 100000,
  "paid_at": "2025-10-29T10:00:00Z"
  // ... other fields
}
```

---

## Development Tools

### ngrok (Recommended for Testing Webhooks Locally)

If you want to test webhooks in development:

1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   ```

2. **Start your dev server:**
   ```bash
   npm run dev
   ```

3. **Create tunnel:**
   ```bash
   ngrok http 3000
   ```

4. **Use ngrok URL as webhook:**
   ```
   https://abc123.ngrok.io/api/webhooks/xendit
   ```

5. **Update Xendit Dashboard:**
   - Add the ngrok URL as your webhook endpoint
   - Now webhooks will work in development!

---

## Files Modified

### 1. Webhook Handler
**File:** `app/api/webhooks/xendit/route.ts`
- Handles incoming webhooks from Xendit
- Updates order payment status automatically
- Logs all status changes

### 2. Payment Status Checker API
**File:** `app/api/orders/[id]/check-payment/route.ts`
- Manual payment status checker for development
- Queries Xendit API directly
- Updates order if status changed

### 3. Order Details Component
**File:** `components/order-details-content.tsx`
- Added "Check Payment Status" button
- Shows button only for pending payments
- Reloads order after status update

---

## Troubleshooting

### Payment status still pending after clicking button

**Check:**
1. Did you actually complete payment on Xendit page?
2. Is your Xendit API key correct?
3. Check browser console for errors
4. Check terminal logs for API response

### "No Xendit invoice for this order" error

**Reason:** Order was created without Xendit invoice (shouldn't happen with new code)

**Fix:** Create a new test order

### Invoice status is EXPIRED

**Reason:** Xendit invoices expire after 24 hours by default

**Fix:** 
- Create a new order
- Pay within 24 hours

---

## Next Steps for Production

- [ ] Configure webhook URL in Xendit Dashboard
- [ ] Add `XENDIT_WEBHOOK_TOKEN` to production .env
- [ ] Test webhook with real payment
- [ ] Remove/hide "Check Payment Status" button in production (optional)
- [ ] Set up monitoring for webhook failures
- [ ] Consider adding retry logic for failed webhooks

---

## Reference Links

- [Xendit Node SDK](https://github.com/xendit/xendit-node)
- [Xendit Dashboard](https://dashboard.xendit.co/)
- [Xendit API Docs](https://developers.xendit.co/api-reference/)
- [Invoice Documentation](https://github.com/xendit/xendit-node/blob/master/docs/Invoice.md)
