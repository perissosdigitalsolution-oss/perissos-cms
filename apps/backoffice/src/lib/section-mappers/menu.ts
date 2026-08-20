import { getSectionSchema } from '@perissos/shared/registry/sections'
import * as cheerio from 'cheerio'
const MenuSchema = getSectionSchema('menu')
export function mapMenuSection($: cheerio.CheerioAPI, $el: cheerio.Cheerio<any>): Record<string, any> {
  const result: Record<string, any> = {}
  // Badge
  const badgeEl = $el.find('[class*="badge"], [class*="tag"], .badge, .tag').first()
  if (badgeEl.length) {
    result.badgeIcon = badgeEl.find('i, svg').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fas fa-utensils'
    result.badgeText = badgeEl.text().trim() || 'Our Menu'
  } else {
    result.badgeIcon = 'fas fa-utensils'
    result.badgeText = 'Our Menu'
  }
  // Title
  const titleEl = $el.find('h2, h3, .section-title, .title').first()
  result.title = titleEl.text().trim() || 'Crafted Flavors, Thoughtfully Served'
  // Title highlight
  const highlightEl = $el.find('h2 span, h2 strong, h2 em, h2 [style*="color"], .highlight, .text-primary').first()
  result.titleHighlight = highlightEl.text().trim() || 'Flavors'
  // Description
  const descEl = $el.find('p, .section-description, .description, .lead').first()
  result.description = descEl.text().trim() || 'Explore our carefully curated menu featuring the finest ingredients and seasonal creations.'
  // Categories
  const categories: Array<{ name: string; items: Array<{ name: string; description?: string; price: string; image?: string; dietaryTags?: string[]; isRecommended?: boolean }> }> = []
  $el.find('[class*="category"], [class*="section"], .menu-category, .category').each((_, el) => {
    const $cat = $(el)
    const name = $cat.find('h3, h4, .category-name, .title').first().text().trim() || 'Appetizers'
    const items: Array<{ name: string; description?: string; price: string; image?: string; dietaryTags?: string[]; isRecommended?: boolean }> = []
    $cat.find('[class*="item"], [class*="dish"], .menu-item, .dish-item').each((_, el) => {
      const $item = $(el)
      const itemName = $item.find('.name, .title, h4, h5').first().text().trim() || 'Truffle Mushroom Soup'
      const description = $item.find('.description, .desc, p').first().text().trim() || 'Creamy wild mushroom soup infused with white truffle oil.'
      const price = $item.find('.price, .amount, [class*="price"]').first().text().trim() || '$12'
      const image = $item.find('img').attr('src') || $item.find('img').attr('data-src') || ''
      const dietaryTags: string[] = []
$item.find('[class*="dietary"], [class*="tag"], .dietary, .tag').each(function(_, el) {
        const tag = $(el).text().trim()
        if (tag) dietaryTags.push(tag)
      });
      const isRecommended = $item.hasClass('recommended') || $item.find('.recommended, .featured').length > 0
      items.push({ name: itemName, description, price, image: image || undefined, dietaryTags: dietaryTags.length > 0 ? dietaryTags : undefined, isRecommended })
    });
    if (items.length > 0) categories.push({ name, items })
  })
  result.categories = categories.length > 0 ? categories : [
    { name: 'Appetizers', items: [
      { name: 'Truffle Mushroom Soup', description: 'Creamy wild mushroom soup infused with white truffle oil.', price: '$12', isRecommended: true },
      { name: 'Crispy Calamari', description: 'Lightly fried with marinara sauce.', price: '$14' },
      { name: 'Burrata & Heirloom Tomatoes', description: 'Fresh burrata with seasonal tomatoes.', price: '$16' },
    ]},
    { name: 'Main Courses', items: [
      { name: 'Herb-Crusted Ribeye Steak', description: 'Prime cut with garlic herb butter.', price: '$38' },
      { name: 'Lemon Butter Grilled Salmon', description: 'Fresh Atlantic salmon fillet.', price: '$29' },
      { name: 'Truffle Mushroom Risotto', description: 'Creamy arborio rice with wild mushrooms.', price: '$24' },
    ]},
    { name: 'Desserts & Beverages', items: [
      { name: 'Classic Tiramisu', description: 'Traditional Italian dessert.', price: '$11' },
      { name: 'Molten Chocolate Lava Cake', description: 'Warm chocolate center with vanilla ice cream.', price: '$13' },
      { name: 'Specialty Artisan Coffee', description: 'Single-origin pour over.', price: '$6' },
    ]},
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
  const parsed = MenuSchema.safeParse(result)
  if (parsed.success) {
    return parsed.data
  } else {
    console.warn('Menu validation failed, using defaults:', parsed.error.flatten().fieldErrors)
    return MenuSchema.parse({})
  }
}
export default mapMenuSection