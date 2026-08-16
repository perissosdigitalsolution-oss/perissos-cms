import type { Block } from 'payload'

export const PricingBlock: Block = {
  slug: 'pricing',
  labels: { singular: 'Pricing', plural: 'Pricing' },
  fields: [
    { name: 'badgeIcon', type: 'text' },
    { name: 'badgeText', type: 'text' },
    { name: 'title', type: 'text', required: true },
    { name: 'titleHighlight', type: 'text' },
    { name: 'description', type: 'textarea' },
    {
      name: 'plans',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'text', required: true },
        { name: 'period', type: 'text' },
        { name: 'image', type: 'text', admin: { description: 'Plan image URL (optional)' } },
        {
          name: 'features',
          type: 'array',
          maxRows: 20,
          fields: [
            { name: 'icon', type: 'text', defaultValue: 'fas fa-check' },
            { name: 'image', type: 'text', admin: { description: 'Image URL (optional, replaces icon)' } },
            { name: 'text', type: 'text', required: true },
          ],
        },
        { name: 'buttonText', type: 'text', defaultValue: 'Get Started' },
        { name: 'buttonUrl', type: 'text', defaultValue: '#contact' },
        { name: 'buttonStyle', type: 'text', defaultValue: 'outline', admin: { description: 'outline or primary' } },
        { name: 'featured', type: 'checkbox', defaultValue: false },
        { name: 'featuredBadge', type: 'text', defaultValue: 'Most Popular' },
      ],
    },
  ],
}
