import { getSectionSchema } from '@perissos/shared/registry/sections'
import * as cheerio from 'cheerio'
const TeamSchema = getSectionSchema('team')
export function mapTeamSection($: cheerio.CheerioAPI, $el: cheerio.Cheerio<any>): Record<string, any> {
  const result: Record<string, any> = {}
  // Badge
  const badgeEl = $el.find('[class*="badge"], [class*="tag"], .badge, .tag').first()
  if (badgeEl.length) {
    result.badgeIcon = badgeEl.find('i, svg').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fas fa-users'
    result.badgeText = badgeEl.text().trim() || 'Our Team'
  } else {
    result.badgeIcon = 'fas fa-users'
    result.badgeText = 'Our Team'
  }
  // Title
  const titleEl = $el.find('h2, h3, .section-title, .title').first()
  result.title = titleEl.text().trim() || 'Meet the Experts'
  // Title highlight
  const highlightEl = $el.find('h2 span, h2 strong, h2 em, h2 [style*="color"], .highlight, .text-primary').first()
  result.titleHighlight = highlightEl.text().trim() || 'Experts'
  // Description
  const descEl = $el.find('p, .section-description, .description, .lead').first()
  result.description = descEl.text().trim() || 'Our talented team of professionals is dedicated to delivering exceptional results for every project.'
  // Members
  const members: Array<{ name: string; role: string; avatarIcon: string; social: Array<{ icon: string; url: string }> }> = []
  $el.find('[class*="member"], [class*="team"], .team-member, .member-card, .member-item').each((_, el) => {
    const $item = $(el)
    const name = $item.find('h3, h4, .name, .title').first().text().trim() || 'Alex Johnson'
    const role = $item.find('.role, .position, .title').first().text().trim() || 'CEO & Founder'
    const avatarIcon = $item.find('img').attr('alt') || $item.find('i, svg').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fas fa-user'
    const social: Array<{ icon: string; url: string }> = []
    $item.find('.social a, .social-link, [class*="social"]').each((_, el) => {
      const $link = $(el)
      const icon = $link.find('i, svg').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fab fa-linkedin-in'
      const url = $link.attr('href') || '#'
      social.push({ icon, url })
    })
    members.push({ name, role, avatarIcon, social: social.length > 0 ? social : [{ icon: 'fab fa-linkedin-in', url: '#' }, { icon: 'fab fa-twitter', url: '#' }, { icon: 'fab fa-dribbble', url: '#' }] })
  })
  result.members = members.length > 0 ? members : [
    { name: 'Alex Johnson', role: 'CEO & Founder', avatarIcon: 'fas fa-user', social: [{ icon: 'fab fa-linkedin-in', url: '#' }, { icon: 'fab fa-twitter', url: '#' }, { icon: 'fab fa-dribbble', url: '#' }] },
    { name: 'Sarah Williams', role: 'Creative Director', avatarIcon: 'fas fa-user', social: [{ icon: 'fab fa-linkedin-in', url: '#' }, { icon: 'fab fa-twitter', url: '#' }, { icon: 'fab fa-dribbble', url: '#' }] },
    { name: 'Michael Chen', role: 'Lead Developer', avatarIcon: 'fas fa-user', social: [{ icon: 'fab fa-linkedin-in', url: '#' }, { icon: 'fab fa-twitter', url: '#' }, { icon: 'fab fa-dribbble', url: '#' }] },
    { name: 'Emily Brown', role: 'Marketing Manager', avatarIcon: 'fas fa-user', social: [{ icon: 'fab fa-linkedin-in', url: '#' }, { icon: 'fab fa-twitter', url: '#' }, { icon: 'fab fa-dribbble', url: '#' }] },
  ]
  // Validate with Zod
  const parsed = TeamSchema.safeParse(result)
  if (parsed.success) {
    return parsed.data
  } else {
    console.warn('Team validation failed, using defaults:', parsed.error.flatten().fieldErrors)
    return TeamSchema.parse({})
  }
}
export default mapTeamSection