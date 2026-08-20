import { getSectionSchema } from '@perissos/shared/registry/sections'
import * as cheerio from 'cheerio'
const SpecialsSchema = getSectionSchema('specials')
export function mapSpecialsSection($: cheerio.CheerioAPI, $el: cheerio.Cheerio<any>): Record<string, any> {
  const result: Record<string, any> = {}
  // Badge
  const badgeEl = $el.find('[class*="badge"], [class*="tag"], .badge, .tag').first()
  if (badgeEl.length) {
    result.badgeIcon = badgeEl.find('i, svg').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fas fa-tags'
    result.badgeText = badgeEl.text().trim() || 'Special Offers'
  } else {
    result.badgeIcon = 'fas fa-tags'
    result.badgeText = 'Special Offers'
  }
  // Title
  const titleEl = $el.find('h2, h3, .section-title, .title').first()
  result.title = titleEl.text().trim() || 'Exclusive Offers Just for You'
  // Title highlight
  const highlightEl = $el.find('h2 span, h2 strong, h2 em, h2 [style*="color"], .highlight, .text-primary').first()
  result.titleHighlight = highlightEl.text().trim() || 'Exclusive'
  // Description
  const descEl = $el.find('p, .section-description, .description, .lead').first()
  result.description = descEl.text().trim() || 'Take advantage of our limited-time promotions and special deals.'
  // Offers
  const offers: Array<{ title: string; description: string; discountPercent: number; counterTarget: number; label?: string }> = []
  $el.find('[class*="offer"], [class*="special"], [class*="deal"], .offer-item, .special-item, .deal-item').each((_, el) => {
    const $item = $(el)
    const title = $item.find('h3, h4, .title, .name').first().text().trim() || 'Early Bird Dinner'
    const description = $item.find('.description, .desc, p').first().text().trim() || 'Enjoy a special discount when you dine with us before 6 PM on weekdays.'
    const discountPercent = parseInt($item.find('[class*="discount"], [class*="percent"], .discount, .percent').attr('data-value') || '') || parseInt($item.find('[class*="discount"], [class*="percent"], .discount, .percent').text().match(/\d+/)?.[0] || '') || 20
    const counterTarget = parseInt($item.find('[class*="counter"], [class*="target"], .counter').attr('data-value') || '') || parseInt($item.find('[class*="counter"], [class*="target"], .counter').text().match(/\d+/)?.[0] || '') || discountPercent
    const label = $item.find('[class*="label"], [class*="unit"], .label, .unit').text().trim() || 'off'
    offers.push({ title, description, discountPercent, counterTarget, label })
  })
  result.offers = offers.length > 0 ? offers : [
    { title: 'Early Bird Dinner', description: 'Enjoy a special discount when you dine with us before 6 PM on weekdays.', discountPercent: 20, counterTarget: 20, label: 'off' },
    { title: 'Happy Hour Special', description: 'Half-price select appetizers and cocktails every weekday from 4 to 6 PM.', discountPercent: 50, counterTarget: 50, label: 'off' },
    { title: 'Loyalty Members Save', description: 'Sign up for our loyalty program and receive exclusive member-only discounts.', discountPercent: 15, counterTarget: 15, label: 'save' },
  ]
  // Validate with Zod
  const parsed = SpecialsSchema.safeParse(result)
  if (parsed.success) {
    return parsed.data
  } else {
    console.warn('Specials validation failed, using defaults:', parsed.error.flatten().fieldErrors)
    return SpecialsSchema.parse({})
  }
}
export default mapSpecialsSection