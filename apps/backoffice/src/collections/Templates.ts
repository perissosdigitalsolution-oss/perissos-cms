import type { CollectionConfig } from 'payload'
import { getSectionDefaultProps, type SectionCategoryType } from '@perissos/shared/registry/sections'

function stripIds(obj: any): any {
  if (Array.isArray(obj)) return obj.map(stripIds)
  if (obj && typeof obj === 'object') {
    const clean: any = {}
    for (const [key, val] of Object.entries(obj)) {
      if (key === 'id' || key === '_id') continue // skip embedded IDs
      clean[key] = stripIds(val)
    }
    return clean
  }
  return obj
}

// Flatten sectionContents {type, props} → Payload block format {blockType, ...props}
function flattenSection(s: any, index: number): any {
  const blockType = s.blockType || s.type
  const props = s.props || {}
  const result: any = { blockType, _order: index, _path: `root.${index}` }
  for (const [key, val] of Object.entries(props)) {
    if (key === 'id' || key === '_id') continue
    result[key] = val
  }
  return result
}

async function replaceHomePageTemplate(template: any, payload: any) {
  try {
    const layoutConfig = template.layoutConfig

    const existingHome = await payload.find({
      collection: 'pages',
      where: { slug: { equals: 'home' } },
      limit: 1,
    })

    const homePage = existingHome.docs[0]
    if (!homePage) return

    // Delete all existing block rows from every block table
    const blockTables = [
      'pages_blocks_hero','pages_blocks_services','pages_blocks_about',
      'pages_blocks_why_us','pages_blocks_team','pages_blocks_portfolio',
      'pages_blocks_blog','pages_blocks_pricing','pages_blocks_cta',
      'pages_blocks_contact','pages_blocks_menu','pages_blocks_menu_highlights',
      'pages_blocks_reservation','pages_blocks_gallery','pages_blocks_testimonials',
      'pages_blocks_specials'
    ]
    for (const table of blockTables) {
      try {
        await payload.db.execute(`DELETE FROM "${table}" WHERE _parent_id = ${homePage.id}`)
      } catch { /* table might not exist or be empty */ }
    }

    // Get renderedHtml from template
    const renderedHtml = template.renderedHtml || null

    // Update page with template data and renderedHtml
    await payload.update({
      collection: 'pages',
      id: homePage.id,
      data: {
        title: 'Home',
        slug: 'home',
        template: template.id,
        theme: layoutConfig?.theme || {},
        projectData: null,
        renderedHtml,
      },
      bypassValidation: true,
    })

    console.log(`[replaceHomePageTemplate] Replaced home page content with template "${template.name}"`)
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
      name: 'renderedHtml',
      type: 'textarea',
      admin: {
        readOnly: true,
        description: 'Self-contained HTML with inlined CSS/JS from ZIP',
      },
      maxLength: 500000,
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
          // Run non-blocking to avoid timeout on the PATCH response
          replaceHomePageTemplate(doc, payload).catch(err => {
            console.error('[Templates] replaceHomePageTemplate failed:', err)
          })
        }
        return doc
      },
    ],
  },
}