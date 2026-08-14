import type { Block } from 'payload'

export const ServicesBlock: Block = {
  slug: 'services',
  labels: { singular: 'Services', plural: 'Services' },
  fields: [
    { name: 'badgeIcon', type: 'text' },
    { name: 'badgeText', type: 'text' },
    { name: 'title', type: 'text', required: true },
    { name: 'titleHighlight', type: 'text' },
    { name: 'description', type: 'textarea' },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      maxRows: 12,
      fields: [
        { name: 'icon', type: 'text', admin: { description: 'Font Awesome icon e.g. fas fa-code' } },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
        { name: 'linkText', type: 'text', defaultValue: 'Learn More' },
        { name: 'linkIcon', type: 'text', defaultValue: 'fas fa-arrow-right' },
        { name: 'linkUrl', type: 'text', defaultValue: '#' },
      ],
    },
  ],
}
