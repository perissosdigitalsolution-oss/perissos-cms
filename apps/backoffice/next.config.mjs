import { withPayload } from '@payloadcms/next/withPayload'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  reactStrictMode: true,
  transpilePackages: ['@payloadcms/next', '@payloadcms/richtext-lexical', '@payloadcms/plugin-multi-tenant', '@shadowmkj/plugin-ecommerce', '@shadowmkj/plugin-ecommerce/payments/stripe', '@consilioweb/payload-support', '@karixi/payload-ai'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    optimizePackageImports: ['@payloadcms/next', '@payloadcms/richtext-lexical'],
  },
  webpack: (config) => {
    config.resolve.alias['@payload-config'] = path.resolve(__dirname, 'src/payload.config.ts')
    config.resolve.alias['@perissos/shared'] = path.resolve(__dirname, '../../packages/shared/src')
    config.resolve.alias['@perissos/ui'] = path.resolve(__dirname, '../../packages/ui/src')
    config.resolve.alias['@shadowmkj/plugin-ecommerce'] = path.resolve(__dirname, '../../node_modules/@shadowmkj/plugin-ecommerce')
    config.resolve.alias['@shadowmkj/plugin-ecommerce/payments/stripe'] = path.resolve(__dirname, '../../node_modules/@shadowmkj/plugin-ecommerce/dist/exports/payments/stripe.js')
    config.resolve.alias['@payloadcms/plugin-multi-tenant'] = path.resolve(__dirname, '../../node_modules/@payloadcms/plugin-multi-tenant')
    config.resolve.alias['@consilioweb/payload-support'] = path.resolve(__dirname, '../../node_modules/@consilioweb/payload-support')
    config.resolve.alias['@karixi/payload-ai'] = path.resolve(__dirname, '../../node_modules/@karixi/payload-ai')
    config.resolve.modules = [path.resolve(__dirname, '../../node_modules'), 'node_modules']
    config.resolve.symlinks = true
    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.perissos.dev',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
    ],
  },
}

export default withPayload(nextConfig)
