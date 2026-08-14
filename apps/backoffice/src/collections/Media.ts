import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    mimeTypes: ['image/*', 'application/pdf', 'application/zip'],
  },
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'mimeType', 'filesize', 'updatedAt'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      admin: {
        description: 'Alternative text for accessibility',
      },
    },
    {
      name: 'caption',
      type: 'text',
    },
    {
      name: 'prefix',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'R2 prefix for this client (auto-set)',
      },
    },
  ],
  access: {
    read: () => true,
  },
}
