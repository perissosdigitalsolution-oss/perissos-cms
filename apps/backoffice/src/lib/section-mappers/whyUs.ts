import { getSectionSchema } from '@perissos/shared/registry/sections'
import * as cheerio from 'cheerio'
const WhyUsSchema = getSectionSchema('whyUs')
export function mapWhyUsSection($: cheerio.CheerioAPI, $el: cheerio.Cheerio<any>): Record<string, any> {
  const result: Record<string, any> = {}
  // Badge
  const badgeEl = $el.find('[class*="badge"], [class*="tag"], .badge, .tag').first()
  if (badgeEl.length) {
    result.badgeIcon = badgeEl.find('i, svg').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fas fa-star'
    result.badgeText = badgeEl.text().trim() || 'Why Choose Us'
  } else {
    result.badgeIcon = 'fas fa-star'
    result.badgeText = 'Why Choose Us'
  }
  // Title
  const titleEl = $el.find('h2, h3, .section-title, .title').first()
  result.title = titleEl.text().trim() || 'Why Businesses Trust Us'
  // Title highlight
  const highlightEl = $el.find('h2 span, h2 strong, h2 em, h2 [style*="color"], .highlight, .text-primary').first()
  result.titleHighlight = highlightEl.text().trim() || 'Trust Us'
  // Items
  const items: Array<{ icon: string; label: string; description: string }> = []
  $el.find('[class*="item"], [class*="feature"], [class*="reason"], .why-item, .reason-item, .feature-item').each((_, el) => {
    const $item = $(el)
    const icon = $item.find('i, svg').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fas fa-award'
    const label = $item.find('h3, h4, .label, .title, .name').first().text().trim() || 'Award-Winning Team'
    const description = $item.find('p, .description, .desc').first().text().trim() || 'Recognized for excellence in design and development across multiple industry awards.'
    items.push({ icon, label, description })
  })
  result.items = items.length > 0 ? items : [
    { icon: 'fas fa-award', label: 'Award-Winning Team', description: 'Recognized for excellence in design and development across multiple industry awards.' },
    { icon: 'fas fa-shield-alt', label: 'Secure & Reliable', description: 'Enterprise-grade security measures to protect your data and ensure 99.9% uptime.' },
    { icon: 'fas fa-clock', label: 'On-Time Delivery', description: 'We respect deadlines and deliver projects on schedule without compromising quality.' },
  ]
  // Stats
  const stats: Array<{ icon: string; number: string; label: string }> = []
  $el.find('[class*="stat"], [class*="counter"], .stat-item, .counter-item').each((_, el) => {
    const $item = $(el)
    const icon = $item.find('i, svg').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fas fa-project-diagram'
    const number = $item.find('[class*="value"], [class*="number"], .stat-value, .counter-value').text().trim() || '250+'
    const label = $item.find('[class*="label"], [class*="text"], .stat-label, .counter-label').text().trim() || 'Projects Completed'
    stats.push({ icon, number, label })
  })
  result.stats = stats.length > 0 ? stats : [
    { icon: 'fas fa-project-diagram', number: '250+', label: 'Projects Completed' },
    { icon: 'fas fa-trophy', number: '15+', label: 'Awards Won' },
    { icon: 'fas fa-globe', number: '30+', label: 'Countries Served' },
    { icon: 'fas fa-heart', number: '98%', label: 'Happy Clients' },
  ]
  // Validate with Zod
  const parsed = WhyUsSchema.safeParse(result)
  if (parsed.success) {
    return parsed.data
  } else {
    console.warn('WhyUs validation failed, using defaults:', parsed.error.flatten().fieldErrors)
    return WhyUsSchema.parse({})
  }
}
export default mapWhyUsSection