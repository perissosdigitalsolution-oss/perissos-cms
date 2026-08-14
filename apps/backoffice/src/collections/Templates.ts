import type { CollectionConfig } from 'payload'

export const Templates: CollectionConfig = {
  slug: 'templates',
  admin: {
    useAsTitle: 'name',
    group: 'Settings',
    components: {
      views: {
        list: {
          Component: '/src/templates/TemplateList#TemplateList',
        },
      },
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        readOnly: true,
        description: 'Extracted from manifest.json in ZIP',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        readOnly: true,
        description: 'Extracted from manifest.json in ZIP',
      },
    },
    {
      name: 'previewImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        readOnly: true,
        description: 'Extracted from preview.jpg in ZIP',
      },
    },
    {
      name: 'layoutConfig',
      type: 'json',
      required: true,
      admin: {
        readOnly: true,
        description: 'Auto-generated from HTML structure',
      },
    },
    {
      name: 'zipFile',
      type: 'upload',
      relationTo: 'media',
      admin: {
        readOnly: true,
        description: 'Original ZIP file (for re-import)',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Only one template can be active per installation',
      },
    },
    {
      name: 'version',
      type: 'text',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'category',
      type: 'text',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        // When setting a template as active, deactivate all others
        if (operation === 'update' && data.isActive) {
          // This will be handled by the afterChange hook
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        // Deactivate all other templates when one is activated
        if (operation === 'update' && doc.isActive) {
          const { payload } = req
          const allTemplates = await payload.find({
            collection: 'templates',
            pagination: false,
          })

          for (const template of allTemplates.docs) {
            if (template.id !== doc.id && template.isActive) {
              await payload.update({
                collection: 'templates',
                id: template.id,
                data: { isActive: false },
              })
            }
          }
        }
        return doc
      },
    ],
  },
}