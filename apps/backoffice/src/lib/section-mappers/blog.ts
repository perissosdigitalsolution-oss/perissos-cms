import { getSectionSchema } from '@perissos/shared/registry/sections'
import * as cheerio from 'cheerio'
const BlogSchema = getSectionSchema('blog')
export function mapBlogSection($: cheerio.CheerioAPI, $el: cheerio.Cheerio<any>): Record<string, any> {
  const result: Record<string, any> = {}
  // Badge
  const badgeEl = $el.find('[class*="badge"], [class*="tag"], .badge, .tag').first()
  if (badgeEl.length) {
    result.badgeIcon = badgeEl.find('i, svg').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fas fa-pen-nib'
    result.badgeText = badgeEl.text().trim() || 'Blog'
  } else {
    result.badgeIcon = 'fas fa-pen-nib'
    result.badgeText = 'Blog'
  }
  // Title
  const titleEl = $el.find('h2, h3, .section-title, .title').first()
  result.title = titleEl.text().trim() || 'Latest Insights'
  // Title highlight
  const highlightEl = $el.find('h2 span, h2 strong, h2 em, h2 [style*="color"], .highlight, .text-primary').first()
  result.titleHighlight = highlightEl.text().trim() || 'Insights'
  // Description
  const descEl = $el.find('p, .section-description, .description, .lead').first()
  result.description = descEl.text().trim() || 'Stay updated with the latest trends and insights in digital technology.'
  // Posts
  const posts: Array<{ icon: string; tag: string; title: string; author?: string; readTime?: string; date?: string }> = []
  $el.find('[class*="post"], [class*="article"], .blog-post, .post-item, .article-item').each((_, el) => {
    const $item = $(el)
    const icon = $item.find('i, svg').attr('class')?.split(' ').find(c => c.startsWith('fa')) || 'fas fa-robot'
    const tag = $item.find('.tag, .category, .tag').first().text().trim() || 'AI Technology'
    const title = $item.find('h3, h4, .title, .title a').first().text().trim() || 'The Future of AI in Digital Transformation'
    const author = $item.find('.author, .by').first().text().trim() || 'Admin'
    const readTime = $item.find('.read-time, .time').first().text().trim() || '5 Min Read'
    const date = $item.find('.date, .published, time').first().text().trim() || 'Jan 15, 2025'
    posts.push({ icon, tag, title, author, readTime, date })
  })
  result.posts = posts.length > 0 ? posts : [
    { icon: 'fas fa-robot', tag: 'AI Technology', title: 'The Future of AI in Digital Transformation', author: 'Admin', readTime: '5 Min Read', date: 'Jan 15, 2025' },
    { icon: 'fas fa-chart-bar', tag: 'Marketing', title: '10 Digital Marketing Strategies for 2025', author: 'Admin', readTime: '7 Min Read', date: 'Jan 10, 2025' },
    { icon: 'fas fa-laptop-code', tag: 'Development', title: 'Modern Web Development Best Practices', author: 'Admin', readTime: '6 Min Read', date: 'Jan 05, 2025' },
  ]
  // Validate with Zod
  const parsed = BlogSchema.safeParse(result)
  if (parsed.success) {
    return parsed.data
  } else {
    console.warn('Blog validation failed, using defaults:', parsed.error.flatten().fieldErrors)
    return BlogSchema.parse({})
  }
}
export default mapBlogSection