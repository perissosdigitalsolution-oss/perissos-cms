import { getSectionSchema } from '@perissos/shared/registry/sections'
import * as cheerio from 'cheerio'
const ServicesSchema = getSectionSchema('services')
export function mapServicesSection($: cheerio.CheerioAPI, $el: cheerio.Cheerio<any>): Record<string, any> {
  const result: Record<string, any> = {}
  // Badge
  const badgeEl = $el.find('[class*="badge"], [class*="tag"], .badge, .tag').first()
  if (badgeEl.length) {
    result.badgeIcon = badgeEl.find('i, svg').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fas fa-cog'
    result.badgeText = badgeEl.text().trim() || 'Our Services'
  } else {
    result.badgeIcon = 'fas fa-cog'
    result.badgeText = 'Our Services'
  }
  // Title
  const titleEl = $el.find('h2, h3, .section-title, .title').first()
  result.title = titleEl.text().trim() || 'Solutions That Drive Digital Growth'
  // Title highlight
  const highlightEl = $el.find('h2 span, h2 strong, h2 em, h2 [style*="color"], .highlight, .text-primary').first()
  result.titleHighlight = highlightEl.text().trim() || 'Digital'
  // Description
  const descEl = $el.find('p, .section-description, .description, .lead').first()
  result.description = descEl.text().trim() || 'We offer a comprehensive suite of digital services designed to elevate your business in the digital landscape.'
  // Service items
  const items: Array<{ icon: string; title: string; description: string; linkText?: string; linkIcon?: string; linkUrl?: string }> = []
  $el.find('[class*="service"], [class*="item"], .service-item, .service-card, .feature-item, .feature-card').each((_, el) => {
    const $item = $(el)
    const icon = $item.find('i, svg').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fas fa-code'
    const title = $item.find('h3, h4, .title, .name').first().text().trim() || 'Web Development'
    const description = $item.find('p, .description, .desc').first().text().trim() || 'Custom web solutions built with modern technologies. From responsive websites to complex web applications.'
    const linkText = $item.find('a, .link').first().text().trim() || 'Learn More'
    const linkIcon = $item.find('a i, .link i').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fas fa-arrow-right'
    const linkUrl = $item.find('a').first().attr('href') || '#'
    items.push({ icon, title, description, linkText, linkIcon, linkUrl })
  })
  result.items = items.length > 0 ? items : [
    { icon: 'fas fa-code', title: 'Web Development', description: 'Custom web solutions built with modern technologies. From responsive websites to complex web applications.', linkText: 'Learn More', linkIcon: 'fas fa-arrow-right', linkUrl: '#' },
    { icon: 'fas fa-mobile-alt', title: 'Mobile Apps', description: 'Native and cross-platform mobile applications that deliver exceptional user experiences on iOS and Android.', linkText: 'Learn More', linkIcon: 'fas fa-arrow-right', linkUrl: '#' },
    { icon: 'fas fa-paint-brush', title: 'UI/UX Design', description: 'User-centered design that transforms complex ideas into intuitive and beautiful digital experiences.', linkText: 'Learn More', linkIcon: 'fas fa-arrow-right', linkUrl: '#' },
    { icon: 'fas fa-bullhorn', title: 'Digital Marketing', description: 'Data-driven marketing strategies that increase visibility, engagement, and conversions for your brand.', linkText: 'Learn More', linkIcon: 'fas fa-arrow-right', linkUrl: '#' },
    { icon: 'fas fa-brain', title: 'AI Solutions', description: 'Intelligent automation and AI-powered solutions that revolutionize how your business operates.', linkText: 'Learn More', linkIcon: 'fas fa-arrow-right', linkUrl: '#' },
    { icon: 'fas fa-cloud', title: 'Cloud Services', description: 'Scalable cloud infrastructure and migration services to optimize performance and reduce costs.', linkText: 'Learn More', linkIcon: 'fas fa-arrow-right', linkUrl: '#' },
  ]
  // Validate with Zod
  const parsed = ServicesSchema.safeParse(result)
  if (parsed.success) {
    return parsed.data
  } else {
    console.warn('Services validation failed, using defaults:', parsed.error.flatten().fieldErrors)
    return ServicesSchema.parse({})
  }
}
export default mapServicesSection