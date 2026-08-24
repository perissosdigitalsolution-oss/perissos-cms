import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sectionRegistry, sectionSchemas, validateSectionProps, getSectionDefaultProps } from '@perissos/shared/registry/sections'
import { getCRMAdapter } from '@/lib/crm-adapter'
import { getCommerceAdapter } from '@/lib/commerce-adapter'
import { getAccountingAdapter } from '@/lib/accounting-adapter'

interface ActionRequest {
  type:
    | 'create_section'
    | 'update_theme'
    | 'search_content'
    | 'create_template'
    | 'generate_section'
    | 'query_crm'
    | 'create_crm_contact'
    | 'update_crm_contact'
    | 'delete_crm_contact'
    | 'query_products'
    | 'create_order'
    | 'get_cart'
    | 'add_to_cart'
    | 'update_product'
    | 'query_invoices'
    | 'get_invoice'
    | 'create_invoice'
    | 'update_invoice_status'
    | 'query_journal_entries'
    | 'create_journal_entry'
    | 'query_accounts'
    | 'get_account'
    | 'get_financial_summary'
    | 'generate_report'
  params: Record<string, any>
  context: Record<string, any>
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const body: ActionRequest = await request.json()
    const { type, params, context } = body

    if (!type || !params) {
      return NextResponse.json({ error: 'Type and params required' }, { status: 400 })
    }

    let result: any

    switch (type) {
      case 'create_section': {
        const { blockType, pageId, prompt, theme, useRAG } = params

        if (!blockType || !pageId) {
          return NextResponse.json({ error: 'blockType and pageId required' }, { status: 400 })
        }

        // Validate blockType exists in registry
        if (!sectionRegistry[blockType]) {
          return NextResponse.json({ error: `Unknown blockType: ${blockType}` }, { status: 400 })
        }

        // Generate section data (use AI or fallback)
        let sectionData: any

        if (prompt && process.env.OPENAI_API_KEY) {
          // Use AI generate endpoint
          const generateRes = await fetch(`${process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3000'}/api/ai/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: `Create a ${blockType} section: ${prompt}`,
              mode: 'block',
              templateCategory: context.templateCategory,
              theme: context.theme,
              useRAG: true,
            }),
          })

          if (generateRes.ok) {
            const genData = await generateRes.json()
            if (genData.block) {
              sectionData = genData.block
            }
          }
        }

        // Fallback to default props
        if (!sectionData) {
          sectionData = getSectionDefaultProps(blockType)
          sectionData.blockType = blockType
        }

        // Validate against schema
        const schema = sectionSchemas[blockType as keyof typeof sectionSchemas]
        if (schema) {
          const result = schema.safeParse(sectionData)
          if (!result.success) {
            return NextResponse.json({ error: 'Invalid section data', details: result.error.errors }, { status: 400 })
          }
          sectionData = result.data
        }

        // Add required fields
        sectionData.blockType = blockType
        sectionData._order = params.order ?? 0
        sectionData._path = `root.${params.order ?? 0}`

        // Get current page sections
        const page = await payload.findByID({
          collection: 'pages',
          id: params.pageId,
          depth: 0,
        })

        if (!page) {
          return NextResponse.json({ error: 'Page not found' }, { status: 404 })
        }

        const currentSections = page.sections || []
        const newOrder = params.order ?? currentSections.length
        const newSections = [...currentSections]

        // Insert at correct position
        const insertIndex = Math.min(newOrder, newSections.length)
        newSections.splice(insertIndex, 0, {
          ...sectionData,
          _order: newOrder,
          _path: `root.${newOrder}`,
        })

        // Re-order all sections
        newSections.forEach((s, i) => {
          s._order = i
          s._path = `root.${i}`
        })

        // Update page
        const updatedPage = await payload.update({
          collection: 'pages',
          id: params.pageId,
          data: { sections: newSections },
        })

        result = { section: updatedPage.sections?.find((s: any) => s._order === newOrder), page: updatedPage }
        break
      }

      case 'update_theme': {
        const { pageId, theme } = params

        if (!pageId || !theme) {
          return NextResponse.json({ error: 'pageId and theme required' }, { status: 400 })
        }

        const updatedPage = await payload.update({
          collection: 'pages',
          id: params.pageId,
          data: { theme },
        })

        result = { page: updatedPage }
        break
      }

      case 'search_content': {
        const { query: searchQuery, topK = 5, contentTypes } = params

        if (!searchQuery) {
          return NextResponse.json({ error: 'Query required' }, { status: 400 })
        }

        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) {
          return NextResponse.json({ error: 'No OpenAI API key configured' }, { status: 400 })
        }

        const embeddingRes = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: searchQuery,
          }),
        })

        if (!embeddingRes.ok) {
          return NextResponse.json({ error: 'Failed to generate embedding' }, { status: 500 })
        }

        const embeddingData = await embeddingRes.json()
        const queryEmbedding = embeddingData.data[0].embedding
        const vectorStr = '[' + queryEmbedding.join(',') + ']'

        const { Pool } = await import('pg')
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL || 'postgresql://perissos:perissos_dev_password@localhost:5432/perissos_dev',
          max: 5,
        })

        let whereClause = ''
        const sqlParams: any[] = [vectorStr, topK]

        if (contentTypes && contentTypes.length > 0) {
          const placeholders = contentTypes.map((_: any, i: number) => `$${i + 3}`).join(',')
          whereClause = `AND content_type IN (${placeholders})`
          sqlParams.push(...contentTypes)
        }

        const sqlQuery = `
          SELECT content_type, content_id, chunk_text, metadata,
                 1 - (embedding <=> $1::vector) AS score
          FROM embeddings
          WHERE 1=1 ${whereClause}
          ORDER BY embedding <=> $1::vector
          LIMIT $2
        `

        const sqlResult = await pool.query(sqlQuery, sqlParams)
        await pool.end()

        result = { results: sqlResult.rows.map((row: any) => ({
          contentType: row.content_type,
          contentId: row.content_id,
          chunkText: row.chunk_text,
          score: parseFloat(row.score),
          metadata: row.metadata,
        })) }
        break
      }

      case 'create_template': {
        const { name, category, sections, theme } = params

        if (!name || !category) {
          return NextResponse.json({ error: 'name and category required' }, { status: 400 })
        }

        const template = await payload.create({
          collection: 'templates',
          data: {
            name,
            category,
            isActive: false,
            version: '1.0.0',
            layoutConfig: {
              sections: sections || [],
              theme: theme || {},
              sectionContents: [],
              cssVariableMapping: {},
            },
          },
        })

        result = { template }
        break
      }

      case 'generate_section': {
        // Use the AI generate endpoint with RAG
        const { prompt, blockType, templateCategory, theme, useRAG } = params

        if (!prompt) {
          return NextResponse.json({ error: 'Prompt required' }, { status: 400 })
        }

        const generateRes = await fetch(`${process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3000'}/api/ai/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            mode: 'block',
            blockType,
            templateCategory: templateCategory || context.templateCategory,
            theme: theme || context.theme,
            useRAG: useRAG ?? true,
            currentSections: context.sections?.map((s: any) => ({ blockType: s.blockType, title: s.title || s.badgeText || '' })) || [],
          }),
        })

        if (!generateRes.ok) {
          const err = await generateRes.json()
          return NextResponse.json({ error: err.error || 'Generation failed' }, { status: 500 })
        }

        const genData = await generateRes.json()
        result = genData
        break
      }

