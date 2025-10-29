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
    const { external_id, status, id } = body

    if (!external_id) {
      console.error('No external_id in webhook')
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // external_id is our order ID
    const orderId = external_id

    // Update order based on payment status
    if (status === 'PAID' || status === 'SETTLED') {
      await db.update(order)
        .set({
          paymentStatus: 'paid',
          status: 'confirmed', // Automatically confirm when paid
          confirmedAt: new Date(),
        })
        .where(eq(order.id, orderId))

      console.log(`✅ Order ${orderId} marked as PAID`)
    } else if (status === 'EXPIRED') {
      await db.update(order)
        .set({
          paymentStatus: 'failed',
          status: 'cancelled',
          cancelledAt: new Date(),
        })
        .where(eq(order.id, orderId))

      console.log(`❌ Order ${orderId} EXPIRED`)
    } else if (status === 'FAILED') {
      await db.update(order)
        .set({
          paymentStatus: 'failed',
        })
        .where(eq(order.id, orderId))

      console.log(`❌ Order ${orderId} payment FAILED`)
    } else if (status === 'PENDING') {
      console.log(`⏳ Order ${orderId} still PENDING`)
    }

    return NextResponse.json({ success: true, status })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
