import { getSectionSchema } from '@perissos/shared/registry/sections'
import * as cheerio from 'cheerio'
const MenuHighlightsSchema = getSectionSchema('menuHighlights')
export function mapMenuHighlightsSection($: cheerio.CheerioAPI, $el: cheerio.Cheerio<any>): Record<string, any> {
  const result: Record<string, any> = {}
  // Badge
  const badgeEl = $el.find('[class*="badge"], [class*="tag"], .badge, .tag').first()
  if (badgeEl.length) {
    result.badgeIcon = badgeEl.find('i, svg').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fas fa-star'
    result.badgeText = badgeEl.text().trim() || 'Menu Highlights'
  } else {
    result.badgeIcon = 'fas fa-star'
    result.badgeText = 'Menu Highlights'
  }
  // Title
  const titleEl = $el.find('h2, h3, .section-title, .title').first()
  result.title = titleEl.text().trim() || 'Discover Our Signature Creations'
  // Title highlight
  const highlightEl = $el.find('h2 span, h2 strong, h2 em, h2 [style*="color"], .highlight, .text-primary').first()
  result.titleHighlight = highlightEl.text().trim() || 'Signature'
  // Description
  const descEl = $el.find('p, .section-description, .description, .lead').first()
  result.description = descEl.text().trim() || 'Our chef\'s most celebrated dishes, crafted with passion and the finest seasonal ingredients.'
  // Items
  const items: Array<{ name: string; description?: string; price: string; image?: string }> = []
  $el.find('[class*="item"], [class*="dish"], [class*="highlight"], .menu-item, .dish-item, .highlight-item').each((_, el) => {
    const $item = $(el)
    const name = $item.find('h3, h4, .name, .title').first().text().trim() || 'Truffle Mushroom Risotto'
    const description = $item.find('.description, .desc, p').first().text().trim() || 'Creamy arborio rice with wild mushrooms, truffle oil, and parmesan.'
    const price = $item.find('.price, .amount, [class*="price"]').first().text().trim() || '$24'
    const image = $item.find('img').attr('src') || $item.find('img').attr('data-src') || ''
    items.push({ name, description, price, image: image || undefined })
  })
  result.items = items.length > 0 ? items : [
    { name: 'Truffle Mushroom Risotto', description: 'Creamy arborio rice with wild mushrooms, truffle oil, and parmesan.', price: '$24' },
    { name: 'Herb-Crusted Rack of Lamb', description: 'Tender lamb with herb crust, served with roasted vegetables.', price: '$34' },
    { name: 'Pan-Seared Atlantic Salmon', description: 'Fresh salmon fillet with lemon butter sauce and seasonal greens.', price: '$29' },
    { name: 'Classic Eggs Benedict', description: 'Poached eggs on English muffin with hollandaise and bacon.', price: '$16' },
    { name: 'Artisan Margherita Pizza', description: 'Hand-tossed dough with San Marzano tomatoes and fresh mozzarella.', price: '$18' },
    { name: 'Grilled Ribeye Steak', description: 'Prime cut grilled to perfection with garlic herb butter.', price: '$38' },
  ]
  // Button
  const btnEl = $el.find('a.btn, a.button, .btn, .button, a').first()
  if (btnEl.length) {
    result.buttonText = btnEl.text().trim() || 'View Full Menu'
    result.buttonIcon = btnEl.find('i, svg').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fas fa-arrow-right'
    result.buttonUrl = btnEl.attr('href') || '#menu'
  } else {
    result.buttonText = 'View Full Menu'
    result.buttonIcon = 'fas fa-arrow-right'
    result.buttonUrl = '#menu'
  }
  // Validate with Zod
  const parsed = MenuHighlightsSchema.safeParse(result)
  if (parsed.success) {
    return parsed.data
  } else {
    console.warn('MenuHighlights validation failed, using defaults:', parsed.error.flatten().fieldErrors)
    return MenuHighlightsSchema.parse({})
  }
}
export default mapMenuHighlightsSection