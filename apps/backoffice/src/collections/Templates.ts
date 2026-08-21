import type { CollectionConfig } from 'payload'
import { getSectionDefaultProps, type SectionCategoryType } from '@perissos/shared/registry/sections'

async function replaceHomePageTemplate(template: any, payload: any) {
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

    const homePage = existingHome.docs[0]

    // Build update data — ALWAYS overwrites existing content
    const updateData: any = {
      title: 'Home',
      slug: 'home',
      template: template.id,
      theme: layoutConfig.theme || {},
      projectData: null,
      renderedHtml: null,  // Clear old template's rendered HTML
    }

    // Path B: Store structured sections from layoutConfig
    if (sectionContents.length > 0) {
      updateData.sections = sectionContents.map((s: any, i: number) => ({
        ...s,
        _order: i,
      }))
    } else {
      // Generate sections with proper defaults from the shared section registry
      updateData.sections = (layoutConfig.sections || []).map((sectionType: string, i: number) => {
        const defaults = getSectionDefaultProps(sectionType as SectionCategoryType)
        return {
          _order: i,
          _path: `root.${i}`,
          blockType: sectionType,
          blockName: `${sectionType}-${i + 1}`,
          ...defaults,
        }
      })
    }

    if (homePage) {
      // FORCE update — replace all content on the home page
      await payload.update({
        collection: 'pages',
        id: homePage.id,
        data: updateData,
        bypassValidation: true,
      })
      console.log(`[replaceHomePageTemplate] Replaced home page content with template "${template.name}"`)
    } else {
      // Create new home page
      await payload.create({
        collection: 'pages',
        data: {
          ...updateData,
          publishedAt: new Date().toISOString(),
        },
      })
      console.log(`[replaceHomePageTemplate] Created home page with template "${template.name}"`)
    }
  } catch (error) {
    console.error('[replaceHomePageTemplate] Failed:', error)
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

          // Force-replace home page content with the activated template
          await replaceHomePageTemplate(doc, payload)
        }
        return doc
      },
    ],
  },
}