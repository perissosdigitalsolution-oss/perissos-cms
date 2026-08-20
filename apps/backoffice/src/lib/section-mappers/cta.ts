import { getSectionSchema } from '@perissos/shared/registry/sections'
import * as cheerio from 'cheerio'
const CTASchema = getSectionSchema('cta')
export function mapCTASection($: cheerio.CheerioAPI, $el: cheerio.Cheerio<any>): Record<string, any> {
  const result: Record<string, any> = {}
  // Title
  const titleEl = $el.find('h2, h3, .section-title, .title').first()
  result.title = titleEl.text().trim() || 'Ready to Start Your Next Project?'
  // Description
  const descEl = $el.find('p, .section-description, .description, .lead').first()
  result.description = descEl.text().trim() || "Let's collaborate and create something amazing together. Get in touch with us today and let's bring your vision to life."
  // Button
  const btnEl = $el.find('a.btn, a.button, .btn, .button, a').first()
  if (btnEl.length) {
    result.buttonText = btnEl.text().trim() || 'Start a Project'
    result.buttonIcon = btnEl.find('i, svg').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fas fa-arrow-right'
    result.buttonUrl = btnEl.attr('href') || '#contact'
  } else {
    result.buttonText = 'Start a Project'
    result.buttonIcon = 'fas fa-arrow-right'
    result.buttonUrl = '#contact'
  }
  // Validate with Zod
  const parsed = CTASchema.safeParse(result)
  if (parsed.success) {
    return parsed.data
  } else {
    console.warn('CTA validation failed, using defaults:', parsed.error.flatten().fieldErrors)
    return CTASchema.parse({})
  }
}
export default mapCTASection