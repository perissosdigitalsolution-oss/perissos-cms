#!/usr/bin/env node

/**
 * Marketplace Seed Script
 * Packages existing templates as marketplace entries
 * Run with: pnpm db:seed:marketplace
 */

import { getPayload } from 'payload'
import config from '@payload-config'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface SeedTemplate {
  name: string
  slug: string
  description: string
  category: string
  tags: string[]
  version: string
  isPremium: boolean
  requiredPlan: 'free' | 'pro' | 'enterprise'
  price?: number
  author: string
  authorUrl: string
  rating: number
  verified: boolean
  localPath: string
  zipFileName: string
  previewImage?: string
}

const seedTemplates: SeedTemplate[] = [
  {
    name: 'Digital Agency Pro',
    slug: 'digital-agency-pro',
    description: 'Modern digital agency template with hero, services, portfolio, testimonials, and contact sections. Perfect for creative agencies and freelancers.',
    category: 'agency',
    tags: ['modern', 'creative', 'portfolio', 'services'],
    version: '2.1.0',
    isPremium: false,
    requiredPlan: 'free',
    author: 'Perissos Team',
    authorUrl: 'https://perissos.dev',
    rating: 4.9,
    verified: true,
    localPath: 'template/digital Agency',
    zipFileName: 'digital_agency_test.zip',
  },
  {
    name: 'Food Express',
    slug: 'food-express',
    description: 'Restaurant template with menu highlights, reservations, gallery, testimonials, and location sections. Warm design with elegant typography.',
    category: 'restaurant',
    tags: ['restaurant', 'menu', 'reservations', 'food'],
    version: '1.0.0',
    isPremium: true,
    requiredPlan: 'pro',
    price: 49,
    author: 'Perissos Team',
    authorUrl: 'https://perissos.dev',
    rating: 4.5,
    verified: true,
    localPath: 'template/food express',
    zipFileName: 'food-express.zip',
  },
  {
    name: 'Optica+',
    slug: 'optica-plus',
    description: 'Professional optician and eye care clinic template with services, doctor profiles, appointment booking, FAQ, and pricing sections.',
    category: 'portfolio',
    tags: ['medical', 'healthcare', 'optician', 'clinic'],
    version: '1.0.0',
    isPremium: true,
    requiredPlan: 'enterprise',
    price: 99,
    author: 'Perissos Team',
    authorUrl: 'https://perissos.dev',
    rating: 4.6,
    verified: true,
    localPath: 'template/optica+',
    zipFileName: 'optica-plus.zip',
  },
]

async function createZipFromFolder(folderPath: string, zipName: string): Promise<Buffer> {
  // For now, we'll read the existing ZIP or create a placeholder
  // In production, this would use archiver or similar to create the ZIP
  const zipPath = path.join(folderPath, '..', zipName)
  try {
    const buffer = await fs.readFile(zipPath)
    return buffer
  } catch {
    // Create a minimal placeholder ZIP if it doesn't exist
    console.log(`  Creating placeholder ZIP for ${zipName}`)
    return Buffer.from('placeholder')
  }
}

async function uploadMedia(payload: any, fileName: string, buffer: Buffer, alt: string) {
  const file = new File([buffer], fileName, { type: 'application/zip' })
  const formData = new FormData()
  formData.append('file', file)
  formData.append('alt', alt)

  const response = await fetch(`${process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3000'}/api/media`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Failed to upload ${fileName}`)
  }

  const data = await response.json()
  return data.doc.id
}

async function seed() {
  console.log('🌱 Starting marketplace seed...')

  const payload = await getPayload({ config })

  for (const template of seedTemplates) {
    console.log(`\n📦 Processing: ${template.name}`)

    // Check if already exists
    const existing = await payload.find({
      collection: 'marketplace-templates',
      where: { slug: { equals: template.slug } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      console.log(`  ⏭️  Already exists, skipping: ${template.name}`)
      continue
    }

    // Read or create ZIP
    const zipBuffer = await createZipFromFolder(
      path.join(__dirname, '..', template.localPath),
      template.zipFileName
    )

    // Upload ZIP to media
    console.log(`  📤 Uploading ZIP...`)
    const zipMediaId = await uploadMedia(payload, template.zipFileName, zipBuffer, `${template.name} ZIP`)

    // Upload preview image if exists
    let previewMediaId: string | undefined
    const previewPath = path.join(__dirname, '..', template.localPath, 'preview.jpg')
    try {
      const previewBuffer = await fs.readFile(previewPath)
      previewMediaId = await uploadMedia(payload, `preview-${template.slug}.jpg`, previewBuffer, `${template.name} preview`)
      console.log(`  🖼️  Uploaded preview image`)
    } catch {
      console.log(`  ⚠️  No preview image found`)
    }

    // Create marketplace template
    console.log(`  💾 Creating marketplace entry...`)
    const result = await payload.create({
      collection: 'marketplace-templates',
      data: {
        name: template.name,
        slug: template.slug,
        description: template.description,
        category: template.category,
        tags: template.tags,
        version: template.version,
        isPremium: template.isPremium,
        requiredPlan: template.requiredPlan,
        price: template.price,
        author: template.author,
        authorUrl: template.authorUrl,
        rating: template.rating,
        verified: template.verified,
        zipFile: zipMediaId,
        previewImage: previewMediaId,
        layoutConfig: {}, // Will be extracted from ZIP on install
        sectionDependencies: [],
        changelog: 'Initial release',
        versions: [
          {
            version: template.version,
            changelog: 'Initial release',
            zipFile: zipMediaId,
            layoutConfig: {},
            publishedAt: new Date().toISOString(),
          },
        ],
        publishedAt: new Date().toISOString(),
        downloads: 0,
        rating: template.rating,
      },
    })

    console.log(`  ✅ Created: ${result.name} (ID: ${result.id})`)
  }

  console.log('\n✨ Marketplace seed complete!')
  process.exit(0)
}

seed().catch(err => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})