import type { Block } from 'payload'

export const SpecialsBlock: Block = {
  slug: 'specials',
  labels: { singular: 'Special Offer', plural: 'Special Offers' },
  fields: [
    { name: 'badgeIcon', type: 'text', admin: { description: 'Font Awesome icon e.g. fas fa-tags' } },
    { name: 'badgeText', type: 'text' },
    { name: 'title', type: 'text', required: true },
    { name: 'titleHighlight', type: 'text', admin: { description: 'Word(s) to highlight in title' } },
    { name: 'description', type: 'textarea' },
    {
      name: 'offers',
      type: 'array',
      label: 'Special Offers',
      minRows: 1,
      maxRows: 6,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
        { name: 'discountPercent', type: 'number', required: true, min: 1, max: 100, admin: { description: 'Discount percentage' } },
        { name: 'counterTarget', type: 'number', required: true, admin: { description: 'Number for animated counter' } },
        { name: 'label', type: 'text', defaultValue: 'off', admin: { description: 'Label next to counter (off, save, etc.)' } },
      ],
    },
  ],
}
