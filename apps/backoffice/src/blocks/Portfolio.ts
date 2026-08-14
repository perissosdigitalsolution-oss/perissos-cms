import type { Block } from 'payload'

export const PortfolioBlock: Block = {
  slug: 'portfolio',
  labels: { singular: 'Portfolio', plural: 'Portfolio' },
  fields: [
    { name: 'badgeIcon', type: 'text' },
    { name: 'badgeText', type: 'text' },
    { name: 'title', type: 'text', required: true },
    { name: 'titleHighlight', type: 'text' },
    { name: 'description', type: 'textarea' },
    {
      name: 'filters',
      type: 'array',
      maxRows: 10,
      fields: [{ name: 'label', type: 'text', required: true }],
    },
    {
      name: 'projects',
      type: 'array',
      minRows: 1,
      maxRows: 12,
      fields: [
        { name: 'icon', type: 'text', admin: { description: 'Font Awesome icon' } },
        { name: 'category', type: 'text' },
        { name: 'title', type: 'text', required: true },
        { name: 'linkText', type: 'text', defaultValue: 'View Project' },
        { name: 'linkIcon', type: 'text', defaultValue: 'fas fa-arrow-right' },
        { name: 'linkUrl', type: 'text', defaultValue: '#' },
      ],
    },
  ],
}
