import { getSectionSchema } from '@perissos/shared/registry/sections'
import * as cheerio from 'cheerio'
const ReservationSchema = getSectionSchema('reservation')
export function mapReservationSection($: cheerio.CheerioAPI, $el: cheerio.Cheerio<any>): Record<string, any> {
  const result: Record<string, any> = {}
  // Badge
  const badgeEl = $el.find('[class*="badge"], [class*="tag"], .badge, .tag').first()
  if (badgeEl.length) {
    result.badgeIcon = badgeEl.find('i, svg').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fas fa-calendar-check'
    result.badgeText = badgeEl.text().trim() || 'Reservations'
  } else {
    result.badgeIcon = 'fas fa-calendar-check'
    result.badgeText = 'Reservations'
  }
  // Title
  const titleEl = $el.find('h2, h3, .section-title, .title').first()
  result.title = titleEl.text().trim() || 'Book Your Table in Seconds'
  // Title highlight
  const highlightEl = $el.find('h2 span, h2 strong, h2 em, h2 [style*="color"], .highlight, .text-primary').first()
  result.titleHighlight = highlightEl.text().trim() || 'Table'
  // Description
  const descEl = $el.find('p, .section-description, .description, .lead').first()
  result.description = descEl.text().trim() || 'Reserve your dining experience with us. Instant confirmation, no booking fees.'
  // Benefits
  const benefits: Array<{ icon: string; text: string }> = []
  $el.find('[class*="benefit"], [class*="feature"], [class*="perk"], .benefit-item, .feature-item').each((_, el) => {
    const $item = $(el)
    const icon = $item.find('i, svg').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fas fa-check-circle'
    const text = $item.text().trim() || 'Instant Confirmation'
    benefits.push({ icon, text })
  })
  result.benefits = benefits.length > 0 ? benefits : [
    { icon: 'fas fa-check-circle', text: 'Instant Confirmation' },
    { icon: 'fas fa-check-circle', text: 'No Booking Fees' },
    { icon: 'fas fa-check-circle', text: 'Free Cancellation Within 24 Hours' },
  ]
  // Submit button
  const btnEl = $el.find('button[type="submit"], input[type="submit"], .submit-btn, .btn-submit').first()
  if (btnEl.length) {
    result.submitButtonText = btnEl.text().trim() || 'Confirm Reservation'
    result.submitButtonIcon = btnEl.find('i, svg').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fas fa-check'
  } else {
    result.submitButtonText = 'Confirm Reservation'
    result.submitButtonIcon = 'fas fa-check'
  }
  // Validate with Zod
  const parsed = ReservationSchema.safeParse(result)
  if (parsed.success) {
    return parsed.data
  } else {
    console.warn('Reservation validation failed, using defaults:', parsed.error.flatten().fieldErrors)
    return ReservationSchema.parse({})
  }
}
export default mapReservationSection