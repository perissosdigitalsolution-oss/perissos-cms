import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sectionRegistry, sectionSchemas } from '@perissos/shared/registry/sections'

interface ChatRequest {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  context?: Record<string, any>
  conversationId?: string
}

const BLOCK_SYSTEM_PROMPT = `You are an AI Assistant for Perissos CMS. You help users create and manage website sections, templates, themes, CRM contacts, commerce products, and accounting/finance.

CAPABILITIES:
1. Generate structured section blocks (hero, services, testimonials, pricing, etc.)
2. Search existing content via RAG (Retrieval-Augmented Generation)
3. Update themes (colors, fonts, spacing)
4. Create templates
5. Query CRM contacts (search, filter)
6. Create new CRM contacts
7. Update existing CRM contacts
8. Delete CRM contacts
9. Query commerce products (search, filter by category, price)
10. Create commerce orders from carts
11. Get cart details
12. Add items to cart
13. Update commerce products
14. Query accounting invoices (search, filter by status)
15. Get specific invoice details
16. Create new invoices
17. Update invoice status (draft/sent/paid/void)
18. Query journal entries
19. Create journal entries (double-entry bookkeeping)
20. Query chart of accounts
21. Get specific account details
22. Get financial summary (assets, liabilities, equity, revenue, expenses, net income)
23. Generate financial reports (Profit & Loss, Balance Sheet, Trial Balance, Cash Flow)
24. Answer questions about Perissos CMS

RULES:
- Output ONLY valid JSON when generating blocks
- Use the provided context to give relevant answers
- When user asks to create something, use the "action" field in your response
- Available actions: create_section, update_theme, search_content, create_template, generate_section, query_crm, create_crm_contact, update_crm_contact, delete_crm_contact, query_products, create_order, get_cart, add_to_cart, update_product, query_invoices, get_invoice, create_invoice, update_invoice_status, query_journal_entries, create_journal_entry, query_accounts, get_account, get_financial_summary, generate_report
- For CRM mutations (create/update/delete), confirm with the user before executing
- For commerce mutations (create_order, update_product), confirm with the user before executing
- For accounting mutations (create_invoice, update_invoice_status, create_journal_entry), confirm with the user before executing
- Always be helpful and concise

CONTEXT:
- Current page: {pageContext}
- Current template: {templateContext}
- User role: {userRole}
- Available section types: {sectionTypes}
- CRM provider: {crmProvider}
- Commerce provider: {commerceProvider}
- Accounting provider: {accountingProvider}

{ragContext}

Current conversation:
{conversationHistory}

User request: {userPrompt}

Respond with a JSON object:
{
  "content": "Your natural language response to the user",
  "action": {
    "type": "create_section|update_theme|search_content|create_template|generate_section|query_crm|create_crm_contact|update_crm_contact|delete_crm_contact|query_products|create_order|get_cart|add_to_cart|update_product|query_invoices|get_invoice|create_invoice|update_invoice_status|query_journal_entries|create_journal_entry|query_accounts|get_account|get_financial_summary|generate_report",
    "params": { ... },
    "description": "What this action does"
  } | null
}`

async function callOpenAI(prompt: string, apiKey: string, model?: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an AI Assistant for Perissos CMS. Respond only with valid JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      stream: true,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI API error: ${res.status} - ${err}`)
  }

  return ''
}

async function callAnthropic(prompt: string, apiKey: string, model?: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: model || 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: 'You are an AI Assistant for Perissos CMS. Respond only with valid JSON.',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Anthropic API error: ${res.status} - ${err}`)
  }

  return ''
}