      case 'query_crm': {
        const { filter, limit = 10 } = params

        const adapter = getCRMAdapter()
        const contacts = await adapter.queryContacts(filter, limit)

        result = {
          contacts,
          count: contacts.length,
          source: process.env.CRM_PROVIDER || 'mock',
          query: filter || null,
        }
        break
      }

      case 'create_crm_contact': {
        const { contactData } = params
        if (!contactData?.firstName || !contactData?.email) {
          return NextResponse.json({ error: 'firstName and email required' }, { status: 400 })
        }
        const adapter = getCRMAdapter()
        const contact = await adapter.createContact(contactData)
        result = { success: true, contact, source: process.env.CRM_PROVIDER || 'mock' }
        break
      }

      case 'update_crm_contact': {
        const { contactId, contactData } = params
        if (!contactId) {
          return NextResponse.json({ error: 'contactId required' }, { status: 400 })
        }
        const adapter = getCRMAdapter()
        const contact = await adapter.updateContact(contactId, contactData || {})
        result = { success: true, contact, source: process.env.CRM_PROVIDER || 'mock' }
        break
      }

      case 'delete_crm_contact': {
        const { contactId } = params
        if (!contactId) {
          return NextResponse.json({ error: 'contactId required' }, { status: 400 })
        }
        const adapter = getCRMAdapter()
        const success = await adapter.deleteContact(contactId)
        result = { success, source: process.env.CRM_PROVIDER || 'mock' }
        break
      }

      case 'query_products': {
        const { filter, limit = 10 } = params
        const adapter = getCommerceAdapter()
        const products = await adapter.queryProducts(filter, limit)
        result = {
          products,
          count: products.length,
          source: process.env.COMMERCE_PROVIDER || 'mock',
          query: filter || null,
        }
        break
      }

      case 'create_order': {
        const { cartId, email } = params
        if (!cartId || !email) {
          return NextResponse.json({ error: 'cartId and email required' }, { status: 400 })
        }
        const adapter = getCommerceAdapter()
        const order = await adapter.createOrder(cartId, email)
        result = { success: true, order, source: process.env.COMMERCE_PROVIDER || 'mock' }
        break
      }

      case 'get_cart': {
        const { cartId } = params
        if (!cartId) {
          return NextResponse.json({ error: 'cartId required' }, { status: 400 })
        }
        const adapter = getCommerceAdapter()
        const cart = await adapter.getCart(cartId)
        result = { cart, source: process.env.COMMERCE_PROVIDER || 'mock' }
        break
      }

