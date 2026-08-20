import * as cheerio from 'cheerio'

export interface SectionElement {
  type: string
  element: any
  $el: cheerio.Cheerio<any>
  priority: number
}

export interface ParsedTemplate {
  sections: SectionElement[]
  metadata: {
    title?: string
    description?: string
  }
  assets: {
    images: string[]
    fonts: string[]
    stylesheets: string[]
  }
  theme: {
    cssVariables: Record<string, string>
    fonts: string[]
  }
  $: cheerio.CheerioAPI
}

/**
 * Detect section type from element using multiple strategies
 * Priority: explicit data attribute > id/class heuristics > content heuristics
 */
function detectSectionType($el: cheerio.Cheerio<any>): string | null {
  // 1. Explicit data attribute (highest priority)
  const explicitType = $el.attr('data-perissos-section')
  if (explicitType) return explicitType

  // 2. ID-based detection
  const id = $el.attr('id')?.toLowerCase() || ''
  const idMappings: Record<string, string> = {
    hero: 'hero',
    about: 'about',
    services: 'services',
    'why-us': 'whyUs',
    'whyus': 'whyUs',
    team: 'team',
    portfolio: 'portfolio',
    blog: 'blog',
    pricing: 'pricing',
    cta: 'cta',
    contact: 'contact',
    menu: 'menu',
    'menu-highlights': 'menuHighlights',
    menuhighlights: 'menuHighlights',
    reservation: 'reservation',
    gallery: 'gallery',
    testimonials: 'testimonials',
    specials: 'specials',
    'specials-offers': 'specials',
    features: 'services',
    aboutus: 'about',
  }
  if (idMappings[id]) return idMappings[id]

  // 3. Class-based detection
  const classes = ($el.attr('class') || '').toLowerCase()
  const classMappings: Record<string, string> = {
    hero: 'hero',
    services: 'services',
    about: 'about',
    'why-us': 'whyUs',
    whyus: 'whyUs',
    team: 'team',
    portfolio: 'portfolio',
    blog: 'blog',
    pricing: 'pricing',
    cta: 'cta',
    contact: 'contact',
    menu: 'menu',
    'menu-highlights': 'menuHighlights',
    menuhighlights: 'menuHighlights',
    reservation: 'reservation',
    gallery: 'gallery',
    testimonials: 'testimonials',
    specials: 'specials',
    features: 'services',
  }
  for (const [key, value] of Object.entries(classMappings)) {
    if (classes.includes(key)) return value
  }

  // 4. Content heuristics (last resort)
  const html = $el.html() || ''
  const text = $el.text().toLowerCase()
  
  if (html.match(/<section[^>]*id=["']?hero/i) || text.includes('digital agency') || text.includes('where every meal')) return 'hero'
  if (html.match(/service|feature/i) && !html.match(/menu/)) return 'services'
  if (html.match(/about/i) && !html.match(/menu/)) return 'about'
  if (html.match(/why.?choose|why.?us/i)) return 'whyUs'
  if (html.match(/team|staff|expert/i)) return 'team'
  if (html.match(/portfolio|project|work/i)) return 'portfolio'
  if (html.match(/blog|article|news/i)) return 'blog'
  if (html.match(/pricing|plan|price/i)) return 'pricing'
  if (html.match(/cta|call.?to.?action|get.?started/i)) return 'cta'
  if (html.match(/contact|get.?in.?touch/i)) return 'contact'
  if (html.match(/menu|menu.?highlights/i) && text.includes('price')) return 'menuHighlights'
  if (html.match(/menu/i)) return 'menu'
  if (html.match(/reservation|book.?table|book.?now/i)) return 'reservation'
  if (html.match(/gallery|photo|image/i)) return 'gallery'
  if (html.match(/testimonial|review|client/i)) return 'testimonials'
  if (html.match(/special|offer|discount|deal/i)) return 'specials'

  return null
}

/**
 * Extract all assets from the document
 */
function extractAssets($: cheerio.CheerioAPI, baseUrl: string): ParsedTemplate['assets'] {
  const images: string[] = []
  const fonts: string[] = []
  const stylesheets: string[] = []

  // Images
  $('img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || ''
    if (src && !src.startsWith('data:')) {
      images.push(resolveUrl(src, baseUrl))
    }
  })

  // Background images in style attributes
  $('[style*="background-image"]').each((_, el) => {
    const style = $(el).attr('style') || ''
    const match = style.match(/background-image:\s*url\(['"]?([^'")]+)['"]?\)/i)
    if (match) images.push(resolveUrl(match[1], baseUrl))
  })

  // Fonts (Google Fonts)
  $('link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"]').each((_, el) => {
    const href = $(el).attr('href')
    if (href) fonts.push(resolveUrl(href, baseUrl))
  })

  // Stylesheets
  $('link[rel="stylesheet"]').each((_, el) => {
    const href = $(el).attr('href')
    if (href && !href.includes('fonts.googleapis.com')) {
      stylesheets.push(resolveUrl(href, baseUrl))
    }
  })

  return { images, fonts, stylesheets }
}

/**
 * Extract CSS custom properties from inline styles
 */
function extractCssVariables($: cheerio.CheerioAPI): Record<string, string> {
  const variables: Record<string, string> = {}

  // Collect all CSS from <style> tags
  const allCss: string[] = []
  $('style').each((_, el) => {
    const css = $(el).html() || ''
    allCss.push(css)
  })

  // Process all CSS for :root variables
  for (const css of allCss) {
    const rootMatches = css.match(/:root\s*\{([^}]+)\}/g)
    if (rootMatches) {
      for (let j = 0; j < rootMatches.length; j++) {
        const block = rootMatches[j]
        const varMatches = block.match(/--[\w-]+\s*:\s*[^;]+/g)
        if (varMatches) {
          for (let k = 0; k < varMatches.length; k++) {
            const v = varMatches[k]
            const [key, value] = v.split(':').map(s => s.trim())
            if (key && value) variables[key] = value.replace(/;$/, '')
          }
        }
      }
    }

    // Also look for any --variable: value patterns
    const allVars = css.match(/--[\w-]+\s*:\s*[^;]+/g)
    if (allVars) {
      for (let k = 0; k < allVars.length; k++) {
        const v = allVars[k]
        const [key, value] = v.split(':').map(s => s.trim())
        if (key && value) variables[key] = value.replace(/;$/, '')
      }
    }
  }

  // From inline style attributes on root elements
  const rootElements = $(':root, html, body').get()
  for (let i = 0; i < rootElements.length; i++) {
    const el = rootElements[i]
    const style = $(el).attr('style') || ''
    const vars = style.match(/--[\w-]+\s*:\s*[^;]+/g)
    if (vars) {
      for (let k = 0; k < vars.length; k++) {
        const v = vars[k]
        const [key, value] = v.split(':').map(s => s.trim())
        if (key && value) variables[key] = value.replace(/;$/, '')
      }
    }
  }

  return variables
}

/**
 * Extract Google Fonts
 */
function extractFonts($: cheerio.CheerioAPI): string[] {
  const fonts: string[] = []

  // From Google Fonts links
  $('link[href*="fonts.googleapis.com"]').each((_, el) => {
    const href = $(el).attr('href') || ''
    const familyMatch = href.match(/family=([^&]+)/)
    if (familyMatch) {
      const families = familyMatch[1].split('|')
      for (let j = 0; j < families.length; j++) {
        const f = families[j]
        const clean = f.replace(/\+/g, ' ').replace(/:.*$/, '')
        if (clean && !fonts.includes(clean)) fonts.push(clean)
      }
    }
  })

  // From CSS @import
  const styleElements = $('style').get()
  for (let i = 0; i < styleElements.length; i++) {
    const el = styleElements[i]
    const css = $(el).html() || ''
    const imports = css.match(/@import\s+['"][^'"]*fonts\.googleapis\.com[^'"]*['"]/g)
    if (imports) {
      for (let j = 0; j < imports.length; j++) {
        const imp = imports[j]
        const familyMatch = imp.match(/family=([^&'"]+)/)
        if (familyMatch) {
          const families = familyMatch[1].split('|')
          for (let k = 0; k < families.length; k++) {
            const f = families[k]
            const clean = f.replace(/\+/g, ' ').replace(/:.*$/, '')
            if (clean && !fonts.includes(clean)) fonts.push(clean)
          }
        }
      }
    }
  }

  return Array.from(new Set(fonts))
}

/**
 * Extract metadata from HTML head
 */
function extractMetadata($: cheerio.CheerioAPI): { title?: string; description?: string } {
  const title = $('title').first().text().trim() || undefined
  const description = $('meta[name="description"]').attr('content')?.trim() ||
                      $('meta[property="og:description"]').attr('content')?.trim() ||
                      undefined
  return { title, description }
}

/**
 * Resolve relative URLs
 */
function resolveUrl(url: string, base: string): string {
  try {
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//') || url.startsWith('data:')) {
      return url.startsWith('//') ? 'https:' + url : url
    }
    return new URL(url, base).href
  } catch {
    return url
  }
}

/**
 * Main entry point: parse HTML template
 */
export function parseTemplate(html: string, baseUrl: string = 'http://localhost'): ParsedTemplate {
  const $ = cheerio.load(html)

  // Extract metadata
  const metadata = extractMetadata($)

  // Extract assets
  const assets = extractAssets($, 'http://localhost')

  // Extract theme
  const cssVariables = extractCssVariables($)
  const fonts = extractFonts($)

  // Detect sections
  const sections: SectionElement[] = []
  const sectionSelectors = [
    'section',
    '[data-perissos-section]',
    'main > div',
    '.section',
    '[class*="section"]',
  ]

  const seenElements = new Set<any>()

  for (const selector of sectionSelectors) {
    $(selector).each((_, el) => {
      if (seenElements.has(el)) return
      seenElements.add(el)

      const $el = $(el)
      const type = detectSectionType($el)

      if (type) {
        // Calculate priority: explicit > id > class > heuristic
        let priority = 0
        if ($el.attr('data-perissos-section')) priority = 100
        else if ($el.attr('id')) priority = 50
        else if ($el.attr('class')) priority = 25
        else priority = 10

        sections.push({
          type,
          element: el,
          $el,
          priority,
        })
      }
    })
  }

  // Sort by priority (highest first) and deduplicate by type (keep highest priority)
  sections.sort((a, b) => b.priority - a.priority)
  const uniqueSections = new Map<string, SectionElement>()
  for (const section of sections) {
    if (!uniqueSections.has(section.type) || uniqueSections.get(section.type)!.priority < section.priority) {
      uniqueSections.set(section.type, section)
    }
  }

  return {
    sections: Array.from(uniqueSections.values()),
    metadata,
    assets,
    theme: {
      cssVariables,
      fonts,
    },
    $,
  }
}

/**
 * Extract section HTML for a specific type
 */
export function extractSectionHtml($: cheerio.CheerioAPI, section: SectionElement): string {
  return section.$el.html() || ''
}

export { cheerio }
export { resolveUrl }