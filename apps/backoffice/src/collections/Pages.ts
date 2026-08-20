import type { CollectionConfig } from 'payload'
import {
  HeroBlock,
  ServicesBlock,
  AboutBlock,
  WhyUsBlock,
  TeamBlock,
  PortfolioBlock,
  BlogBlock,
  PricingBlock,
  CTABlock,
  ContactBlock,
  MenuBlock,
  MenuHighlightsBlock,
  ReservationBlock,
  GalleryBlock,
  TestimonialsBlock,
  SpecialsBlock,
} from '../blocks'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'template', 'publishedAt', 'updatedAt'],
  },
  fields: [
    {
      name: 'title',
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
      name: 'template',
      type: 'relationship',
      relationTo: 'templates',
      admin: { position: 'sidebar', description: 'Link this page to a template' },
    },
    {
      name: 'sections',
      type: 'blocks',
      blocks: [
        HeroBlock,
        ServicesBlock,
        AboutBlock,
        WhyUsBlock,
        TeamBlock,
        PortfolioBlock,
        BlogBlock,
        PricingBlock,
        CTABlock,
        ContactBlock,
        MenuBlock,
        MenuHighlightsBlock,
        ReservationBlock,
        GalleryBlock,
        TestimonialsBlock,
        SpecialsBlock,
      ],
    },
    {
      name: 'renderedHtml',
      type: 'textarea',
      admin: {
        description: 'Full rendered HTML from template ZIP (inlined CSS). If present, frontend renders this directly.',
        rows: 10,
      },
      maxLength: 200000,
    },
    {
      name: 'theme',
      type: 'json',
      admin: {
        description: 'Global theme customization (colors, fonts, spacing)',
      },
    },
    {
      name: 'projectData',
      type: 'json',
      admin: {
        description: 'GrapeJS visual editor project data (JSON). Used by the Page Builder for drag-and-drop editing.',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'editor',
    update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'editor',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        if (operation === 'create' && !data.publishedAt) {
          data.publishedAt = new Date()
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation }) => {
        if (process.env.CLOUDFLARE_REBUILD_WEBHOOK) {
          await fetch(process.env.CLOUDFLARE_REBUILD_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              collection: 'pages',
              operation,
              slug: doc.slug,
            }),
          }).catch(() => {})
        }
      },
    ],
  },
}
