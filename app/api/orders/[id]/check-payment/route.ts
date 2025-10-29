import { NextRequest, NextResponse } from 'next/server'
import { Xendit } from 'xendit-node'
import { db } from '@/db/drizzle'
import { order } from '@/db/schema'
import { eq } from 'drizzle-orm'

const xendit = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY!,
})

/**
 * Manual Payment Status Checker
 * Use this in development since webhooks don't work on localhost
 * 
 * GET /api/orders/[id]/check-payment
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await context.params

    // Get order from database
    const [orderData] = await db
      .select()
      .from(order)
      .where(eq(order.id, orderId))
      .limit(1)

    if (!orderData) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check if order has Xendit invoice
    if (!orderData.xenditInvoiceId) {
      return NextResponse.json(
        { error: 'No Xendit invoice for this order' },
        { status: 400 }
      )
    }

    // Fetch invoice status from Xendit
    const { Invoice } = xendit
    const invoice = await Invoice.getInvoiceById({
      invoiceId: orderData.xenditInvoiceId,
    })

    console.log(`Invoice ${invoice.id} status: ${invoice.status}`)

    // Update order based on invoice status
    let updatedStatus = orderData.paymentStatus

    if (invoice.status === 'PAID' || invoice.status === 'SETTLED') {
      if (orderData.paymentStatus !== 'paid') {
        await db.update(order)
          .set({
            paymentStatus: 'paid',
            status: 'confirmed',
            confirmedAt: new Date(),
          })
          .where(eq(order.id, orderId))

        updatedStatus = 'paid'
        console.log(`✅ Order ${orderId} marked as PAID`)
      }
    } else if (invoice.status === 'EXPIRED') {
      if (orderData.paymentStatus !== 'failed') {
        await db.update(order)
          .set({
            paymentStatus: 'failed',
            status: 'cancelled',
            cancelledAt: new Date(),
          })
          .where(eq(order.id, orderId))

        updatedStatus = 'failed'
        console.log(`❌ Order ${orderId} marked as EXPIRED`)
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      invoiceId: invoice.id,
      invoiceStatus: invoice.status,
      paymentStatus: updatedStatus,
      updated: updatedStatus !== orderData.paymentStatus,
    })
  } catch (error) {
    console.error('Error checking payment status:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to check payment status',
      },
      { status: 500 }
    )
  }
}
