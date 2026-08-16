import type { Block } from 'payload'

export const WhyUsBlock: Block = {
  slug: 'whyUs',
  labels: { singular: 'Why Us', plural: 'Why Us' },
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
      maxRows: 6,
      fields: [
        { name: 'icon', type: 'text', admin: { description: 'Font Awesome icon' } },
        { name: 'image', type: 'text', admin: { description: 'Image URL (optional, replaces icon)' } },
        { name: 'label', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
      ],
    },
    {
      name: 'stats',
      type: 'array',
      maxRows: 6,
      fields: [
        { name: 'icon', type: 'text' },
        { name: 'image', type: 'text', admin: { description: 'Image URL (optional, replaces icon)' } },
        { name: 'number', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
      ],
    },
  ],
}
