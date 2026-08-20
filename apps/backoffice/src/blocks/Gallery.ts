import type { Block } from 'payload'

export const GalleryBlock: Block = {
  slug: 'gallery',
  labels: { singular: 'Gallery', plural: 'Galleries' },
  fields: [
    { name: 'badgeIcon', type: 'text', admin: { description: 'Font Awesome icon e.g. fas fa-camera' } },
    { name: 'badgeText', type: 'text' },
    { name: 'title', type: 'text', required: true },
    { name: 'titleHighlight', type: 'text', admin: { description: 'Word(s) to highlight in title' } },
    { name: 'description', type: 'textarea' },
    {
      name: 'images',
      type: 'array',
      label: 'Gallery Images',
      minRows: 1,
      maxRows: 20,
      fields: [
        { name: 'url', type: 'text', required: true, admin: { description: 'Image URL' } },
        { name: 'caption', type: 'text', admin: { description: 'Image caption text' } },
        { name: 'alt', type: 'text', admin: { description: 'Alt text for accessibility' } },
      ],
    },
  ],
}
