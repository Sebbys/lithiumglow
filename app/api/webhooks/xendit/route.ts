import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db/drizzle'
import { order } from '@/db/schema'
import { eq } from 'drizzle-orm'

/**
 * Xendit Webhook Handler
 * Handles payment notifications from Xendit
 * 
 * Note: Webhooks only work in production with publicly accessible URLs.
 * In development, use the manual payment checker API instead.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Verify webhook signature (important for production!)
    const xenditCallback = req.headers.get('x-callback-token')
    const expectedToken = process.env.XENDIT_WEBHOOK_TOKEN
    
    if (expectedToken && xenditCallback !== expectedToken) {
      console.error('Invalid webhook token')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Xendit webhook received:', JSON.stringify(body, null, 2))

    // Handle different event types
    // Xendit sends status as: PENDING, PAID, SETTLED, EXPIRED (uppercase)
    const { external_id, status, id, payment_method, paid_at } = body

    if (!external_id) {
      console.error('No external_id in webhook payload')
      return NextResponse.json({ error: 'Missing external_id' }, { status: 400 })
    }

    if (!status) {
      console.error('No status in webhook payload')
      return NextResponse.json({ error: 'Missing status' }, { status: 400 })
    }

    // external_id is our order ID
    const orderId = external_id

    // Check if order exists first
    const existingOrder = await db.query.order.findFirst({
      where: eq(order.id, orderId)
    })

    if (!existingOrder) {
      console.error(`Order ${orderId} not found in database`)
      // Return 200 to prevent Xendit from retrying, but log the error
      return NextResponse.json({ 
        success: false, 
        message: 'Order not found',
        orderId 
      }, { status: 200 })
    }

    console.log(`Found order ${orderId} with current status: ${existingOrder.paymentStatus}`)

    // Update order based on payment status
    if (status === 'PAID' || status === 'SETTLED') {
      const updateResult = await db.update(order)
        .set({
          paymentStatus: 'paid',
          status: 'confirmed', // Automatically confirm when paid
          confirmedAt: new Date(),
        })
        .where(eq(order.id, orderId))

      console.log(`✅ Order ${orderId} marked as PAID`)
      console.log(`Payment method: ${payment_method}, Paid at: ${paid_at}`)
      
      return NextResponse.json({ 
        success: true, 
        status,
        orderId,
        message: 'Order updated to PAID'
      })
    } else if (status === 'EXPIRED') {
      await db.update(order)
        .set({
          paymentStatus: 'failed',
          status: 'cancelled',
          cancelledAt: new Date(),
        })
        .where(eq(order.id, orderId))

      console.log(`❌ Order ${orderId} EXPIRED`)
      
      return NextResponse.json({ 
        success: true, 
        status,
        orderId,
        message: 'Order marked as EXPIRED'
      })
    } else if (status === 'FAILED') {
      await db.update(order)
        .set({
          paymentStatus: 'failed',
        })
        .where(eq(order.id, orderId))

      console.log(`❌ Order ${orderId} payment FAILED`)
      
      return NextResponse.json({ 
        success: true, 
        status,
        orderId,
        message: 'Order marked as FAILED'
      })
    } else if (status === 'PENDING') {
      console.log(`⏳ Order ${orderId} still PENDING`)
      
      return NextResponse.json({ 
        success: true, 
        status,
        orderId,
        message: 'Order status is PENDING'
      })
    } else {
      console.warn(`⚠️ Unknown status: ${status} for order ${orderId}`)
      
      return NextResponse.json({ 
        success: true, 
        status,
        orderId,
        message: `Unknown status: ${status}`
      })
    }
  } catch (error) {
    console.error('Webhook error:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
