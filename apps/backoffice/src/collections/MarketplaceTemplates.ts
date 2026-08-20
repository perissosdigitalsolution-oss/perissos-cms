import type { CollectionConfig } from 'payload'

export const MarketplaceTemplates: CollectionConfig = {
  slug: 'marketplace-templates',
  admin: {
    useAsTitle: 'name',
    group: 'Settings',
    defaultColumns: ['name', 'category', 'version', 'isPremium', 'verified', 'downloads'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'previewImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Agency', value: 'agency' },
        { label: 'Portfolio', value: 'portfolio' },
        { label: 'SaaS', value: 'saas' },
        { label: 'Restaurant', value: 'restaurant' },
        { label: 'Blog', value: 'blog' },
        { label: 'E-commerce', value: 'ecommerce' },
        { label: 'Other', value: 'other' },
      ],
      required: true,
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
    {
      name: 'isPremium',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'requiredPlan',
      type: 'select',
      options: [
        { label: 'Free', value: 'free' },
        { label: 'Pro', value: 'pro' },
        { label: 'Enterprise', value: 'enterprise' },
      ],
      defaultValue: 'free',
      admin: {
        condition: (_, { isPremium }) => isPremium,
        position: 'sidebar',
      },
    },
    {
      name: 'price',
      type: 'number',
      admin: {
        condition: (_, { isPremium }) => isPremium,
        position: 'sidebar',
      },
    },
    {
      name: 'version',
      type: 'text',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'changelog',
      type: 'textarea',
      admin: {
        description: 'Markdown changelog for this version',
      },
    },
    {
      name: 'versions',
      type: 'array',
      fields: [
        {
          name: 'version',
          type: 'text',
          required: true,
        },
        {
          name: 'changelog',
          type: 'textarea',
        },
        {
          name: 'zipFile',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'layoutConfig',
          type: 'json',
        },
        {
          name: 'publishedAt',
          type: 'date',
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
      ],
      admin: {
        description: 'Version history for rollback',
      },
    },
    {
      name: 'zipFile',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Current version ZIP',
      },
    },
    {
      name: 'layoutConfig',
      type: 'json',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'sectionDependencies',
      type: 'array',
      fields: [
        {
          name: 'sectionKey',
          type: 'text',
        },
      ],
      admin: {
        description: 'Section registry keys used by this template',
      },
    },
    {
      name: 'minPayloadVersion',
      type: 'text',
      defaultValue: '3.0.0',
    },
    {
      name: 'author',
      type: 'text',
    },
    {
      name: 'authorUrl',
      type: 'text',
    },
    {
      name: 'demoUrl',
      type: 'text',
    },
    {
      name: 'documentationUrl',
      type: 'text',
    },
    {
      name: 'verified',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'downloads',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'rating',
      type: 'number',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create' && data.name && !data.slug) {
          data.slug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation === 'update' && doc.versions) {
          // Increment downloads counter on install (tracked via install endpoint)
        }
      },
    ],
  },
}