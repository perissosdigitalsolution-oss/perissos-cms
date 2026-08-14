import type { Block } from 'payload'

export const CTABlock: Block = {
  slug: 'cta',
  labels: { singular: 'CTA', plural: 'CTAs' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'buttonText', type: 'text', defaultValue: 'Start a Project' },
    { name: 'buttonIcon', type: 'text', defaultValue: 'fas fa-arrow-right' },
    { name: 'buttonUrl', type: 'text', defaultValue: '#contact' },
  ],
}
