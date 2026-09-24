import { withPayload } from '@payloadcms/next/withPayload'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  reactStrictMode: true,
  transpilePackages: ['@payloadcms/next', '@payloadcms/richtext-lexical', '@payloadcms/plugin-multi-tenant', '@shadowmkj/plugin-ecommerce', '@consilioweb/payload-support', '@karixi/payload-ai'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    optimizePackageImports: ['@payloadcms/next', '@payloadcms/richtext-lexical'],
  },
  webpack: (config, options) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@payload-config': path.resolve(__dirname, 'src/payload.config.ts'),
      '@perissos/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@perissos/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
      '@shadowmkj/plugin-ecommerce/payments/stripe': path.resolve(__dirname, './node_modules/@shadowmkj/plugin-ecommerce/dist/exports/payments/stripe.js'),
      '@payloadcms/plugin-multi-tenant': path.resolve(__dirname, './node_modules/@payloadcms/plugin-multi-tenant'),
      '@consilioweb/payload-support': path.resolve(__dirname, './node_modules/@consilioweb/payload-support'),
      '@karixi/payload-ai': path.resolve(__dirname, './node_modules/@karixi/payload-ai'),
      'entities/decode': path.resolve(__dirname, './node_modules/entities/lib/decode.js'),
      'entities/escape': path.resolve(__dirname, './node_modules/entities/lib/escape.js'),
    }
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      path.resolve(__dirname, './node_modules'),
      path.resolve(__dirname, '../../node_modules'),
      path.resolve(__dirname, './src'),
    ]
    config.resolve.symlinks = true
    return config
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.perissos.dev' },
      { protocol: 'https', hostname: '*.r2.dev' },
    ],
  },
}

export default withPayload(nextConfig)
