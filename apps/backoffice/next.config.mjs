import { withPayload } from '@payloadcms/next/withPayload'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreErrors: true, ignoreBuildErrors: true },
  reactStrictMode: true,
  transpilePackages: ['@payloadcms/next', '@payloadcms/richtext-lexical'],
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
