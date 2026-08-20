import type { Block } from 'payload'

export const TestimonialsBlock: Block = {
  slug: 'testimonials',
  labels: { singular: 'Testimonial', plural: 'Testimonials' },
  fields: [
    { name: 'badgeIcon', type: 'text', admin: { description: 'Font Awesome icon e.g. fas fa-quote-left' } },
    { name: 'badgeText', type: 'text' },
    { name: 'title', type: 'text', required: true, admin: { description: 'Headline quote or section title' } },
    { name: 'titleHighlight', type: 'text', admin: { description: 'Word(s) to highlight in title' } },
    { name: 'description', type: 'textarea' },
    {
      name: 'testimonials',
      type: 'array',
      label: 'Customer Reviews',
      minRows: 1,
      maxRows: 12,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'role', type: 'text', admin: { description: 'e.g. Verified Diner, Regular Guest' } },
        { name: 'avatar', type: 'text', admin: { description: 'Avatar image URL' } },
        { name: 'rating', type: 'number', required: true, min: 1, max: 5, defaultValue: 5 },
        { name: 'text', type: 'textarea', required: true },
      ],
    },
    {
      name: 'socials',
      type: 'array',
      label: 'Social Links',
      fields: [
        { name: 'icon', type: 'text', admin: { description: 'Font Awesome icon e.g. fab fa-instagram' } },
        { name: 'url', type: 'text', defaultValue: '#' },
      ],
    },
  ],
}