      case 'add_to_cart': {
        const { cartId, productId, quantity = 1 } = params
        if (!cartId || !productId) {
          return NextResponse.json({ error: 'cartId and productId required' }, { status: 400 })
        }
        const adapter = getCommerceAdapter()
        const cart = await adapter.addToCart(cartId, productId, quantity)
        result = { success: true, cart, source: process.env.COMMERCE_PROVIDER || 'mock' }
        break
      }

      case 'update_product': {
        const { productId, productData } = params
        if (!productId) {
          return NextResponse.json({ error: 'productId required' }, { status: 400 })
        }
        const adapter = getCommerceAdapter()
        const product = await adapter.updateProduct(productId, productData || {})
        result = { success: true, product, source: process.env.COMMERCE_PROVIDER || 'mock' }
        break
      }

      // Accounting actions
      case 'query_invoices': {
        const { filter, limit = 10 } = params
        const adapter = getAccountingAdapter()
        const invoices = await adapter.queryInvoices(filter, limit)
        result = {
          invoices,
          count: invoices.length,
          source: process.env.ACCOUNTING_PROVIDER || 'mock',
          query: filter || null,
        }
        break
      }

      case 'get_invoice': {
        const { invoiceId } = params
        if (!invoiceId) {
          return NextResponse.json({ error: 'invoiceId required' }, { status: 400 })
        }
        const adapter = getAccountingAdapter()
        const invoice = await adapter.getInvoice(invoiceId)
        result = { invoice, source: process.env.ACCOUNTING_PROVIDER || 'mock' }
        break
      }

      case 'create_invoice': {
        const { customerId, invoiceDate, dueDate, lineItems } = params
        if (!customerId || !invoiceDate || !dueDate || !lineItems?.length) {
          return NextResponse.json({ error: 'customerId, invoiceDate, dueDate, and lineItems required' }, { status: 400 })
        }
        const adapter = getAccountingAdapter()
        const invoice = await adapter.createInvoice({ customerId, invoiceDate, dueDate, lineItems })
        result = { success: true, invoice, source: process.env.ACCOUNTING_PROVIDER || 'mock' }
        break
      }

      case 'update_invoice_status': {
        const { invoiceId, status } = params
        if (!invoiceId || !status) {
          return NextResponse.json({ error: 'invoiceId and status required' }, { status: 400 })
        }
        const adapter = getAccountingAdapter()
        const invoice = await adapter.updateInvoiceStatus(invoiceId, status)
        result = { success: true, invoice, source: process.env.ACCOUNTING_PROVIDER || 'mock' }
        break
      }

      case 'query_journal_entries': {
        const { filter, limit = 10 } = params
        const adapter = getAccountingAdapter()
        const entries = await adapter.queryJournalEntries(filter, limit)
        result = {
          journalEntries: entries,
          count: entries.length,
          source: process.env.ACCOUNTING_PROVIDER || 'mock',
          query: filter || null,
        }
        break
      }

      case 'create_journal_entry': {
        const { date, reference, entries } = params
        if (!date || !reference || !entries?.length) {
          return NextResponse.json({ error: 'date, reference, and entries required' }, { status: 400 })
        }
        const adapter = getAccountingAdapter()
        const entry = await adapter.createJournalEntry({ date, reference, entries })
        result = { success: true, journalEntry: entry, source: process.env.ACCOUNTING_PROVIDER || 'mock' }
        break
      }

      case 'query_accounts': {
        const { filter, limit = 50 } = params
        const adapter = getAccountingAdapter()
        const accounts = await adapter.queryAccounts(filter, limit)
        result = {
          accounts,
          count: accounts.length,
          source: process.env.ACCOUNTING_PROVIDER || 'mock',
          query: filter || null,
        }
        break
      }

      case 'get_account': {
        const { accountId } = params
        if (!accountId) {
          return NextResponse.json({ error: 'accountId required' }, { status: 400 })
        }
        const adapter = getAccountingAdapter()
        const account = await adapter.getAccount(accountId)
        result = { account, source: process.env.ACCOUNTING_PROVIDER || 'mock' }
        break
      }

      case 'get_financial_summary': {
        const adapter = getAccountingAdapter()
        const summary = await adapter.getFinancialSummary()
        result = { summary, source: process.env.ACCOUNTING_PROVIDER || 'mock' }
        break
      }

      case 'generate_report': {
        const { type, startDate, endDate } = params
        if (!type || !startDate || !endDate) {
          return NextResponse.json({ error: 'type, startDate, and endDate required' }, { status: 400 })
        }
        const adapter = getAccountingAdapter()
        const report = await adapter.generateReport(type, startDate, endDate)
        result = { report, source: process.env.ACCOUNTING_PROVIDER || 'mock' }
        break
      }

      default:
        return NextResponse.json({ error: `Unknown action type: ${type}` }, { status: 400 })
    }

    return NextResponse.json({ success: true, result, action: type })
  } catch (err: any) {
    console.error('AI action error:', err)
    return NextResponse.json({ error: err.message || 'Action failed' }, { status: 500 })
  }
}