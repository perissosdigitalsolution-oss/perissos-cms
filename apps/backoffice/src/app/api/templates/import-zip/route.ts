import { NextResponse } from 'next/server'
import AdmZip from 'adm-zip'
import { createPayloadRequest, getPayload } from 'payload'
import config from '@payload-config'
import * as cheerio from 'cheerio'
import { parseTemplate, extractSectionHtml } from '@/lib/html-parser'
import { processAssets, extractThemeConfig } from '@/lib/asset-pipeline'
import { mapHeroSection } from '@/lib/section-mappers/hero'
import { mapServicesSection } from '@/lib/section-mappers/services'
import { mapAboutSection } from '@/lib/section-mappers/about'
import { mapWhyUsSection } from '@/lib/section-mappers/whyUs'
import { mapTeamSection } from '@/lib/section-mappers/team'
import { mapPortfolioSection } from '@/lib/section-mappers/portfolio'
import { mapBlogSection } from '@/lib/section-mappers/blog'
import { mapPricingSection } from '@/lib/section-mappers/pricing'
import { mapCTASection } from '@/lib/section-mappers/cta'
import { mapContactSection } from '@/lib/section-mappers/contact'
import { mapMenuSection } from '@/lib/section-mappers/menu'
import { mapMenuHighlightsSection } from '@/lib/section-mappers/menuHighlights'
import { mapReservationSection } from '@/lib/section-mappers/reservation'
import { mapGallerySection } from '@/lib/section-mappers/gallery'
import { mapTestimonialsSection } from '@/lib/section-mappers/testimonials'
import { mapSpecialsSection } from '@/lib/section-mappers/specials'
import { validateSectionProps, mergeWithDefaults } from '@/lib/validation'
import { sectionSchemas, SectionCategoryType } from '@perissos/shared/registry/sections'

// Section mapper registry
const sectionMappers: Record<SectionCategoryType, (cheerio: any, $el: any) => any> = {
  hero: mapHeroSection,
  services: mapServicesSection,
  about: mapAboutSection,
  whyUs: mapWhyUsSection,
  team: mapTeamSection,
  portfolio: mapPortfolioSection,
  blog: mapBlogSection,
  pricing: mapPricingSection,
  cta: mapCTASection,
  contact: mapContactSection,
  menu: mapMenuSection,
  menuHighlights: mapMenuHighlightsSection,
  reservation: mapReservationSection,
  gallery: mapGallerySection,
  testimonials: mapTestimonialsSection,
  specials: mapSpecialsSection,
}

interface SectionContent {
  type: string
  props: Record<string, any>
}

