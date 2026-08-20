import { NextRequest, NextResponse } from 'next/server'

interface GenerateRequest {
  prompt: string
  templateCategory?: string
  theme?: Record<string, string>
  existingSections?: string[]
  context?: 'block' | 'section' | 'page'
}

const SYSTEM_PROMPT = `You are a web designer for Perissos CMS. Generate HTML/CSS for web sections.

Rules:
- Output ONLY the HTML snippet, no markdown, no \`\`\`html blocks
- Use inline styles (no external CSS classes)
- Use the theme colors provided (primary, dark, light, etc.)
- Use Font Awesome icons (fas fa-*) where appropriate
- Mobile-responsive with max-width containers
- Clean, modern design
- Each section should be a complete <section> or <div> element
- Do NOT include <html>, <head>, <body>, or <style> tags`

function buildUserPrompt(req: GenerateRequest): string {
  const themeStr = req.theme ? `Theme colors: primary=${req.theme.primary || '#FF6600'}, dark=${req.theme.dark || '#1a1a1a'}, light=${req.theme.light || '#ffffff'}, gray=${req.theme.gray || '#666666'}` : 'Theme colors: primary=#FF6600'
  const existingStr = req.existingSections?.length ? `Existing sections: ${req.existingSections.join(', ')}` : ''
  const contextMap = { block: 'a single UI component block', section: 'a full page section', page: 'a complete page layout with multiple sections' }
  const contextStr = contextMap[req.context || 'section']

  return `Generate ${contextStr} based on this description: "${req.prompt}"

${themeStr}
${existingStr}

Output clean HTML with inline styles. Make it visually polished and production-ready.`
}

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
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI API error: ${res.status} - ${err}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
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
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: prompt },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Anthropic API error: ${res.status} - ${err}`)
  }

  const data = await res.json()
  return data.content?.[0]?.text || ''
}

async function callCustomEndpoint(prompt: string, url: string, apiKey?: string): Promise<string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Custom AI endpoint error: ${res.status} - ${err}`)
  }

  const data = await res.json()
  // Support OpenAI-compatible format
  return data.choices?.[0]?.message?.content || data.content?.[0]?.text || ''
}

