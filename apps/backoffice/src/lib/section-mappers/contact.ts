import { getSectionSchema } from '@perissos/shared/registry/sections'
import * as cheerio from 'cheerio'
const ContactSchema = getSectionSchema('contact')
export function mapContactSection($: cheerio.CheerioAPI, $el: cheerio.Cheerio<any>): Record<string, any> {
  const result: Record<string, any> = {}
  // Title
  const titleEl = $el.find('h2, h3, .section-title, .title').first()
  result.title = titleEl.text().trim() || 'Get In Touch'
  // Title highlight
  const highlightEl = $el.find('h2 span, h2 strong, h2 em, h2 [style*="color"], .highlight, .text-primary').first()
  result.titleHighlight = highlightEl.text().trim() || 'Touch'
  // Description
  const descEl = $el.find('p, .section-description, .description, .lead').first()
  result.description = descEl.text().trim() || 'Have a project in mind? We would love to hear from you. Send us a message and we will respond as soon as possible.'
  // Contact items
  const contactItems: Array<{ icon: string; label: string; value: string }> = []
  $el.find('[class*="contact"], [class*="info"], .contact-item, .info-item, .contact-info').each((_, el) => {
    const $item = $(el)
    const icon = $item.find('i, svg').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fas fa-map-marker-alt'
    const label = $item.find('.label, .title, h4, h5').first().text().trim() || 'Visit Us'
    const value = $item.find('.value, .content, p, span').last().text().trim() || '123 Digital Street, Tech City, TC 12345'
    contactItems.push({ icon, label, value })
  })
  result.contactItems = contactItems.length > 0 ? contactItems : [
    { icon: 'fas fa-map-marker-alt', label: 'Visit Us', value: '123 Digital Street, Tech City, TC 12345' },
    { icon: 'fas fa-envelope', label: 'Email Us', value: 'hello@digitalagency.com' },
    { icon: 'fas fa-phone', label: 'Call Us', value: '+1 (555) 123-4567' },
  ]
  // Socials
  const socials: Array<{ icon: string; url: string }> = []
  $el.find('.social a, .social-link, [class*="social"]').each((_, el) => {
    const $link = $(el)
    const icon = $link.find('i, svg').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fab fa-facebook-f'
    const url = $link.attr('href') || '#'
    socials.push({ icon, url })
  })
  result.socials = socials.length > 0 ? socials : [
    { icon: 'fab fa-facebook-f', url: '#' },
    { icon: 'fab fa-twitter', url: '#' },
    { icon: 'fab fa-instagram', url: '#' },
    { icon: 'fab fa-linkedin-in', url: '#' },
  ]
  // Form fields
  const formFields: Array<{ type: 'text' | 'email' | 'textarea' | 'select'; name: string; label: string; placeholder?: string; required?: boolean; options?: Array<{ value: string; label: string }> }> = []
  $el.find('form input, form textarea, form select').each((_, el) => {
    const $field = $(el)
    const type = $field.attr('type') || ($field.is('textarea') ? 'textarea' : ($field.is('select') ? 'select' : 'text'))
    const name = $field.attr('name') || $field.attr('id') || 'field'
    const label = $field.prev('label').text().trim() || $field.attr('placeholder') || name
    const placeholder = $field.attr('placeholder') || ''
    const required = Boolean($field.prop('required') || $field.attr('required') === 'required')
    const options: Array<{ value: string; label: string }> = []
    if ($field.is('select')) {
      $field.find('option').each((_, opt) => {
        options.push({ value: $(opt).attr('value') || $(opt).text(), label: $(opt).text() })
      })
    }
    formFields.push({ type: type as 'text' | 'email' | 'textarea' | 'select', name, label, placeholder, required, options: options.length > 0 ? options : undefined })
  })
  result.formFields = formFields.length > 0 ? formFields : [
    { type: 'text', name: 'name', label: 'Your Name', placeholder: 'John', required: true },
    { type: 'email', name: 'email', label: 'Email Address', placeholder: 'john@example.com', required: true },
    { type: 'text', name: 'subject', label: 'Subject', placeholder: 'Project Inquiry', required: true },
    { type: 'textarea', name: 'message', label: 'Message', placeholder: 'Tell us about your project...', required: true },
  ]
  // Submit button
  const submitBtn = $el.find('button[type="submit"], input[type="submit"], .submit-btn').first()
  if (submitBtn.length) {
    result.submitButtonText = submitBtn.text().trim() || 'Send Message'
    result.submitButtonIcon = submitBtn.find('i, svg').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fas fa-paper-plane'
  } else {
    result.submitButtonText = 'Send Message'
    result.submitButtonIcon = 'fas fa-paper-plane'
  }
  // Validate with Zod
  const parsed = ContactSchema.safeParse(result)
  if (parsed.success) {
    return parsed.data
  } else {
    console.warn('Contact validation failed, using defaults:', parsed.error.flatten().fieldErrors)
    return ContactSchema.parse({})
  }
}
export default mapContactSection