export async function POST(request: Request) {
  try {
    // Build an authenticated Payload request from the incoming request (reads JWT cookie)
    const req = await createPayloadRequest({
      config,
      request,
    })

    const user = req.user
    const isAdmin = user?.role === 'admin' || user?.collection === 'users'

    if (!user || !isAdmin) {
      return NextResponse.json({ error: 'You are not allowed to perform this action.' }, { status: 403 })
    }

    const formData = await request.formData()
    const zipFile = formData.get('zipFile') as File

    if (!zipFile) {
      return NextResponse.json({ error: 'No ZIP file provided' }, { status: 400 })
    }

    if (!zipFile.name.endsWith('.zip')) {
      return NextResponse.json({ error: 'File must be a ZIP archive' }, { status: 400 })
    }

    if (zipFile.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'ZIP file too large. Maximum size is 10MB.' }, { status: 400 })
    }

    // Read ZIP
    const arrayBuffer = await zipFile.arrayBuffer()
    const zip = new AdmZip(Buffer.from(arrayBuffer))
    const entries = zip.getEntries()

    if (entries.length === 0) {
      return NextResponse.json({ error: 'ZIP file is empty' }, { status: 400 })
    }

    // Find index.html
    const indexEntry = entries.find(e => e.entryName === 'index.html' || e.entryName.endsWith('/index.html'))
    if (!indexEntry) {
      return NextResponse.json(
        { error: 'index.html not found in ZIP. Your ZIP must contain index.html.' },
        { status: 400 }
      )
    }

    // Read index.html content
    const indexHtml = indexEntry.getData().toString('utf-8')

    // Find manifest.json
    const manifestEntry = entries.find(e => e.entryName === 'manifest.json' || e.entryName.endsWith('/manifest.json'))
    let manifest: any = {}
    if (manifestEntry) {
      try {
        manifest = JSON.parse(manifestEntry.getData().toString('utf-8'))
      } catch {
        manifest = {}
      }
    }

    // Find preview image
    const previewEntry = entries.find(e => {
      const name = e.entryName.toLowerCase()
      return (
        /preview\.(jpe?g|png)$/.test(name) ||
        /screenshot\.(jpe?g|png)$/.test(name) ||
        /thumbnail\.(jpe?g|png)$/.test(name) ||
        /\.(jpe?g|png)$/.test(name)
      )
    })

    // Extract metadata from HTML
    const titleMatch = indexHtml.match(/<title>(.*?)<\/title>/i)
    const descMatch = indexHtml.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i)
    const metadata = {
      title: titleMatch?.[1]?.trim() || undefined,
      description: descMatch?.[1]?.trim() || undefined,
    }

    // Build template name
    const templateName = manifest.name || metadata.title || zipFile.name.replace('.zip', '').replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

    // Parse template with new HTML parser
    const parsedTemplate = parseTemplate(indexHtml, 'http://localhost')

    // Extract theme configuration
    const themeConfig = extractThemeConfig(parsedTemplate.$)

    // Map sections using section mappers
    const sectionContents: SectionContent[] = []
    for (const section of parsedTemplate.sections) {
      const mapper = sectionMappers[section.type as SectionCategoryType]
      if (mapper) {
        try {
          const sectionHtml = extractSectionHtml(parsedTemplate.$, section)
          const $section = cheerio.load(sectionHtml)
          const rootEl = $section('section, div').first()
          
          if (rootEl.length) {
            const extractedProps = await mapper($section, rootEl)
            const schema = sectionSchemas[section.type as SectionCategoryType]
            if (schema) {
              const validatedProps = mergeWithDefaults(schema, extractedProps, section.type as SectionCategoryType)
              sectionContents.push({ type: section.type, props: validatedProps })
            } else {
              sectionContents.push({ type: section.type, props: extractedProps })
            }
          }
        } catch (error) {
          console.warn(`Failed to map section ${section.type}:`, error)
        }
      }
    }

    // Build layoutConfig with full section content
    const layoutConfig = manifest.layoutConfig || {
      sections: parsedTemplate.sections.map(s => s.type),
      sectionContents,
      theme: themeConfig,
    }

    const payload = await getPayload({ config })

    // Process assets (download external images, upload to media)
    const { html: processedHtml, assetMap } = await processAssets(indexHtml, 'http://localhost', user, payload)

    // Extract Google Fonts from parsed template
    const googleFonts = parsedTemplate.theme.fonts

    // Upload preview image to media collection if present
    let previewImageId: string | number | null = null
    if (previewEntry) {
      const previewData = previewEntry.getData()
      const previewName = previewEntry.entryName.split('/').pop() || 'preview'
      try {
        const mediaDoc = await payload.create({
          collection: 'media',
          data: {
            alt: `${templateName} preview`,
            caption: `Preview image for ${templateName}`,
          },
          file: {
            data: Buffer.from(previewData),
            mimetype: previewEntry.entryName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg',
            name: previewName,
            size: previewData.length,
          },
          overrideAccess: true,
          user: user,
        })
        previewImageId = mediaDoc.id
      } catch (mediaError: any) {
        console.error('Failed to upload preview image:', mediaError)
      }
    }

    // Upload the ZIP file itself for re-import
    const zipDoc = await payload.create({
      collection: 'media',
      data: {
        alt: `${templateName} source ZIP`,
        caption: `Original template ZIP for ${templateName}`,
      },
      file: {
        data: Buffer.from(arrayBuffer),
        mimetype: 'application/zip',
        name: zipFile.name,
        size: arrayBuffer.byteLength,
      },
      overrideAccess: true,
      user: user,
    })

    // Create the template document
    const templateDoc = await payload.create({
      collection: 'templates',
      data: {
        name: templateName,
        description: manifest.description || metadata.description || `Template imported from ${zipFile.name}`,
        previewImage: previewImageId || undefined,
        layoutConfig,
        zipFile: zipDoc.id,
        isActive: false,
        version: manifest.version || '1.0.0',
        category: manifest.category || 'imported',
      },
      overrideAccess: true,
      user: user,
    })

    return NextResponse.json({
      success: true,
      message: `Template "${templateName}" imported successfully!`,
      template: templateDoc,
      instructions: 'Go to the Templates list and click "Activate" to use this template.',
      debug: {
        detectedSections: parsedTemplate.sections.map(s => s.type),
        sectionContentsCount: sectionContents.length,
        assetsProcessed: assetMap.size,
        fontsExtracted: googleFonts.length,
        themeConfigKeys: Object.keys(themeConfig).length,
      },
    })
  } catch (error: any) {
    console.error('Template import error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to import template',
        details: 'Please ensure the ZIP file is valid and contains index.html.',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Template ZIP import endpoint',
    method: 'POST',
    accepts: 'multipart/form-data with zipFile field',
    maxSize: '10MB',
    requiredFiles: ['index.html'],
    optionalFiles: ['preview.jpg', 'manifest.json'],
  })
}