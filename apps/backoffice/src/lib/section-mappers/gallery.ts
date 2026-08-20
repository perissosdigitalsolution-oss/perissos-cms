import { getSectionSchema } from '@perissos/shared/registry/sections'
import * as cheerio from 'cheerio'
const GallerySchema = getSectionSchema('gallery')
export function mapGallerySection($: cheerio.CheerioAPI, $el: cheerio.Cheerio<any>): Record<string, any> {
  const result: Record<string, any> = {}
  // Badge
  const badgeEl = $el.find('[class*="badge"], [class*="tag"], .badge, .tag').first()
  if (badgeEl.length) {
    result.badgeIcon = badgeEl.find('i, svg').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fas fa-camera'
    result.badgeText = badgeEl.text().trim() || 'Gallery'
  } else {
    result.badgeIcon = 'fas fa-camera'
    result.badgeText = 'Gallery'
  }
  // Title
  const titleEl = $el.find('h2, h3, .section-title, .title').first()
  result.title = titleEl.text().trim() || 'Moments Worth Capturing'
  // Title highlight
  const highlightEl = $el.find('h2 span, h2 strong, h2 em, h2 [style*="color"], .highlight, .text-primary').first()
  result.titleHighlight = highlightEl.text().trim() || 'Moments'
  // Description
  const descEl = $el.find('p, .section-description, .description, .lead').first()
  result.description = descEl.text().trim() || 'A glimpse into our kitchen, dining room, and the experiences we create every day.'
  // Images
  const images: Array<{ url: string; caption?: string; alt?: string }> = []
  $el.find('img').each((_, el) => {
    const $img = $(el)
    const url = $img.attr('src') || $img.attr('data-src') || ''
    if (url) {
      const caption = $img.attr('alt') || $img.attr('title') || $img.parent().find('figcaption, .caption').text().trim() || ''
      const alt = $img.attr('alt') || ''
      images.push({ url, caption: caption || undefined, alt: alt || undefined })
    }
  })
  result.images = images.length > 0 ? images : [
    { url: '', caption: 'Plated Dish Artistry', alt: 'Chef plating a dish' },
    { url: '', caption: 'Dining Room & Patio', alt: 'Elegant dining area' },
    { url: '', caption: 'Kitchen Action Shots', alt: 'Chef in the kitchen' },
    { url: '', caption: 'Guest Celebration', alt: 'Guests enjoying their meal' },
  ]
  // Validate with Zod
  const parsed = GallerySchema.safeParse(result)
  if (parsed.success) {
    return parsed.data
  } else {
    console.warn('Gallery validation failed, using defaults:', parsed.error.flatten().fieldErrors)
    return GallerySchema.parse({})
  }
}
export default mapGallerySection