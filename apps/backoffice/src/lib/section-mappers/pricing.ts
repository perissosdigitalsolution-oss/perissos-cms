import { getSectionSchema } from '@perissos/shared/registry/sections'
import * as cheerio from 'cheerio'
const PricingSchema = getSectionSchema('pricing')
export function mapPricingSection($: cheerio.CheerioAPI, $el: cheerio.Cheerio<any>): Record<string, any> {
  const result: Record<string, any> = {}
  // Badge
  const badgeEl = $el.find('[class*="badge"], [class*="tag"], .badge, .tag').first()
  if (badgeEl.length) {
    result.badgeIcon = badgeEl.find('i, svg').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fas fa-tag'
    result.badgeText = badgeEl.text().trim() || 'Pricing'
  } else {
    result.badgeIcon = 'fas fa-tag'
    result.badgeText = 'Pricing'
  }
  // Title
  const titleEl = $el.find('h2, h3, .section-title, .title').first()
  result.title = titleEl.text().trim() || 'Flexible Pricing Plans'
  // Title highlight
  const highlightEl = $el.find('h2 span, h2 strong, h2 em, h2 [style*="color"], .highlight, .text-primary').first()
  result.titleHighlight = highlightEl.text().trim() || 'Pricing'
  // Description
  const descEl = $el.find('p, .section-description, .description, .lead').first()
  result.description = descEl.text().trim() || 'Choose the plan that best fits your business needs and budget.'
  // Plans
  const plans: Array<{ name: string; description: string; price: string; period?: string; featured?: boolean; featuredBadge?: string; features: Array<{ icon?: string; text: string }>; buttonText?: string; buttonStyle?: 'primary' | 'outline'; buttonUrl?: string }> = []
  $el.find('[class*="plan"], [class*="pricing"], .plan-card, .pricing-card, .plan-item').each((_, el) => {
    const $item = $(el)
    const name = $item.find('h3, h4, .name, .title').first().text().trim() || 'Starter'
    const description = $item.find('.description, .desc, p').first().text().trim() || 'Perfect for small businesses'
    const price = $item.find('.price, .amount, [class*="price"]').first().text().trim() || '$499'
    const period = $item.find('.period, .duration').first().text().trim() || '/project'
    const featured = $item.hasClass('featured') || $item.hasClass('popular') || $item.find('.featured, .popular').length > 0
    const featuredBadge = $item.find('.badge, .tag, .featured-badge').text().trim() || 'Most Popular'
    const features: Array<{ icon?: string; text: string }> = []
    $item.find('li, .feature, .feature-item').each((_, el) => {
      const text = $(el).text().trim()
      if (text) features.push({ text })
    })
    const buttonText = $item.find('a, button, .btn').first().text().trim() || 'Get Started'
    const buttonStyle = $item.find('a, button, .btn').first().hasClass('primary') ? 'primary' : 'outline'
    const buttonUrl = $item.find('a').first().attr('href') || '#contact'
    plans.push({ name, description, price, period, featured, featuredBadge, features, buttonText, buttonStyle, buttonUrl })
  })
  result.plans = plans.length > 0 ? plans : [
    { name: 'Starter', description: 'Perfect for small businesses', price: '$499', period: '/project', featured: false, features: [{ text: 'Responsive Design' }, { text: '5 Pages Website' }, { text: 'Basic SEO' }, { text: 'Contact Form' }, { text: '1 Month Support' }], buttonText: 'Get Started', buttonStyle: 'outline', buttonUrl: '#contact' },
    { name: 'Professional', description: 'Best for growing businesses', price: '$999', period: '/project', featured: true, featuredBadge: 'Most Popular', features: [{ text: 'Everything in Starter' }, { text: '15 Pages Website' }, { text: 'Advanced SEO' }, { text: 'CMS Integration' }, { text: '3 Months Support' }], buttonText: 'Get Started', buttonStyle: 'primary', buttonUrl: '#contact' },
    { name: 'Enterprise', description: 'For large-scale projects', price: '$2499', period: '/project', featured: false, features: [{ text: 'Everything in Professional' }, { text: 'Unlimited Pages' }, { text: 'Custom Features' }, { text: 'E-Commerce Ready' }, { text: '12 Months Support' }], buttonText: 'Get Started', buttonStyle: 'outline', buttonUrl: '#contact' },
  ]
  // Validate with Zod
  const parsed = PricingSchema.safeParse(result)
  if (parsed.success) {
    return parsed.data
  } else {
    console.warn('Pricing validation failed, using defaults:', parsed.error.flatten().fieldErrors)
    return PricingSchema.parse({})
  }
}
export default mapPricingSection