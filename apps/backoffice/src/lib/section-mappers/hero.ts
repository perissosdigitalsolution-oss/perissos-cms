import { getSectionSchema } from '@perissos/shared/registry/sections'
import * as cheerio from 'cheerio'
const HeroSchema = getSectionSchema('hero')
export function mapHeroSection($: cheerio.CheerioAPI, $el: cheerio.Cheerio<any>): Record<string, any> {
  const result: Record<string, any> = {}
  // Badge
  const badgeEl = $el.find('[class*="badge"], [class*="tag"], .badge, .tag').first()
  if (badgeEl.length) {
    result.badgeIcon = badgeEl.find('i, svg').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fas fa-bolt'
    result.badgeText = badgeEl.text().trim() || '#1 Digital Agency'
  } else {
    result.badgeIcon = 'fas fa-bolt'
    result.badgeText = '#1 Digital Agency'
  }
  // Title
  const titleEl = $el.find('h1, h2, .hero-title, .title').first()
  result.title = titleEl.text().trim() || 'We Build Digital Experiences That Matter'
  // Title highlight - look for span, strong, em, or colored text
  const highlightEl = $el.find('h1 span, h1 strong, h1 em, h1 [style*="color"], .highlight, .text-primary').first()
  result.titleHighlight = highlightEl.text().trim() || 'Digital'
  // Description
  const descEl = $el.find('p, .hero-text, .description, .lead').first()
  result.description = descEl.text().trim() || 'Transforming businesses through innovative technology solutions. We craft cutting-edge digital products that drive growth and engagement.'
  // Primary button
  const primaryBtn = $el.find('a.btn, a.button, .btn-primary, .btn--primary, .hero-cta a').first()
  if (primaryBtn.length) {
    result.primaryButtonText = primaryBtn.text().trim() || 'Start a Project'
    result.primaryButtonIcon = primaryBtn.find('i, svg').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fas fa-arrow-right'
    result.primaryButtonUrl = primaryBtn.attr('href') || '#contact'
  } else {
    result.primaryButtonText = 'Start a Project'
    result.primaryButtonIcon = 'fas fa-arrow-right'
    result.primaryButtonUrl = '#contact'
  }
  // Secondary button
  const secondaryBtn = $el.find('a.btn-secondary, a.btn-outline, .btn--secondary, .hero-cta a:not(:first-child)').first()
  if (secondaryBtn.length) {
    result.secondaryButtonText = secondaryBtn.text().trim() || 'View Our Work'
    result.secondaryButtonIcon = secondaryBtn.find('i, svg').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fas fa-play'
    result.secondaryButtonUrl = secondaryBtn.attr('href') || '#portfolio'
  } else {
    result.secondaryButtonText = 'View Our Work'
    result.secondaryButtonIcon = 'fas fa-play'
    result.secondaryButtonUrl = '#portfolio'
  }
  // Stats
  const stats: Array<{ value: string; label: string }> = []
  $el.find('[class*="stat"], [class*="counter"], .stat-item, .counter-item').each((_, el) => {
    const value = $(el).find('[class*="value"], [class*="number"], .stat-value, .counter-value').text().trim()
    const label = $(el).find('[class*="label"], [class*="text"], .stat-label, .counter-label').text().trim()
    if (value || label) stats.push({ value: value || '250+', label: label || 'Projects Completed' })
  })
  if (stats.length === 0) {
    // Try to find numbers in text
    const text = $el.text()
    const numbers = text.match(/\d+[%+]?/g)
    if (numbers && numbers.length >= 3) {
      stats.push(
        { value: numbers[0], label: 'Projects Completed' },
        { value: numbers[1], label: 'Team Members' },
        { value: numbers[2], label: 'Client Satisfaction' }
      )
    }
  }
  result.stats = stats.length > 0 ? stats : [
    { value: '250+', label: 'Projects Completed' },
    { value: '50+', label: 'Team Members' },
    { value: '98%', label: 'Client Satisfaction' },
  ]
  // Floating cards
  const floatingCards: Array<{ icon: string; label: string; value: string }> = []
  $el.find('[class*="card"], [class*="feature"], .floating-card, .feature-card').each((_, el) => {
    const icon = $(el).find('i, svg').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fas fa-chart-line'
    const label = $(el).find('[class*="label"], [class*="title"], h3, h4, .label').text().trim()
    const value = $(el).find('[class*="value"], [class*="number"], .value').text().trim()
    if (label || value) {
      floatingCards.push({
        icon: icon || 'fas fa-chart-line',
        label: label || 'Revenue Growth',
        value: value || '+127% This Year',
      })
    }
  })
  result.floatingCards = floatingCards.length > 0 ? floatingCards : [
    { icon: 'fas fa-chart-line', label: 'Revenue Growth', value: '+127% This Year' },
    { icon: 'fas fa-users', label: 'Happy Clients', value: '250+ Worldwide' },
  ]
  // Main image
  const img = $el.find('img').first()
  if (img.length) {
    const src = img.attr('src') || img.attr('data-src')
    if (src) {
      // Store as a reference - actual upload handled by asset pipeline
      result.mainImage = src
    }
  }
  // Validate with Zod and return with defaults for missing fields
  const parsed = HeroSchema.safeParse(result)
  if (parsed.success) {
    return parsed.data
  } else {
    console.warn('Hero validation failed, using defaults:', parsed.error.flatten().fieldErrors)
    return HeroSchema.parse({})
  }
}
export default mapHeroSection