import { NextResponse } from 'next/server'
import AdmZip from 'adm-zip'
import { createPayloadRequest, getPayload } from 'payload'
import config from '@payload-config'

// Generate layoutConfig from HTML content by detecting sections
function generateLayoutConfig(html: string): any {
  const sections: string[] = []

  if (html.match(/<section[^>]*id=["']?hero/i)) sections.push('hero')
  else if (html.match(/hero/i)) sections.push('hero')

  if (html.match(/feature|service/i)) sections.push('features')
  if (html.match(/about/i)) sections.push('about')
  if (html.match(/testimonial|client/i)) sections.push('testimonials')
  if (html.match(/pricing|plan/i)) sections.push('pricing')
  if (html.match(/cta|contact|get.?start/i)) sections.push('cta')
  if (html.match(/blog|article/i)) sections.push('blog')
  if (html.match(/portfolio|work/i)) sections.push('portfolio')

  if (sections.length === 0) {
    sections.push('hero', 'features', 'testimonials', 'pricing', 'cta')
  }

  return { sections }
}

// Extract metadata from HTML
function extractMetadata(html: string): { title?: string; description?: string } {
  const titleMatch = html.match(/<title>(.*?)<\/title>/i)
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i)
  return {
    title: titleMatch?.[1]?.trim() || undefined,
    description: descMatch?.[1]?.trim() || undefined,
  }
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

    // Find preview image (preview.jpg, preview.png, screenshot.jpg, etc.)
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
    const metadata = extractMetadata(indexHtml)

    // Build template name
    const templateName = manifest.name || metadata.title || zipFile.name.replace('.zip', '').replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

    // Generate layout config
    const layoutConfig = manifest.layoutConfig || generateLayoutConfig(indexHtml)

    const payload = await getPayload({ config })

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