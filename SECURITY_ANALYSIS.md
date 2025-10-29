# Security Vulnerability Analysis: Cart Price Manipulation

## 🚨 CRITICAL: Price Tampering Vulnerability

### Current Implementation (INSECURE)
```typescript
// Client stores cart with calculated prices
localStorage.setItem("checkout-cart", JSON.stringify(cart))

// Cart structure includes:
interface CartItem {
  totalPrice: number  // ❌ Can be modified in DevTools
  quantity: number    // ❌ Can be modified
  // ... other data
}
```

### Attack Scenario
1. User adds items to cart
2. Opens browser DevTools → Console
3. Runs malicious code:
```javascript
const cart = JSON.parse(localStorage.getItem('checkout-cart'))
cart[0].totalPrice = 0.01  // Change from $50 to $0.01
cart[0].quantity = 100     // Order 100 items
localStorage.setItem('checkout-cart', JSON.stringify(cart))
```
4. Proceeds to checkout
5. **System charges $0.01 instead of actual price** 💸

### Impact
- **Revenue Loss**: Customers can set any price
- **Inventory Issues**: Can manipulate quantities
- **Business Risk**: Severe financial impact

---

## ✅ SECURE SOLUTION

### Option 1: Server-Side Cart (RECOMMENDED)

**Store cart in database, not localStorage**

```typescript
// Create server action for cart management
'use server'

export async function addToCart(userId: string, itemId: string, options: CartOptions) {
  // Fetch REAL price from database
  const menuItem = await db.query.menuItem.findFirst({
    where: eq(menuItem.id, itemId)
  })
  
  // Calculate price SERVER-SIDE
  const totalPrice = calculatePriceOnServer(menuItem, options)
  
  // Store in database
  await db.insert(cartItem).values({
    userId,
    menuItemId: itemId,
    options: JSON.stringify(options),
    // Don't store price - recalculate on checkout
  })
}

export async function checkout(userId: string) {
  // Fetch cart items from database
  const cartItems = await db.query.cartItem.findMany({
    where: eq(cartItem.userId, userId)
  })
  
  // Recalculate ALL prices from database
  let total = 0
  for (const item of cartItems) {
    const menuItem = await getMenuItem(item.menuItemId)
    const price = calculatePriceOnServer(menuItem, item.options)
    total += price * item.quantity
  }
  
  // Process payment with VERIFIED total
  return processPayment(total)
}
```

### Option 2: Signed Cart (Alternative)

**Sign cart data to prevent tampering**

```typescript
import crypto from 'crypto'

// Server-side signing
export async function signCart(cart: CartItem[]) {
  const data = JSON.stringify(cart)
  const signature = crypto
    .createHmac('sha256', process.env.CART_SECRET!)
    .update(data)
    .digest('hex')
  
  return { data, signature }
}

// Verify on checkout
export async function verifyAndCheckout(data: string, signature: string) {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.CART_SECRET!)
    .update(data)
    .digest('hex')
  
  if (signature !== expectedSignature) {
    throw new Error('Cart has been tampered with!')
  }
  
  // Still recalculate prices as additional safeguard
  const cart = JSON.parse(data)
  const verifiedTotal = await recalculatePrices(cart)
  
  return processPayment(verifiedTotal)
}
```

### Option 3: Cart ID Reference (BEST)

**Store only cart item IDs + quantities, recalculate everything on checkout**

```typescript
// Client only stores item references
interface ClientCart {
  items: Array<{
    menuItemId: string      // Just the ID
    quantity: number
    customOptions: Record<string, string>
    extraOptions: Record<string, number>
  }>
}

// Checkout recalculates from database
export async function checkout(cart: ClientCart) {
  let total = 0
  const orderItems = []
  
  for (const item of cart.items) {
    // Fetch REAL data from database
    const menuItem = await getMenuItem(item.menuItemId)
    
    if (!menuItem) {
      throw new Error('Invalid menu item')
    }
    
    // Calculate price from database data
    const price = calculateTotalPrice(
      menuItem,
      item.customOptions,
      item.extraOptions
    )
    
    total += price * item.quantity
    orderItems.push({ menuItem, price, quantity: item.quantity })
  }
  
  // Process payment with server-calculated total
  return processPayment(total, orderItems)
}
```

---

## Implementation Plan

### Phase 1: Immediate Fix (Quick)
1. Create server action to recalculate prices
2. On checkout, verify all prices server-side
3. Never trust client-sent prices

### Phase 2: Database Cart (Recommended)
1. Create cart tables in database
2. Store cart items server-side
3. Associate with user session
4. Remove localStorage cart

### Phase 3: Enhanced Security
1. Add rate limiting on cart operations
2. Log suspicious price changes
3. Add checkout validation middleware
4. Implement fraud detection

---

## Code Example: Secure Checkout Flow

### 1. Create Server Action
```typescript
// app/actions/cart.ts
'use server'

import { db } from '@/db/drizzle'
import { menuItem } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { calculateTotalPrice } from '@/lib/macro-calculator'

export async function verifyAndCreateOrder(cartData: ClientCart) {
  // Verify each item and recalculate prices
  const verifiedItems = []
  let total = 0
  
  for (const item of cartData.items) {
    // Fetch from database - source of truth
    const [dbItem] = await db
      .select()
      .from(menuItem)
      .where(eq(menuItem.id, item.menuItemId))
    
    if (!dbItem) {
      throw new Error(`Invalid item: ${item.menuItemId}`)
    }
    
    // Recalculate price server-side
    const calculatedPrice = calculateTotalPrice(
      dbItem,
      item.customOptions,
      item.extraOptions
    )
    
    verifiedItems.push({
      ...item,
      verifiedPrice: calculatedPrice,
      menuItem: dbItem
    })
    
    total += calculatedPrice * item.quantity
  }
  
  return {
    items: verifiedItems,
    total,
    // Create order in database with verified prices
  }
}
```

### 2. Update Checkout Component
```typescript
// components/checkout.tsx
'use client'

export function Checkout() {
  const handleCheckout = async () => {
    const cartData = JSON.parse(localStorage.getItem('checkout-cart'))
    
    // Send to server for verification
    const verified = await verifyAndCreateOrder(cartData)
    
    // Process payment with VERIFIED total
    await processPayment(verified.total)
  }
}
```

---

## Testing the Vulnerability

### Current State Test:
```javascript
// Run in browser console on your site
console.log('Original cart:', localStorage.getItem('checkout-cart'))

const cart = JSON.parse(localStorage.getItem('checkout-cart'))
cart[0].totalPrice = 0.01
localStorage.setItem('checkout-cart', JSON.stringify(cart))

console.log('Modified cart:', localStorage.getItem('checkout-cart'))
// Proceed to checkout - will it charge $0.01? YES! 🚨
```

### After Fix Test:
```javascript
// Same manipulation attempt
cart[0].totalPrice = 0.01
localStorage.setItem('checkout-cart', JSON.stringify(cart))

// Server will:
// 1. Ignore client price
// 2. Recalculate from database
// 3. Charge correct amount ✅
```

---

## Conclusion

**IMMEDIATE ACTION REQUIRED:**

1. ✅ Never trust client-side price calculations
2. ✅ Always recalculate prices on the server
3. ✅ Fetch menu item data from database on checkout
4. ✅ Validate quantities against inventory
5. ✅ Log all checkout attempts for audit

**Priority:** HIGH - This is a critical vulnerability that can cause significant financial loss.

**Recommendation:** Implement Option 3 (Cart ID Reference) as it's the most secure and follows e-commerce best practices.
