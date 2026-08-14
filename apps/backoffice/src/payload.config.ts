import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'

// Collections
import { Pages } from './collections/Pages'
import { BlogArticles } from './collections/BlogArticles'
import { Activities } from './collections/Activities'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Subscriptions } from './collections/Subscriptions'
import { Templates } from './collections/Templates'

// Globals
import { ClientSettings } from './globals/ClientSettings'

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: ' — Perissos CMS',
      description: 'Perissos CMS Back Office',
    },
  },

  editor: lexicalEditor({}),

  collections: [Pages, BlogArticles, Activities, Users, Media, Subscriptions, Templates],
  globals: [ClientSettings],

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
    },
    push: false,
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
  ],

  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },

  secret: process.env.PAYLOAD_SECRET || '',

  serverURL: process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3000',

  cors: [
    'http://localhost:3001',
    'http://localhost:3000',
  ],

  csrf: [
    'http://localhost:3001',
    'http://localhost:3000',
  ],
})
