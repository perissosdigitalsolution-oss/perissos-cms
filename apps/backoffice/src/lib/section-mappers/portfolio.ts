import { getSectionSchema } from '@perissos/shared/registry/sections'
import * as cheerio from 'cheerio'
const PortfolioSchema = getSectionSchema('portfolio')
export function mapPortfolioSection($: cheerio.CheerioAPI, $el: cheerio.Cheerio<any>): Record<string, any> {
  const result: Record<string, any> = {}
  // Badge
  const badgeEl = $el.find('[class*="badge"], [class*="tag"], .badge, .tag').first()
  if (badgeEl.length) {
    result.badgeIcon = badgeEl.find('i, svg').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fas fa-briefcase'
    result.badgeText = badgeEl.text().trim() || 'Portfolio'
  } else {
    result.badgeIcon = 'fas fa-briefcase'
    result.badgeText = 'Portfolio'
  }
  // Title
  const titleEl = $el.find('h2, h3, .section-title, .title').first()
  result.title = titleEl.text().trim() || 'Our Recent Projects'
  // Title highlight
  const highlightEl = $el.find('h2 span, h2 strong, h2 em, h2 [style*="color"], .highlight, .text-primary').first()
  result.titleHighlight = highlightEl.text().trim() || 'Projects'
  // Description
  const descEl = $el.find('p, .section-description, .description, .lead').first()
  result.description = descEl.text().trim() || 'Explore our latest work showcasing innovative solutions across various industries.'
  // Filters
  const filters: Array<{ label: string }> = []
  $el.find('[class*="filter"], [class*="category"], .filter-btn, .category-btn').each((_, el) => {
    const label = $(el).text().trim()
    if (label) filters.push({ label })
  })
  result.filters = filters.length > 0 ? filters : [{ label: 'All' }, { label: 'Web Design' }, { label: 'Mobile App' }, { label: 'Branding' }, { label: 'Marketing' }]
  // Projects
  const projects: Array<{ icon: string; category: string; title: string; linkText?: string; linkIcon?: string; linkUrl?: string }> = []
  $el.find('[class*="project"], [class*="work"], .project-item, .project-card, .work-item').each((_, el) => {
    const $item = $(el)
    const icon = $item.find('i, svg').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fas fa-shopping-cart'
    const category = $item.find('.category, .tag, .type').first().text().trim() || 'Web Development'
    const title = $item.find('h3, h4, .title, .name').first().text().trim() || 'E-Commerce Platform'
    const linkText = $item.find('a, .link').first().text().trim() || 'View Project'
    const linkIcon = $item.find('a i, .link i').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fas fa-arrow-right'
    const linkUrl = $item.find('a').first().attr('href') || '#'
    projects.push({ icon, category, title, linkText, linkIcon, linkUrl })
  })
  result.projects = projects.length > 0 ? projects : [
    { icon: 'fas fa-shopping-cart', category: 'Web Development', title: 'E-Commerce Platform', linkText: 'View Project', linkIcon: 'fas fa-arrow-right', linkUrl: '#' },
    { icon: 'fas fa-heartbeat', category: 'Mobile App', title: 'Healthcare App', linkText: 'View Project', linkIcon: 'fas fa-arrow-right', linkUrl: '#' },
    { icon: 'fas fa-university', category: 'UI/UX Design', title: 'Banking Dashboard', linkText: 'View Project', linkIcon: 'fas fa-arrow-right', linkUrl: '#' },
    { icon: 'fas fa-plane', category: 'Web Application', title: 'Travel Booking', linkText: 'View Project', linkIcon: 'fas fa-arrow-right', linkUrl: '#' },
    { icon: 'fas fa-utensils', category: 'Branding', title: 'Restaurant Branding', linkText: 'View Project', linkIcon: 'fas fa-arrow-right', linkUrl: '#' },
    { icon: 'fas fa-graduation-cap', category: 'Education', title: 'E-Learning Platform', linkText: 'View Project', linkIcon: 'fas fa-arrow-right', linkUrl: '#' },
  ]
  // Validate with Zod
  const parsed = PortfolioSchema.safeParse(result)
  if (parsed.success) {
    return parsed.data
  } else {
    console.warn('Portfolio validation failed, using defaults:', parsed.error.flatten().fieldErrors)
    return PortfolioSchema.parse({})
  }
}
export default mapPortfolioSection