import { getSectionSchema } from '@perissos/shared/registry/sections'
import * as cheerio from 'cheerio'
const AboutSchema = getSectionSchema('about')
export function mapAboutSection($: cheerio.CheerioAPI, $el: cheerio.Cheerio<any>): Record<string, any> {
  const result: Record<string, any> = {}
  // Badge
  const badgeEl = $el.find('[class*="badge"], [class*="tag"], .badge, .tag').first()
  if (badgeEl.length) {
    result.badgeIcon = badgeEl.find('i, svg').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fas fa-info-circle'
    result.badgeText = badgeEl.text().trim() || 'About Us'
  } else {
    result.badgeIcon = 'fas fa-info-circle'
    result.badgeText = 'About Us'
  }
  // Title
  const titleEl = $el.find('h2, h3, .section-title, .title').first()
  result.title = titleEl.text().trim() || "We're a Team of Digital Experts"
  // Title highlight
  const highlightEl = $el.find('h2 span, h2 strong, h2 em, h2 [style*="color"], .highlight, .text-primary').first()
  result.titleHighlight = highlightEl.text().trim() || 'Digital'
  // Description
  const descEl = $el.find('p, .section-description, .description, .lead').first()
  result.description = descEl.text().trim() || 'Since 2012, we have been helping businesses of all sizes transform their digital presence. Our team combines creativity with technical expertise to deliver solutions that truly make a difference.'
  // Experience number and label
  const expEl = $el.find('[class*="experience"], [class*="years"], .experience, .years').first()
  const expText = expEl.text().trim()
  const expMatch = expText.match(/(\d+)\+?/)
  result.experienceNumber = expMatch ? expMatch[1] : '12+'
  result.experienceLabel = expText.replace(/\d+\+?/, '').trim() || 'Years Experience'
  // Features
  const features: Array<{ icon: string; text: string }> = []
  $el.find('[class*="feature"], [class*="check"], .feature-item, .check-item, li').each((_, el) => {
    const $item = $(el)
    const icon = $item.find('i, svg').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fas fa-check'
    const text = $item.text().trim().replace(/^\s*[\u2713\u2714✓✔]\s*/, '')
    if (text) features.push({ icon, text })
  })
  result.features = features.length > 0 ? features : [
    { icon: 'fas fa-check', text: 'Custom Development' },
    { icon: 'fas fa-check', text: '24/7 Support' },
    { icon: 'fas fa-check', text: 'Agile Methodology' },
    { icon: 'fas fa-check', text: 'ROI Focused' },
  ]
  // Button
  const btnEl = $el.find('a.btn, a.button, .btn, .button').first()
  if (btnEl.length) {
    result.buttonText = btnEl.text().trim() || 'Learn More'
    result.buttonIcon = btnEl.find('i, svg').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fas fa-arrow-right'
    result.buttonUrl = btnEl.attr('href') || '#contact'
  } else {
    result.buttonText = 'Learn More'
    result.buttonIcon = 'fas fa-arrow-right'
    result.buttonUrl = '#contact'
  }
  // Image
  const img = $el.find('img').first()
  if (img.length) {
    const src = img.attr('src') || img.attr('data-src')
    if (src) result.mainImage = src
  }
  // Validate with Zod
  const parsed = AboutSchema.safeParse(result)
  if (parsed.success) {
    return parsed.data
  } else {
    console.warn('About validation failed, using defaults:', parsed.error.flatten().fieldErrors)
    return AboutSchema.parse({})
  }
}
export default mapAboutSection