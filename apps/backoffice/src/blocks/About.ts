import type { Block } from 'payload'

export const AboutBlock: Block = {
  slug: 'about',
  labels: { singular: 'About', plural: 'About' },
  fields: [
    { name: 'badgeIcon', type: 'text' },
    { name: 'badgeText', type: 'text' },
    { name: 'title', type: 'text', required: true },
    { name: 'titleHighlight', type: 'text' },
    { name: 'description', type: 'textarea' },
    { name: 'experienceNumber', type: 'text' },
    { name: 'experienceLabel', type: 'text' },
    {
      name: 'features',
      type: 'array',
      maxRows: 8,
      fields: [
        { name: 'icon', type: 'text', defaultValue: 'fas fa-check' },
        { name: 'text', type: 'text', required: true },
      ],
    },
    { name: 'buttonText', type: 'text', defaultValue: 'Learn More' },
    { name: 'buttonIcon', type: 'text', defaultValue: 'fas fa-arrow-right' },
    { name: 'buttonUrl', type: 'text', defaultValue: '#contact' },
  ],
}