async function callCustomEndpoint(prompt: string, url: string, apiKey?: string): Promise<string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      messages: [
        { role: 'system', content: 'You are an AI Assistant for Perissos CMS. Respond only with valid JSON.' },
        { role: 'user', content: prompt },
      ],
      stream: true,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Custom AI endpoint error: ${res.status} - ${err}`)
  }

  return ''
}

async function getRAGContext(payload: any, userQuery: string): Promise<string> {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return 'No RAG context available (no API key).'

    const embeddingRes = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: userQuery,
      }),
    })

    if (!embeddingRes.ok) return 'RAG context unavailable.'

    const embeddingData = await embeddingRes.json()
    const queryEmbedding = embeddingData.data[0].embedding
    const vectorStr = '[' + queryEmbedding.join(',') + ']'

    const { Pool } = await import('pg')
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://perissos:perissos_dev_password@localhost:5432/perissos_dev',
      max: 5,
    })

    const sqlQuery = `
      SELECT content_type, content_id, chunk_text, metadata,
             1 - (embedding <=> $1::vector) AS score
      FROM embeddings
      WHERE content_type IN ('template_section', 'template', 'page_section', 'page')
      ORDER BY embedding <=> $1::vector
      LIMIT 5
    `

    const sqlResult = await pool.query(sqlQuery, [vectorStr])
    await pool.end()

    if (sqlResult.rows.length > 0) {
      return '\n\nRELEVANT CONTEXT FROM YOUR CONTENT:\n' + 
        sqlResult.rows.map((r: any) => 
          `[${r.content_type}:${r.content_id}] ${r.chunk_text.substring(0, 300)} (similarity: ${parseFloat(r.score).toFixed(2)})`
        ).join('\n\n')
    }
  } catch (err) {
    console.warn('RAG context retrieval failed:', err)
  }
  return ''
}

function buildPrompt(req: ChatRequest): string {
  const lastUserMessage = req.messages.filter(m => m.role === 'user').pop()
  const userPrompt = lastUserMessage?.content || ''

  const pageContext = req.context?.pageData?.title ? 
    `${req.context.pageData.title} (${req.context.pageData.sections?.length || 0} sections)` : 'None'
  const templateContext = req.context?.templateData?.name ? 
    `${req.context.templateData.name} (${req.context.templateData.category})` : 'None'
  const userRole = req.context?.userRole || 'editor'
  const sectionTypes = Object.keys(sectionRegistry).map(k => (sectionRegistry as any)[k].key).join(', ')

  const conversationHistory = req.messages.slice(-6).map(m => 
    `${m.role}: ${m.content.substring(0, 200)}`
  ).join('\n')

  const ragContext = req.context?.useRAG ? 'RAG enabled - context will be injected' : ''
  const crmProvider = process.env.CRM_PROVIDER || 'mock'
  const commerceProvider = process.env.COMMERCE_PROVIDER || 'mock'
  const accountingProvider = process.env.ACCOUNTING_PROVIDER || 'mock'

  return BLOCK_SYSTEM_PROMPT
    .replace('{pageContext}', pageContext)
    .replace('{templateContext}', templateContext)
    .replace('{userRole}', userRole)
    .replace('{sectionTypes}', sectionTypes)
    .replace('{crmProvider}', crmProvider)
    .replace('{commerceProvider}', commerceProvider)
    .replace('{accountingProvider}', accountingProvider)
    .replace('{ragContext}', ragContext)
    .replace('{conversationHistory}', conversationHistory)
    .replace('{userPrompt}', userPrompt)
}

function detectBlockType(prompt: string): string {
  const lower = prompt.toLowerCase()
  if (lower.includes('hero') || lower.includes('banner') || lower.includes('landing')) return 'hero'
  if (lower.includes('service') || lower.includes('feature') || lower.includes('offering')) return 'services'
  if (lower.includes('about') || lower.includes('story') || lower.includes('company')) return 'about'
  if (lower.includes('why') || lower.includes('reason') || lower.includes('advantage')) return 'whyUs'
  if (lower.includes('team') || lower.includes('member') || lower.includes('staff')) return 'team'
  if (lower.includes('portfolio') || lower.includes('project') || lower.includes('work')) return 'portfolio'
  if (lower.includes('blog') || lower.includes('article') || lower.includes('post')) return 'blog'
  if (lower.includes('pricing') || lower.includes('plan') || lower.includes('price')) return 'pricing'
  if (lower.includes('cta') || lower.includes('call to action') || lower.includes('signup')) return 'cta'
  if (lower.includes('contact') || lower.includes('form') || lower.includes('reach')) return 'contact'
  if (lower.includes('testimonial') || lower.includes('review') || lower.includes('feedback')) return 'testimonials'
  if (lower.includes('gallery') || lower.includes('photo') || lower.includes('image')) return 'gallery'
  if (lower.includes('menu') || lower.includes('food') || lower.includes('dish')) return 'menu'
  if (lower.includes('special') || lower.includes('offer') || lower.includes('discount')) return 'specials'
  if (lower.includes('reservation') || lower.includes('booking') || lower.includes('table')) return 'reservation'
  return 'cta'
}

function generateFallbackBlock(prompt: string, theme?: Record<string, string>): Record<string, any> {
  const blockType = detectBlockType(prompt)
  const primary = theme?.primary || '#FF6600'

  const blocks: Record<string, () => Record<string, any>> = {
    hero: () => ({
      badgeText: '#1 Digital Agency',
      badgeIcon: 'fas fa-bolt',
      title: prompt.split(' ').slice(0, 8).join(' ') || 'We Build Digital Experiences',
      titleHighlight: 'Digital',
      description: 'Transforming businesses through innovative technology solutions.',
      primaryButtonText: 'Get Started',
      primaryButtonUrl: '#contact',
      secondaryButtonText: 'View Our Work',
      secondaryButtonUrl: '#portfolio',
    }),
    services: () => ({
      badgeText: 'Our Services',
      badgeIcon: 'fas fa-cog',
      title: 'Solutions That Drive Growth',
      titleHighlight: 'Growth',
      description: 'Comprehensive digital services for your business.',
      items: [
        { icon: 'fas fa-code', title: 'Web Development', description: 'Custom web solutions built with modern technologies.', linkText: 'Learn More' },
        { icon: 'fas fa-mobile-alt', title: 'Mobile Apps', description: 'Native and cross-platform mobile applications.', linkText: 'Learn More' },
        { icon: 'fas fa-paint-brush', title: 'UI/UX Design', description: 'User-centered design that transforms ideas into experiences.', linkText: 'Learn More' },
      ],
    }),
    cta: () => ({
      title: prompt.split(' ').slice(0, 6).join(' ') || 'Ready to Get Started?',
      description: 'Join us today and transform your business.',
      buttonText: 'Start Now',
      buttonUrl: '#contact',
    }),
    testimonials: () => ({
      badgeText: 'Testimonials',
      badgeIcon: 'fas fa-quote-left',
      title: '"Absolutely wonderful experience"',
      titleHighlight: 'wonderful',
      description: 'Hear from our satisfied clients.',
      testimonials: [
        { name: 'Happy Client', role: 'CEO', rating: 5, text: 'Outstanding service and results.' },
      ],
    }),
    pricing: () => ({
      badgeText: 'Pricing',
      badgeIcon: 'fas fa-tag',
      title: 'Flexible Pricing Plans',
      titleHighlight: 'Pricing',
      description: 'Choose the plan that fits your needs.',
      plans: [
        { name: 'Starter', price: '$499', period: '/project', features: [{ text: 'Responsive Design' }, { text: '5 Pages' }], buttonText: 'Get Started', buttonStyle: 'outline' },
        { name: 'Pro', price: '$999', period: '/project', featured: true, features: [{ text: 'Everything in Starter' }, { text: '15 Pages' }, { text: 'CMS' }], buttonText: 'Get Started', buttonStyle: 'primary' },
      ],
    }),
    contact: () => ({
      title: 'Get In Touch',
      titleHighlight: 'Touch',
      description: 'We would love to hear from you.',
      contactItems: [
        { icon: 'fas fa-envelope', label: 'Email Us', value: 'hello@agency.com' },
        { icon: 'fas fa-phone', label: 'Call Us', value: '+1 (555) 123-4567' },
      ],
    }),
  }

  const generator = blocks[blockType] || blocks.cta
  return { ...generator(), blockType }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const body: ChatRequest = await request.json()
    const { messages, context, conversationId } = body

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 })
    }

    const openaiKey = process.env.OPENAI_API_KEY
    const anthropicKey = process.env.ANTHROPIC_API_KEY
    const customUrl = process.env.AI_MODEL_URL
    const customKey = process.env.AI_MODEL_KEY

    // Get RAG context if requested
    let ragContext = ''
    if (context?.useRAG) {
      const lastUserMessage = messages.filter(m => m.role === 'user').pop()
      if (lastUserMessage) {
        ragContext = await getRAGContext(payload, lastUserMessage.content)
      }
    }

    const prompt = buildPrompt({ ...body, context: { ...context, useRAG: true } })

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        let provider = 'fallback'
        let fullContent = ''
        let action: any = null

        const sendChunk = (data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        }

        try {
          let raw = ''

          if (customUrl) {
            raw = await callCustomEndpoint(prompt, customUrl, customKey)
            provider = 'custom'
          } else if (openaiKey) {
            // Use non-streaming for simplicity, then simulate streaming
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiKey}`,
              },
              body: JSON.stringify({
                model: process.env.AI_MODEL || 'gpt-4o-mini',
                messages: [
                  { role: 'system', content: 'You are an AI Assistant for Perissos CMS. Respond only with valid JSON.' },
                  { role: 'user', content: prompt },
                ],
                temperature: 0.7,
                max_tokens: 2000,
              }),
            })

            if (res.ok) {
              const data = await res.json()
              raw = data.choices?.[0]?.message?.content || ''
              provider = 'openai'
            }
          } else if (anthropicKey) {
            const res = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': anthropicKey,
                'anthropic-version': '2023-06-01',
              },
              body: JSON.stringify({
                model: process.env.AI_MODEL || 'claude-sonnet-4-20250514',
                max_tokens: 2000,
                system: 'You are an AI Assistant for Perissos CMS. Respond only with valid JSON.',
                messages: [{ role: 'user', content: prompt }],
              }),
            })

            if (res.ok) {
              const data = await res.json()
              raw = data.content?.[0]?.text || ''
              provider = 'anthropic'
            }
          }

          if (!raw) {
            raw = JSON.stringify(generateFallbackBlock(
              messages.filter(m => m.role === 'user').pop()?.content || '',
              context?.theme
            ))
            provider = 'fallback'
          }

          // Parse and validate JSON
          let parsed: any
          try {
            const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
            parsed = JSON.parse(cleaned)
          } catch {
            parsed = { content: raw, action: null }
          }

          // Simulate streaming by sending content in chunks
          const content = parsed.content || ''
          const words = content.split(' ')
          let accumulated = ''

          for (let i = 0; i < words.length; i++) {
            accumulated += words[i] + (i < words.length - 1 ? ' ' : '')
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: accumulated })}\n\n`))
            await new Promise(r => setTimeout(r, 30)) // Simulate streaming
          }

          if (parsed.action) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ action: parsed.action })}\n\n`))
          }

        } catch (err: any) {
          console.error('AI chat error:', err)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: `Error: ${err.message}` })}\n\n`))
        }

        controller.close()
      },
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (err: any) {
    console.error('AI chat error:', err)
    return NextResponse.json({ error: err.message || 'Chat failed' }, { status: 500 })
  }
}