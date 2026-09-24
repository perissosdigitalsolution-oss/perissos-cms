import { withPayload } from '@payloadcms/next/withPayload'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  reactStrictMode: true,
  transpilePackages: ['@payloadcms/next', '@payloadcms/richtext-lexical', '@payloadcms/plugin-multi-tenant', '@shadowmkj/plugin-ecommerce', '@consilioweb/payload-support', '@karixi/payload-ai'],
  // Top-level resolve — preserved by withPayload
  resolve: {
    alias: {
      '@payload-config': path.resolve(__dirname, 'src/payload.config.ts'),
      '@perissos/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@perissos/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@/collections': path.resolve(__dirname, 'src/collections'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
      '@payloadcms/plugin-multi-tenant': path.resolve(__dirname, './node_modules/@payloadcms/plugin-multi-tenant'),
      '@shadowmkj/plugin-ecommerce': path.resolve(__dirname, './node_modules/@shadowmkj/plugin-ecommerce'),
      '@shadowmkj/plugin-ecommerce/payments/stripe': path.resolve(__dirname, './node_modules/@shadowmkj/plugin-ecommerce/dist/exports/payments/stripe.js'),
      '@consilioweb/payload-support': path.resolve(__dirname, './node_modules/@consilioweb/payload-support'),
      '@karixi/payload-ai': path.resolve(__dirname, './node_modules/@karixi/payload-ai'),
      'entities/decode': path.resolve(__dirname, './node_modules/entities/lib/decode.js'),
      'entities/escape': path.resolve(__dirname, './node_modules/entities/lib/escape.js'),
    },
    modules: [
      path.resolve(__dirname, './node_modules'),
      path.resolve(__dirname, '../../node_modules'),
      path.resolve(__dirname, './src'),
      'node_modules',
    ],
    symlinks: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    optimizePackageImports: ['@payloadcms/next', '@payloadcms/richtext-lexical'],
  },
  webpack: (config) => {
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
