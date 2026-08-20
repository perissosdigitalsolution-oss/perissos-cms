import { getSectionSchema } from '@perissos/shared/registry/sections'
import * as cheerio from 'cheerio'
const TestimonialsSchema = getSectionSchema('testimonials')
export function mapTestimonialsSection($: cheerio.CheerioAPI, $el: cheerio.Cheerio<any>): Record<string, any> {
  const result: Record<string, any> = {}
  // Badge
  const badgeEl = $el.find('[class*="badge"], [class*="tag"], .badge, .tag').first()
  if (badgeEl.length) {
    result.badgeIcon = badgeEl.find('i, svg').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fas fa-quote-left'
    result.badgeText = badgeEl.text().trim() || 'Testimonials'
  } else {
    result.badgeIcon = 'fas fa-quote-left'
    result.badgeText = 'Testimonials'
  }
  // Title
  const titleEl = $el.find('h2, h3, .section-title, .title').first()
  result.title = titleEl.text().trim() || '"Absolutely wonderful dining experience"'
  // Title highlight
  const highlightEl = $el.find('h2 span, h2 strong, h2 em, h2 [style*="color"], .highlight, .text-primary').first()
  result.titleHighlight = highlightEl.text().trim() || 'wonderful'
  // Description
  const descEl = $el.find('p, .section-description, .description, .lead').first()
  result.description = descEl.text().trim() || "Don't just take our word for it — hear from our guests."
  // Testimonials
  const testimonials: Array<{ name: string; role: string; avatar?: string; rating: number; text: string }> = []
  $el.find('[class*="testimonial"], [class*="review"], .testimonial-item, .review-item, .testimonial-card').each((_, el) => {
    const $item = $(el)
    const name = $item.find('.name, .author, h4, h5').first().text().trim() || 'Eleanor Pena'
    const role = $item.find('.role, .position, .title').first().text().trim() || 'Verified Diner'
    const avatar = $item.find('img').attr('src') || $item.find('img').attr('data-src') || ''
    const rating = parseInt($item.find('[class*="rating"], [class*="star"], .rating').attr('data-rating') || '') || $item.find('[class*="rating"], [class*="star"], .rating').length || 5
    const text = $item.find('p, .text, .content, .quote').first().text().trim() || 'Everything was perfect. Our server remembered our special night.'
    testimonials.push({ name, role, avatar: avatar || undefined, rating: rating || 5, text })
  })
  result.testimonials = testimonials.length > 0 ? testimonials : [
    { name: 'Eleanor Pena', role: 'Verified Diner', rating: 5, text: 'My husband and I recently celebrated our tenth anniversary here. Everything was perfect. Our server remembered our special night.' },
    { name: 'Darrell Steward', role: 'Regular Guest', rating: 5, text: 'I go every Sunday for brunch and am never disappointed. The eggs benedict are the best.' },
    { name: 'Guy Hawkins', role: 'Corporate Client', rating: 5, text: 'Our company\'s quarterly celebration was flawless. The event coordinator made a customized menu.' },
  ]
  // Socials
  const socials: Array<{ icon: string; url: string }> = []
  $el.find('.social a, .social-link, [class*="social"]').each((_, el) => {
    const $link = $(el)
    const icon = $link.find('i, svg').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fab fa-instagram'
    const url = $link.attr('href') || '#'
    socials.push({ icon, url })
  })
  result.socials = socials.length > 0 ? socials : [
    { icon: 'fab fa-instagram', url: '#' },
    { icon: 'fab fa-linkedin-in', url: '#' },
    { icon: 'fab fa-facebook-f', url: '#' },
    { icon: 'fab fa-youtube', url: '#' },
  ]
  // Validate with Zod
  const parsed = TestimonialsSchema.safeParse(result)
  if (parsed.success) {
    return parsed.data
  } else {
    console.warn('Testimonials validation failed, using defaults:', parsed.error.flatten().fieldErrors)
    return TestimonialsSchema.parse({})
  }
}
export default mapTestimonialsSection