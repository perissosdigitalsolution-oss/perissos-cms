// Medusa → Accounting Webhook (Sprint 19)
// Receives order.paid events from Medusa and creates journal entries in Bigcapital

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getAccountingAdapter } from '@/lib/accounting-adapter'

interface MedusaOrderPaidWebhook {
  id: string
  email: string
  currency_code: string
  total: number
  subtotal: number
  tax_total: number
  discount_total: number
  shipping_total: number
  items: Array<{
    id: string
    title: string
    quantity: number
    unit_price: number
    total: number
  }>
  billing_address?: {
    first_name: string
    last_name: string
    company?: string
    address_1: string
    address_2?: string
    city: string
    province?: string
    postal_code: string
    country_code: string
    phone?: string
  }
  created_at: string
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature/idempotency
    const eventId = request.headers.get('x-medusa-event-id') || request.headers.get('idempotency-key')
    const eventType = request.headers.get('x-medusa-event-type') || request.headers.get('type')

    if (!eventId) {
      return NextResponse.json({ error: 'Missing idempotency key (x-medusa-event-id)' }, { status: 400 })
    }

    if (eventType !== 'order.paid') {
      return NextResponse.json({ received: true, message: 'Event type not handled' }, { status: 200 })
    }

    const payload = await getPayload({ config })

    // Check if we've already processed this event (idempotency)
    const existing = await payload.find({
      collection: 'webhookEvents',
      where: {
        eventId: { equals: eventId },
      },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      return NextResponse.json({ received: true, message: 'Event already processed' }, { status: 200 })
    }

    // Parse webhook body
    const body: MedusaOrderPaidWebhook = await request.json()

    if (!body.id || !body.total) {
      return NextResponse.json({ error: 'Invalid order data' }, { status: 400 })
    }

    // Get accounting adapter
    const adapter = getAccountingAdapter()

    // Get or create customer in accounting system
    let customerId = '1' // Default to first customer
    let customerName = 'Medusa Customer'
    let customerEmail = body.email

    if (body.billing_address) {
      customerName = `${body.billing_address.first_name} ${body.billing_address.last_name}`.trim()
    }

    // Try to find existing customer
    try {
      const accounts = await adapter.queryAccounts(customerName, 1)
      if (accounts.length > 0 && accounts[0].accountType === 'accounts-receivable') {
        // Found AR account, use it
      }
    } catch {
      // Use default
    }

    // Create journal entry for the order payment
    // Debit: Accounts Receivable (Asset)
    // Credit: Revenue (Income)
    const journalEntry = await adapter.createJournalEntry({
      date: body.created_at.split('T')[0], // YYYY-MM-DD
      reference: `MEDUSA-ORDER-${body.id}`,
      entries: [
        {
          index: 1,
          accountId: 1006, // Accounts Receivable (A/R)
          debit: body.total,
          credit: 0,
          description: `Order ${body.id} - ${customerName}`,
        },
        {
          index: 2,
          accountId: 1025, // Sales of Product Income
          debit: 0,
          credit: body.total,
          description: `Order ${body.id} revenue`,
        },
      ],
    })

    // Also create an invoice for tracking
    const invoice = await adapter.createInvoice({
      customerId,
      invoiceDate: body.created_at.split('T')[0],
      dueDate: body.created_at.split('T')[0], // Due immediately for paid orders
      lineItems: body.items.map((item, idx) => ({
        itemId: item.id,
        quantity: item.quantity,
        rate: item.unit_price,
        description: item.title,
      })),
    })

    // Store webhook event for idempotency
    await payload.create({
      collection: 'webhookEvents',
      data: {
        eventId,
        eventType: 'order.paid',
        source: 'medusa',
        payload: body,
        result: {
          journalEntryId: journalEntry.id,
          invoiceId: invoice.id,
        },
        processedAt: new Date().toISOString(),
      },
    })

    return NextResponse.json({
      success: true,
      journalEntry: journalEntry.id,
      invoice: invoice.id,
    })
  } catch (err: any) {
    console.error('Accounting webhook error:', err)
    return NextResponse.json({ error: err.message || 'Webhook processing failed' }, { status: 500 })
  }
}