function generateFallbackHtml(prompt: string, theme?: Record<string, string>): string {
  const primary = theme?.primary || '#FF6600'
  const dark = theme?.dark || '#1a1a1a'
  const lowerPrompt = prompt.toLowerCase()

  if (lowerPrompt.includes('hero') || lowerPrompt.includes('banner') || lowerPrompt.includes('landing')) {
    return `<section style="padding: 100px 40px; text-align: center; background: linear-gradient(135deg, ${dark} 0%, #16213e 100%); color: #fff;">
  <h1 style="font-size: 48px; font-weight: 700; margin-bottom: 16px;">${prompt.split(' ').slice(0, 6).join(' ')}</h1>
  <p style="font-size: 18px; opacity: 0.8; margin-bottom: 32px; max-width: 600px; margin-left: auto; margin-right: auto;">Professional solutions crafted for your success.</p>
  <a href="#" style="display: inline-block; padding: 14px 32px; background: ${primary}; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">Get Started</a>
</section>`
  }

  if (lowerPrompt.includes('feature') || lowerPrompt.includes('service') || lowerPrompt.includes('benefit')) {
    return `<section style="padding: 60px 40px; background: #fff;">
  <div style="max-width: 1100px; margin: 0 auto; text-align: center;">
    <h2 style="font-size: 32px; font-weight: 700; margin-bottom: 40px;">Our Features</h2>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px;">
      <div style="padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <div style="width: 48px; height: 48px; background: ${primary}15; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;"><i class="fas fa-bolt" style="color: ${primary}; font-size: 20px;"></i></div>
        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Fast</h3>
        <p style="color: #666; font-size: 14px;">Lightning-fast performance.</p>
      </div>
      <div style="padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <div style="width: 48px; height: 48px; background: ${primary}15; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;"><i class="fas fa-shield-halved" style="color: ${primary}; font-size: 20px;"></i></div>
        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Secure</h3>
        <p style="color: #666; font-size: 14px;">Enterprise-grade security.</p>
      </div>
      <div style="padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <div style="width: 48px; height: 48px; background: ${primary}15; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;"><i class="fas fa-mobile-screen" style="color: ${primary}; font-size: 20px;"></i></div>
        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Responsive</h3>
        <p style="color: #666; font-size: 14px;">Works on every device.</p>
      </div>
    </div>
  </div>
</section>`
  }

  if (lowerPrompt.includes('cta') || lowerPrompt.includes('call to action') || lowerPrompt.includes('signup') || lowerPrompt.includes('register')) {
    return `<section style="padding: 80px 40px; background: linear-gradient(135deg, ${primary} 0%, ${primary}dd 100%); text-align: center; color: #fff;">
  <h2 style="font-size: 36px; font-weight: 700; margin-bottom: 16px;">Ready to Get Started?</h2>
  <p style="font-size: 18px; opacity: 0.9; margin-bottom: 32px; max-width: 500px; margin-left: auto; margin-right: auto;">Join us today and transform your business.</p>
  <a href="#" style="display: inline-block; padding: 14px 32px; background: #fff; color: ${primary}; text-decoration: none; border-radius: 8px; font-weight: 700;">Start Now</a>
</section>`
  }

  if (lowerPrompt.includes('testimon') || lowerPrompt.includes('review') || lowerPrompt.includes('feedback')) {
    return `<section style="padding: 60px 40px; background: #f9fafb; text-align: center;">
  <div style="max-width: 700px; margin: 0 auto;">
    <i class="fas fa-quote-left" style="font-size: 36px; color: ${primary}; opacity: 0.3; margin-bottom: 16px;"></i>
    <p style="font-size: 20px; line-height: 1.7; color: #374151; font-style: italic; margin-bottom: 24px;">"${prompt.split(' ').slice(0, 10).join(' ')} — this has been an amazing experience for our team."</p>
    <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
      <div style="width: 48px; height: 48px; background: #e5e7eb; border-radius: 50%;"></div>
      <div style="text-align: left;">
        <div style="font-weight: 600; color: #111;">Happy Customer</div>
        <div style="font-size: 13px; color: #666;">CEO, Company</div>
      </div>
    </div>
  </div>
</section>`
  }

  if (lowerPrompt.includes('pricing') || lowerPrompt.includes('plan') || lowerPrompt.includes('price')) {
    return `<section style="padding: 60px 40px; background: #fff;">
  <div style="max-width: 1000px; margin: 0 auto; text-align: center;">
    <h2 style="font-size: 32px; font-weight: 700; margin-bottom: 40px;">Pricing Plans</h2>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
      <div style="padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h3 style="font-size: 18px; font-weight: 600;">Starter</h3>
        <div style="font-size: 36px; font-weight: 700; margin: 16px 0;">$9<span style="font-size: 14px; font-weight: 400; color: #666;">/mo</span></div>
        <a href="#" style="display: block; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; text-decoration: none; color: #374151;">Choose Plan</a>
      </div>
      <div style="padding: 32px; border: 2px solid ${primary}; border-radius: 12px; position: relative;">
        <div style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: ${primary}; color: #fff; padding: 4px 12px; border-radius: 12px; font-size: 12px;">Popular</div>
        <h3 style="font-size: 18px; font-weight: 600;">Pro</h3>
        <div style="font-size: 36px; font-weight: 700; margin: 16px 0;">$29<span style="font-size: 14px; font-weight: 400; color: #666;">/mo</span></div>
        <a href="#" style="display: block; padding: 10px; background: ${primary}; color: #fff; border-radius: 8px; text-decoration: none;">Choose Plan</a>
      </div>
      <div style="padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h3 style="font-size: 18px; font-weight: 600;">Enterprise</h3>
        <div style="font-size: 36px; font-weight: 700; margin: 16px 0;">$99<span style="font-size: 14px; font-weight: 400; color: #666;">/mo</span></div>
        <a href="#" style="display: block; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; text-decoration: none; color: #374151;">Choose Plan</a>
      </div>
    </div>
  </div>
</section>`
  }

  if (lowerPrompt.includes('contact') || lowerPrompt.includes('form') || lowerPrompt.includes('reach')) {
    return `<section style="padding: 60px 40px; background: #fff;">
  <div style="max-width: 500px; margin: 0 auto; text-align: center;">
    <h2 style="font-size: 28px; font-weight: 700; margin-bottom: 32px;">Contact Us</h2>
    <form style="display: flex; flex-direction: column; gap: 16px;">
      <input type="text" placeholder="Your Name" style="padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">
      <input type="email" placeholder="Email Address" style="padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">
      <textarea rows="4" placeholder="Your Message" style="padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; resize: vertical;"></textarea>
      <button type="submit" style="padding: 12px; background: ${primary}; color: #fff; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer;">Send Message</button>
    </form>
  </div>
</section>`
  }

  // Default: generic section
  return `<section style="padding: 60px 40px; background: #fff;">
  <div style="max-width: 800px; margin: 0 auto; text-align: center;">
    <h2 style="font-size: 28px; font-weight: 700; margin-bottom: 16px;">${prompt.split(' ').slice(0, 5).join(' ')}</h2>
    <p style="color: #666; font-size: 16px; line-height: 1.7;">${prompt}</p>
  </div>
</section>`
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json()
    const { prompt, templateCategory, theme, existingSections, context } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const openaiKey = process.env.OPENAI_API_KEY
    const anthropicKey = process.env.ANTHROPIC_API_KEY
    const customUrl = process.env.AI_MODEL_URL
    const customKey = process.env.AI_MODEL_KEY

    let html = ''

    if (customUrl) {
      // Custom endpoint (Ollama, vLLM, etc.)
      html = await callCustomEndpoint(buildUserPrompt(body), customUrl, customKey)
    } else if (openaiKey) {
      html = await callOpenAI(buildUserPrompt(body), openaiKey, process.env.AI_MODEL)
    } else if (anthropicKey) {
      html = await callAnthropic(buildUserPrompt(body), anthropicKey, process.env.AI_MODEL)
    } else {
      // Fallback: template-based generation
      html = generateFallbackHtml(prompt, theme)
    }

    // Clean the response - remove markdown code blocks if present
    html = html.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim()

    return NextResponse.json({ html, provider: customUrl ? 'custom' : openaiKey ? 'openai' : anthropicKey ? 'anthropic' : 'fallback' })
  } catch (err: any) {
    console.error('AI generate error:', err)
    return NextResponse.json({ error: err.message || 'Generation failed' }, { status: 500 })
  }
}
