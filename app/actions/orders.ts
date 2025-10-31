'use server'

import { db } from '@/db/drizzle'
import { order, orderItem } from '@/db/schema'
import { eq, gte, lt, and, desc, sql } from 'drizzle-orm'
import Xendit from 'xendit-node'

const xendit = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY!,
})

interface OrderItemData {
  menuItemId: string
  menuItemSnapshot: {
    name: string
    description: string
    price: number
    image: string
  }
  quantity: number
  selectedCustomOptions: Record<string, string>
  selectedExtraOptions: Record<string, number>
  totalPrice: number
  totalMacros: {
    protein: number
    carbs: number
    fats: number
    calories: number
  }
}

interface CreateOrderData {
  userId?: string
  customerName?: string
  customerEmail: string
  customerPhone?: string
  orderType: 'pickup' | 'dine-in' | 'delivery'
  tableNumber?: string
  items: OrderItemData[]
  subtotal: number
  tax: number
  discount: number
  total: number
  totalMacros: {
    protein: number
    carbs: number
    fats: number
    calories: number
  }
  specialInstructions?: string
  paymentMethod: 'xendit' | 'cash'
}

/**
 * Generate unique order number
 */
async function generateOrderNumber(): Promise<string> {
  const today = new Date()
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '')
  
  // Get count of orders today (start of day to end of day)
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0)
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
  
  const todayOrders = await db
    .select()
    .from(order)
    .where(
      and(
        gte(order.createdAt, todayStart),
        lt(order.createdAt, todayEnd)
      )
    )
  
  const orderCount = todayOrders.length + 1
  const paddedCount = String(orderCount).padStart(3, '0')
  
  return `ORD-${dateStr}-${paddedCount}`
}

/**
 * Create order and optionally generate Xendit invoice
 */
export async function createOrder(data: CreateOrderData): Promise<{
  success: boolean
  orderId?: string
  orderNumber?: string
  invoiceUrl?: string
  error?: string
}> {
  try {
    // Generate order number
    const orderNumber = await generateOrderNumber()
    
    // Create order in database
    const [newOrder] = await db.insert(order).values({
      orderNumber,
      userId: data.userId || null,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      status: 'pending',
      orderType: data.orderType,
      tableNumber: data.tableNumber,
      paymentStatus: data.paymentMethod === 'cash' ? 'pending' : 'pending',
      paymentMethod: data.paymentMethod,
      subtotal: data.subtotal,
      tax: data.tax,
      discount: data.discount,
      totalPrice: data.total,
      totalMacros: data.totalMacros,
      specialInstructions: data.specialInstructions,
    }).returning()

    // Create order items
    const orderItemsData = data.items.map(item => ({
      orderId: newOrder.id,
      menuItemId: item.menuItemId,
      menuItemSnapshot: item.menuItemSnapshot,
      selectedCustomOptions: item.selectedCustomOptions,
      selectedExtraOptions: item.selectedExtraOptions,
      quantity: item.quantity,
      totalPrice: item.totalPrice,
      totalMacros: item.totalMacros,
    }))

    await db.insert(orderItem).values(orderItemsData)

    // If payment method is Xendit, create invoice
    let invoiceUrl: string | undefined

    if (data.paymentMethod === 'xendit') {
      try {
        const { Invoice } = xendit
        
        // Create invoice
        const baseUrl = process.env.BETTER_AUTH_URL?.replace(/\/$/, '') || ''
        const invoice = await Invoice.createInvoice({
          data: {
            externalId: newOrder.id,
            amount: Math.round(data.total), // Xendit uses integer amount
            payerEmail: data.customerEmail,
            description: `Order ${orderNumber} - FitBite`,
            invoiceDuration: 86400, // 24 hours
            currency: 'IDR',
            successRedirectUrl: `${baseUrl}/orders/${newOrder.id}/success`,
            failureRedirectUrl: `${baseUrl}/orders/${newOrder.id}/failed`,
          }
        })

        invoiceUrl = invoice.invoiceUrl

        // Update order with Xendit invoice details
        await db.update(order)
          .set({
            xenditInvoiceId: invoice.id,
            xenditInvoiceUrl: invoice.invoiceUrl,
          })
          .where(eq(order.id, newOrder.id))

      } catch (xenditError) {
        console.error('Xendit invoice creation failed:', xenditError)
        // Don't fail the order, just log the error
        // Admin can manually create invoice later
      }
    }

    return {
      success: true,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      invoiceUrl,
    }

  } catch (error) {
    console.error('Error creating order:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create order'
    }
  }
}

/**
 * Get order by ID
 */
export async function getOrder(orderId: string) {
  try {
    const [orderData] = await db
      .select()
      .from(order)
      .where(eq(order.id, orderId))
      .limit(1)

    if (!orderData) {
      return { success: false, error: 'Order not found' }
    }

    const items = await db
      .select()
      .from(orderItem)
      .where(eq(orderItem.orderId, orderId))

    return {
      success: true,
      order: orderData,
      items,
    }
  } catch (error) {
    console.error('Error fetching order:', error)
    return {
      success: false,
      error: 'Failed to fetch order'
    }
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
): Promise<{ success: boolean; error?: string }> {
  try {
    const updates: any = { status }
    
    // Add timestamp based on status
    if (status === 'confirmed') updates.confirmedAt = new Date()
    if (status === 'preparing') updates.preparingAt = new Date()
    if (status === 'ready') updates.readyAt = new Date()
    if (status === 'completed') updates.completedAt = new Date()
    if (status === 'cancelled') updates.cancelledAt = new Date()

    await db.update(order)
      .set(updates)
      .where(eq(order.id, orderId))

    return { success: true }
  } catch (error) {
    console.error('Error updating order status:', error)
    return {
      success: false,
      error: 'Failed to update order status'
    }
  }
}

/**
 * Get all orders (for admin)
 */
export async function getAllOrders() {
  try {
    const orders = await db
      .select()
      .from(order)
      .orderBy(order.createdAt)

    return {
      success: true,
      orders,
    }
  } catch (error) {
    console.error('Error fetching orders:', error)
    return {
      success: false,
      error: 'Failed to fetch orders',
      orders: []
    }
  }
}

/**
 * Get user orders
 */
export async function getUserOrders(
  userId: string,
  filters?: {
    status?: string
    paymentStatus?: string
    orderType?: string
    limit?: number
    offset?: number
  }
) {
  try {
    const conditions = [eq(order.userId, userId)]
    
    // Add filters
    if (filters?.status) {
      conditions.push(eq(order.status, filters.status))
    }
    if (filters?.paymentStatus) {
      conditions.push(eq(order.paymentStatus, filters.paymentStatus))
    }
    if (filters?.orderType) {
      conditions.push(eq(order.orderType, filters.orderType))
    }

    // Build base query
    const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0]
    
    // Get orders with pagination
    const ordersQuery = db
      .select()
      .from(order)
      .where(whereCondition)
      .orderBy(desc(order.createdAt))
    
    // Apply pagination if specified
    const orders = await (filters?.limit 
      ? ordersQuery.limit(filters.limit).offset(filters.offset || 0)
      : ordersQuery)

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(order)
      .where(whereCondition)

    const totalCount = countResult?.count || 0

    return {
      success: true,
      orders,
      total: totalCount,
      hasMore: filters?.limit ? (filters.offset || 0) + orders.length < totalCount : false,
    }
  } catch (error) {
    console.error('Error fetching user orders:', error)
    return {
      success: false,
      error: 'Failed to fetch orders',
      orders: [],
      total: 0,
      hasMore: false,
    }
  }
}
