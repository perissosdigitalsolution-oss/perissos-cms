import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // Get the current user
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { prompt, category, templateType } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Call Onlook AI API to generate template
    const onlookUrl = process.env.NEXT_PUBLIC_ONLOOK_URL || 'http://localhost:3002'
    const openRouterKey = process.env.OPENROUTER_API_KEY

    const systemPrompt = `
You are an expert web designer creating templates for Perissos CMS.
Generate a complete template structure based on the user's prompt.

Template Category: ${category || 'general'}
Template Type: ${templateType || 'landing'}

Perissos CMS uses these section types:
- hero: Hero banner with headline, subtitle, CTA
- services: Service cards grid
- about: About section with content
- whyUs: Why choose us features
- team: Team member cards
- portfolio: Portfolio/project grid
- blog: Blog post cards
- pricing: Pricing table
- cta: Call to action section
- contact: Contact form
- menu: Restaurant menu
- menuHighlights: Featured dishes
- reservation: Booking form
- gallery: Image gallery
- testimonials: Customer reviews
- specials: Special offers
- pricing: Pricing tables

Return a JSON structure with:
1. templateConfig: { name, description, category, sections[] }
2. html: Complete HTML with inlined CSS
3. css: CSS styles
4. theme: { primary, dark, light, fonts, etc. }
`

    // For now, return a structured response that Onlook can use
    // In production, this would call Onlook's API or OpenRouter
    const response = {
      success: true,
      template: {
        prompt,
        category: category || 'general',
        templateType: templateType || 'landing',
        systemPrompt,
        // Onlook will fill in the actual generated content
        generatedAt: new Date().toISOString(),
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Onlook generate error:', error)
    return NextResponse.json({ error: 'Failed to generate template' }, { status: 500 })
  }
}