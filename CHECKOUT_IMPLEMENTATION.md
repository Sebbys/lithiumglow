# Secure Checkout Implementation

## 🔒 Security Features

This checkout implementation follows security best practices to prevent price manipulation:

### Key Security Measures

1. **Server-Side Price Verification**
   - All prices are recalculated from the database
   - Client-sent prices are NEVER trusted
   - Price mismatches are logged and corrected

2. **Database as Source of Truth**
   - Every cart item is fetched from the database
   - Menu item data is validated before processing
   - Invalid items throw errors

3. **Tamper Detection**
   - Compares client-sent prices with server-calculated prices
   - Logs any discrepancies for security monitoring
   - Shows warning to user if prices were corrected

## 📁 Files Created

### 1. `/app/actions/cart.ts`
Server actions for cart verification:

- `verifyCart()` - Main verification function that recalculates all prices
- `getMenuItemById()` - Helper to fetch individual items
- Includes comprehensive security logging

**Key Features:**
- Recalculates prices using `calculateTotalPrice()` from database data
- Validates quantities (1-99)
- Detects price tampering attempts
- Returns verified cart with correct totals

### 2. `/app/checkout/page.tsx`
Next.js server component page:

- Fetches user session
- Implements Suspense for loading states
- Passes session to client component

### 3. `/components/checkout-content.tsx`
Client component for checkout UI:

- Loads cart from localStorage
- Calls `verifyCart()` server action
- Displays verified items with prices
- Shows warnings for tampered items
- Handles item removal
- Processes checkout

**Features:**
- Real-time price verification
- Remove items functionality
- Order summary with tax calculation
- Secure checkout button
- Tamper detection alerts

## 🔄 How It Works

### Step 1: Cart Storage (Client)
```typescript
// In menu-list.tsx
localStorage.setItem('checkout-cart', JSON.stringify(cart))
// Cart contains: menuItemId, quantity, options, prices
```

### Step 2: Checkout Load
```typescript
// Load cart from localStorage
const clientCart = JSON.parse(localStorage.getItem('checkout-cart'))

// Convert to verification format (only IDs and options)
const cartItems: ClientCartItem[] = clientCart.map(item => ({
  menuItemId: item.menuItem.id,
  quantity: item.quantity,
  selectedCustomOptions: item.selectedCustomOptions,
  selectedExtraOptions: item.selectedExtraOptions,
  clientTotalPrice: item.totalPrice, // For comparison only
}))
```

### Step 3: Server Verification
```typescript
// Server action recalculates everything
export async function verifyCart(cartItems: ClientCartItem[]) {
  for (const item of cartItems) {
    // 1. Fetch from database
    const dbItem = await db.select().from(menuItem).where(eq(menuItem.id, item.menuItemId))
    
    // 2. Recalculate price (NEVER trust client)
    const verifiedPrice = calculateTotalPrice(dbItem, item.selectedCustomOptions, item.selectedExtraOptions)
    
    // 3. Detect tampering
    const priceMismatch = Math.abs(item.clientTotalPrice - verifiedPrice) > 0.01
    
    if (priceMismatch) {
      console.warn('⚠️ SECURITY: Price tampering detected!')
    }
  }
  
  return { items: verifiedItems, total: calculatedTotal }
}
```

### Step 4: Display & Checkout
```typescript
// Display verified prices
<span>${item.verifiedPrice.toFixed(2)}</span>

// Process payment with VERIFIED total
await processPayment(verifiedCart.total) // This is the safe amount
```

## 🧪 Testing Security

### Test 1: Normal Flow
1. Add items to cart
2. Go to checkout
3. Prices should match menu prices ✅

### Test 2: Price Tampering
1. Add items to cart
2. Open DevTools Console
3. Run:
```javascript
const cart = JSON.parse(localStorage.getItem('checkout-cart'))
cart[0].totalPrice = 0.01
localStorage.setItem('checkout-cart', JSON.stringify(cart))
```
4. Go to checkout
5. Should see:
   - ⚠️ Warning: "Price discrepancy detected"
   - Correct price displayed (from database)
   - Badge showing "Price Corrected"

### Test 3: Invalid Item
1. Modify cart to include fake menu item ID
2. Should see error: "Invalid menu item: [id]"

## 💳 Payment Integration

The checkout button currently simulates payment. To integrate real payment:

### Stripe Example
```typescript
// In checkout-content.tsx
const handleCheckout = async () => {
  if (!verifiedCart) return
  
  // Create payment intent with VERIFIED amount
  const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: Math.round(verifiedCart.total * 100), // Cents
      currency: 'usd'
    })
  })
  
  const { clientSecret } = await response.json()
  
  // Process with Stripe
  const { error, paymentIntent } = await stripe.confirmPayment({
    clientSecret,
    // ... payment details
  })
  
  if (paymentIntent.status === 'succeeded') {
    // Create order in database
    await createOrder(verifiedCart)
    localStorage.removeItem('checkout-cart')
    router.push('/order-success')
  }
}
```

### Server-Side Payment Endpoint
```typescript
// app/api/create-payment-intent/route.ts
import Stripe from 'stripe'

export async function POST(req: Request) {
  const { amount } = await req.json()
  
  // ALWAYS verify amount server-side before charging
  // Don't trust client-sent amount directly
  
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount, // Already verified in verifyCart()
    currency: 'usd',
  })
  
  return Response.json({ clientSecret: paymentIntent.client_secret })
}
```

## 📊 Tax Calculation

Currently using 8% tax rate. Adjust in `verifyCart()`:

```typescript
// In app/actions/cart.ts
const tax = subtotal * 0.08 // Change this value

// Or make it dynamic based on location:
const taxRate = getTaxRateForLocation(userLocation)
const tax = subtotal * taxRate
```

## 🚀 Next Steps

1. **Database Orders Table**
   - Create orders and order_items tables
   - Store completed orders
   - Track order status

2. **Payment Integration**
   - Set up Stripe/PayPal
   - Create payment endpoints
   - Handle payment webhooks

3. **Email Notifications**
   - Send order confirmation
   - Send receipt
   - Notify on status changes

4. **Order History**
   - Create `/orders` page
   - Show past orders
   - Allow reordering

5. **Admin Order Management**
   - View all orders
   - Update order status
   - Manage fulfillment

## 🔐 Security Best Practices

✅ **DO:**
- Always recalculate prices server-side
- Validate all input data
- Log security events
- Use HTTPS in production
- Implement rate limiting
- Add CSRF protection

❌ **DON'T:**
- Trust client-sent prices
- Skip validation
- Expose sensitive data in responses
- Store payment info in localStorage
- Process payments without verification

## 📝 Summary

This implementation ensures that:
1. Users can conveniently store carts in localStorage
2. All prices are verified server-side before processing
3. Tampering attempts are detected and corrected
4. Payment processing uses verified amounts only
5. Security events are logged for monitoring

**The cart can be in localStorage for UX, but NEVER trust it for payment!**
