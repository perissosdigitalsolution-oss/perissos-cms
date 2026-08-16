import type { Block } from 'payload'

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Heroes' },
  fields: [
    { name: 'badgeIcon', type: 'text', admin: { description: 'Font Awesome icon e.g. fas fa-bolt' } },
    { name: 'badgeText', type: 'text' },
    { name: 'title', type: 'text', required: true },
    { name: 'titleHighlight', type: 'text', admin: { description: 'Word(s) to highlight in title' } },
    { name: 'description', type: 'textarea' },
    { name: 'primaryButtonText', type: 'text', defaultValue: 'Start a Project' },
    { name: 'primaryButtonIcon', type: 'text', defaultValue: 'fas fa-arrow-right' },
    { name: 'primaryButtonUrl', type: 'text', defaultValue: '#contact' },
    { name: 'secondaryButtonText', type: 'text', defaultValue: 'View Our Work' },
    { name: 'secondaryButtonIcon', type: 'text', defaultValue: 'fas fa-play' },
    { name: 'secondaryButtonUrl', type: 'text', defaultValue: '#portfolio' },
    { name: 'mainImage', type: 'text', admin: { description: 'Main image URL (replaces laptop icon)' } },
    {
      name: 'stats',
      type: 'array',
      maxRows: 4,
      fields: [
        { name: 'value', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
        { name: 'icon', type: 'text', admin: { description: 'Font Awesome icon (optional)' } },
        { name: 'image', type: 'text', admin: { description: 'Image URL (optional, replaces icon)' } },
      ],
    },
    {
      name: 'floatingCards',
      type: 'array',
      maxRows: 4,
      fields: [
        { name: 'icon', type: 'text', admin: { description: 'Font Awesome icon' } },
        { name: 'image', type: 'text', admin: { description: 'Image URL (optional, replaces icon)' } },
        { name: 'label', type: 'text', required: true },
        { name: 'value', type: 'text', required: true },
      ],
    },
  ],
}
