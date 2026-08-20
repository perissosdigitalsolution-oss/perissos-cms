import type { Block } from 'payload'

export const MenuHighlightsBlock: Block = {
  slug: 'menuHighlights',
  labels: { singular: 'Menu Highlights', plural: 'Menu Highlights' },
  fields: [
    { name: 'badgeIcon', type: 'text', admin: { description: 'Font Awesome icon e.g. fas fa-star' } },
    { name: 'badgeText', type: 'text' },
    { name: 'title', type: 'text', required: true },
    { name: 'titleHighlight', type: 'text', admin: { description: 'Word(s) to highlight in title' } },
    { name: 'description', type: 'textarea' },
    {
      name: 'items',
      type: 'array',
      label: 'Featured Dishes',
      minRows: 1,
      maxRows: 12,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'text', required: true, admin: { description: 'e.g. $24' } },
        { name: 'image', type: 'text', admin: { description: 'Image URL' } },
      ],
    },
    { name: 'buttonText', type: 'text', defaultValue: 'View Full Menu' },
    { name: 'buttonIcon', type: 'text', defaultValue: 'fas fa-arrow-right' },
    { name: 'buttonUrl', type: 'text', defaultValue: '#menu' },
  ],
}
