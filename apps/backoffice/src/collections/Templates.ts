import type { CollectionConfig } from 'payload'

async function generatePagesFromTemplate(template: any, payload: any) {
  try {
    const layoutConfig = template.layoutConfig
    if (!layoutConfig) return

    const sectionContents = (layoutConfig.sectionContents || []).filter((s: any) => 
      !['footer', 'header'].includes(s.type)
    )

    const existingHome = await payload.find({
      collection: 'pages',
      where: { slug: { equals: 'home' } },
      limit: 1,
      depth: 1,
    })

    const homeExists = existingHome.docs.length > 0
    const existingSections = homeExists && (existingHome.docs[0].sections || []).length > 0
    console.log('[generatePagesFromTemplate] homeExists:', homeExists, 'existingSections:', existingSections, 'sectionContents:', sectionContents.length, 'homeId:', homeExists ? existingHome.docs[0].id : null)

    // Only generate/overwrite sections when we have full sectionContents from a ZIP import
    if (sectionContents.length === 0 || existingSections) {
      // No full section data OR home page already has sections -> just link the template
      if (homeExists) {
        const result = await payload.update({
          collection: 'pages',
          id: existingHome.docs[0].id,
          data: { template: template.id },
          bypassValidation: true,
        })
        console.log('[generatePagesFromTemplate] update result template:', result.template, 'id:', result.id)
      } else {
        // No home page exists; create one with the section names as placeholders
        const fallbackSections = (layoutConfig.sections || []).map((sectionType: string, i: number) => ({
          _order: i,
          _path: `root.${i}`,
          blockType: sectionType,
          blockName: `${sectionType}-${i + 1}`,
          badgeIcon: '',
          badgeText: '',
          title: `${sectionType} Section`,
          titleHighlight: '',
          description: '',
        }))
        await payload.create({
          collection: 'pages',
          data: {
            title: 'Home',
            slug: 'home',
            template: template.id,
            sections: fallbackSections,
            publishedAt: new Date().toISOString(),
          },
        })
      }
      return
    }

    // Full sectionContents available and home page has no sections yet -> populate it
    if (homeExists) {
      await payload.update({
        collection: 'pages',
        id: existingHome.docs[0].id,
        data: {
          template: template.id,
          sections: sectionContents.map((s: any, i: number) => ({
            ...s,
            _order: i,
          })),
        },
        bypassValidation: true,
      })
    } else {
      await payload.create({
        collection: 'pages',
        data: {
          title: 'Home',
          slug: 'home',
          template: template.id,
          sections: sectionContents.map((s: any, i: number) => ({
            ...s,
            _order: i,
          })),
          publishedAt: new Date().toISOString(),
        },
      })
    }
  } catch (error) {
    console.error('Failed to generate pages from template:', error)
  }
}

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
        marketplace: {
          Component: '/src/templates/MarketplaceView#MarketplaceView',
          path: '/marketplace',
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
    {
      name: 'marketplaceTemplateId',
      type: 'relationship',
      relationTo: 'marketplace-templates',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'installedVersion',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'availableVersions',
      type: 'array',
      fields: [
        {
          name: 'version',
          type: 'text',
        },
        {
          name: 'changelog',
          type: 'textarea',
        },
        {
          name: 'zipFile',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'layoutConfig',
          type: 'json',
        },
      ],
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'versionHistory',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '/src/templates/VersionHistoryPanel#VersionHistoryPanel',
        },
      },
    },
  ],
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'editor',
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

          // Generate pages from the activated template
          await generatePagesFromTemplate(doc, payload)
        }
        return doc
      },
    ],
  },
}