import type { CRMContact, CRMOpportunity } from './crm-adapter'
import type { AccountingAdapter, JournalEntryLine } from './accounting-adapter'

export interface CRMEvent {
  type: 'contact.created' | 'contact.updated' | 'deal.created' | 'deal.updated' | 'deal.stage_changed'
  data: Record<string, any>
  timestamp: string
  source: 'twenty' | 'perissos-crm'
}

export interface CRMAccountingBridgeResult {
  success: boolean
  action: string
  sourceId: string
  targetId?: string
  error?: string
}

export class CRMAccountingBridge {
  private crmAdapter: any
  private accountingAdapter: AccountingAdapter

  constructor(crmAdapter: any, accountingAdapter: AccountingAdapter) {
    this.crmAdapter = crmAdapter
    this.accountingAdapter = accountingAdapter
  }

  async syncContactToAccounting(contact: CRMContact): Promise<CRMAccountingBridgeResult> {
    try {
      const existing = await this.accountingAdapter.queryContacts(contact.email)
      if (existing.length > 0) {
        return { success: true, action: 'contact_exists', sourceId: contact.id, targetId: existing[0].id }
      }

      const result = await this.accountingAdapter.createContact({
        name: `${contact.firstName} ${contact.lastName}`.trim(),
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        notes: `Synced from CRM (${contact.source || 'unknown'})`,
      })

      return { success: true, action: 'contact_created', sourceId: contact.id, targetId: result.id }
    } catch (err: any) {
      return { success: false, action: 'contact_sync_failed', sourceId: contact.id, error: err.message }
    }
  }

  async syncDealToInvoice(deal: CRMOpportunity): Promise<CRMAccountingBridgeResult> {
    if (deal.stage !== 'closed_won') {
      return { success: true, action: 'deal_not_won', sourceId: deal.id }
    }

    try {
      const existing = await this.accountingAdapter.queryInvoices(deal.name)
      if (existing.length > 0) {
        return { success: true, action: 'invoice_exists', sourceId: deal.id, targetId: existing[0].id }
      }

      const result = await this.accountingAdapter.createInvoice({
        customerId: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        lineItems: [
          {
            itemId: '',
            description: deal.name,
            quantity: 1,
            rate: deal.amount,
          },
        ],
      })

      return { success: true, action: 'invoice_created', sourceId: deal.id, targetId: result.id }
    } catch (err: any) {
      return { success: false, action: 'deal_sync_failed', sourceId: deal.id, error: err.message }
    }
  }

  async syncDealStageChange(deal: CRMOpportunity, previousStage: string): Promise<CRMAccountingBridgeResult> {
    if (deal.stage !== 'closed_won' || previousStage === 'closed_won') {
      return { success: true, action: 'stage_not_relevant', sourceId: deal.id }
    }

    return this.syncDealToInvoice(deal)
  }

  async handleWebhook(event: CRMEvent): Promise<CRMAccountingBridgeResult> {
    switch (event.type) {
      case 'contact.created':
      case 'contact.updated': {
        const contact = event.data as unknown as CRMContact
        return this.syncContactToAccounting(contact)
      }
      case 'deal.created':
      case 'deal.updated': {
        const deal = event.data as unknown as CRMOpportunity
        return this.syncDealToInvoice(deal)
      }
      case 'deal.stage_changed': {
        const { deal, previousStage } = event.data as { deal: CRMOpportunity; previousStage: string }
        return this.syncDealStageChange(deal, previousStage)
      }
      default:
        return { success: false, action: 'unknown_event', sourceId: '', error: `Unknown event type: ${event.type}` }
    }
  }
}

export function createCRMAccountingBridge(): CRMAccountingBridge {
  const { getCRMAdapter } = require('./crm-adapter')
  const { getAccountingAdapter } = require('./accounting-adapter')
  return new CRMAccountingBridge(getCRMAdapter(), getAccountingAdapter())
}
