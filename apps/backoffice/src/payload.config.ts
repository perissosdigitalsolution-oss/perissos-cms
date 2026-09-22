import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { ecommercePlugin, USD, EUR, GBP } from '@shadowmkj/plugin-ecommerce'
import { stripeAdapter } from '@shadowmkj/plugin-ecommerce/payments/stripe'
import { supportPlugin } from '@consilioweb/payload-support'
import { aiPlugin } from '@karixi/payload-ai'
import { siteFormsPlugin } from '@agentmarketing/payload-site-forms'
import { adminNavPlugin } from '@consilioweb/payload-admin-nav'
import { payloadReserve } from 'payload-reserve'

import path from 'path'

// Collections
import { Pages } from './collections/Pages'
import { BlogArticles } from './collections/BlogArticles'
import { Activities } from './collections/Activities'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Subscriptions } from './collections/Subscriptions'
import { Templates } from './collections/Templates'
import { MarketplaceTemplates } from './collections/MarketplaceTemplates'
import { Tenant } from './collections/Tenant'

// Globals
import { ClientSettings } from './globals/ClientSettings'

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: ' — Perissos CMS',
      description: 'Perissos CMS Back Office',
    },
    components: {
      beforeDashboard: ['/src/admin/components/CustomDashboard#CustomDashboard'],
      graphics: {
        Logo: ['/src/admin/components/PerissosLogo#PerissosLogo'],
      },
    },
  },

  editor: lexicalEditor({}),

  collections: [Pages, BlogArticles, Activities, Users, Media, Subscriptions, Templates, MarketplaceTemplates, Tenant],
  globals: [ClientSettings],

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
      max: 50,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 30000,
      keepAlive: true,
      ssl: { rejectUnauthorized: false },
    },
    push: false, // Migrations done via SQL — see AGENTS.md
  }),

  plugins: [
    s3Storage({
      collections: {
        media: {
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename }) => {
            const prefix = process.env.R2_PREFIX || ''
            return `${process.env.R2_PUBLIC_URL}/${prefix}/${filename}`
          },
        },
      },
      bucket: process.env.R2_BUCKET || 'perissos-media',
      clientUploads: true,
      config: {
        endpoint: process.env.R2_ENDPOINT,
        region: 'auto',
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
      },
    }),
    supportPlugin({
      features: { ai: true, sla: true, timeTracking: true, chat: true, webhooks: true },
      ticketNumber: { prefix: 'TK-', padding: 6 },
      basePath: '/support',
      userCollectionSlug: 'users',
      rateLimitStore: 'payload',
    }),
    aiPlugin({
      provider: 'openai',
      apiKeyEnvVar: 'OPENAI_API_KEY',
      features: { adminUI: true },
      collections: {
        pages: { enabled: true },
        'blog-articles': { enabled: true },
      },
    }),
    siteFormsPlugin({
      submissionCollection: 'form-submissions',
      enableEmailNotifications: true,
      emailConfig: {
        from: process.env.SUPPORT_EMAIL || 'noreply@perissos.dev',
        to: process.env.ADMIN_EMAIL || 'admin@perissos.dev',
      },
    }),
    adminNavPlugin({
      groups: ['Support', 'Gestion', 'Settings'],
      defaultGroups: ['Support', 'Gestion'],
      userPreferences: true,
    }),
    payloadReserve({
      userCollection: 'users',
      slugs: {
        resources: 'resources',
        services: 'services',
        schedules: 'schedules',
        reservations: 'reservations',
        holds: 'reservation-holds',
        customers: 'users',
      },
      resourceOwnerMode: {
        adminRoles: ['admin'],
        ownerCollection: 'users',
        roleField: 'role',
      },
      staffProvisioning: {
        staffRoles: ['admin', 'editor'],
        roleField: 'role',
      },
      adminGroup: 'Reservations',
      timezone: 'Europe/Paris',
      paymentProvider: 'stripe',
      stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    }),
    ecommercePlugin({
      products: { variants: false },
      customers: { slug: 'users' },
      access: {
        isAdmin: ({ req }) => (req.user as { role?: string } | null)?.role === 'admin',
        adminOnlyFieldAccess: ({ req }) =>
          (req.user as { role?: string } | null)?.role === 'admin',
        adminOrPublishedStatus: ({ req }) =>
          (req.user as { role?: string } | null)?.role === 'admin'
            ? true
            : { _status: { equals: 'published' } },
        isDocumentOwner: ({ req }) => {
          const user = req.user as { id?: number | string; role?: string } | null
          if (user?.role === 'admin') return true
          if (user) return { customer: { equals: user.id } }
          return false
        },
      },
      currencies: {
        defaultCurrency: 'USD',
        supportedCurrencies: [USD, EUR, GBP],
      },
      payments: {
        paymentMethods: [
          stripeAdapter({
            secretKey: process.env.STRIPE_SECRET_KEY || '',
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
          }),
        ],
      },
    }),
    multiTenantPlugin({
      collections: {
        pages: {},
        'blog-articles': {},
        media: {},
        templates: {},
        'marketplace-templates': {},
        reservations: {},
        resources: {},
        schedules: {},
        services: {},
        products: {},
        carts: {},
        orders: {},
        addresses: {},
        transactions: {},
      },
      userHasAccessToAllTenants: (user) => (user as unknown as { role?: string })?.role === 'admin',
    }),
  ],


  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },

  secret: process.env.PAYLOAD_SECRET || '',

  serverURL: process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3000',

  cors: [
    'https://app.perissos.dev',
    'https://cms.perissos.dev',
    process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3001',
    process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3000',
  ],

  csrf: [
    'https://app.perissos.dev',
    'https://cms.perissos.dev',
    process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3001',
    process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3000',
  ],
})
