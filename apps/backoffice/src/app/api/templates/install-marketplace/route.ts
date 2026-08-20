import { NextResponse } from 'next/server'
import { createPayloadRequest, getPayload } from 'payload'
import config from '@payload-config'

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

    const body = await request.json()
    const { templateId, downloadUrl } = body

    if (!templateId || !downloadUrl) {
      return NextResponse.json({ error: 'templateId and downloadUrl are required' }, { status: 400 })
    }

    // Find the template in marketplace
    const marketplaceTemplates = [
      {
        id: 'digital-agency-v2',
        name: 'Digital Agency Pro',
        description: 'Modern digital agency template with hero, services, portfolio, testimonials, and contact sections.',
        previewImage: '/templates/previews/digital-agency-pro.jpg',
        version: '2.1.0',
        category: 'agency',
        tags: ['modern', 'creative', 'portfolio', 'services'],
        downloadUrl: 'https://templates.perissos.dev/digital-agency-pro-v2.1.0.zip',
        author: 'Perissos Team',
        authorUrl: 'https://perissos.dev',
        rating: 4.9,
        downloads: 2847,
        lastUpdated: '2026-01-15',
      },
      {
        id: 'saas-landing-v1',
        name: 'SaaS Landing Page',
        description: 'High-converting SaaS landing page with feature highlights, pricing tables, testimonials, and CTA sections.',
        previewImage: '/templates/previews/saas-landing.jpg',
        version: '1.3.0',
        category: 'saas',
        tags: ['saas', 'pricing', 'features', 'conversion'],
        downloadUrl: 'https://templates.perissos.dev/saas-landing-v1.3.0.zip',
        author: 'Perissos Team',
        authorUrl: 'https://perissos.dev',
        rating: 4.8,
        downloads: 1923,
        lastUpdated: '2026-01-10',
      },
      {
        id: 'portfolio-minimal-v1',
        name: 'Minimal Portfolio',
        description: 'Clean, minimalist portfolio template for designers, photographers, and creatives.',
        previewImage: '/templates/previews/minimal-portfolio.jpg',
        version: '1.0.0',
        category: 'portfolio',
        tags: ['minimal', 'gallery', 'creative', 'photography'],
        downloadUrl: 'https://templates.perissos.dev/minimal-portfolio-v1.0.0.zip',
        author: 'Sarah Chen',
        authorUrl: 'https://sarahchen.design',
        rating: 4.7,
        downloads: 1456,
        lastUpdated: '2025-12-20',
      },
      {
        id: 'business-consulting-v1',
        name: 'Business Consulting',
        description: 'Professional business consulting template with services, case studies, team, and contact sections.',
        previewImage: '/templates/previews/business-consulting.jpg',
        version: '1.2.0',
        category: 'business',
        tags: ['corporate', 'services', 'case-studies', 'team'],
        downloadUrl: 'https://templates.perissos.dev/business-consulting-v1.2.0.zip',
        author: 'Perissos Team',
        authorUrl: 'https://perissos.dev',
        rating: 4.6,
        downloads: 987,
        lastUpdated: '2025-12-15',
      },
      {
        id: 'ecommerce-fashion-v1',
        name: 'Fashion E-commerce',
        description: 'Elegant fashion store template with product grid, categories, featured products, and checkout-ready layout.',
        previewImage: '/templates/previews/ecommerce-fashion.jpg',
        version: '1.0.0',
        category: 'ecommerce',
        tags: ['fashion', 'shop', 'products', 'categories'],
        downloadUrl: 'https://templates.perissos.dev/ecommerce-fashion-v1.0.0.zip',
        author: 'Marco Rossi',
        authorUrl: 'https://marcorossi.dev',
        rating: 4.5,
        downloads: 734,
        lastUpdated: '2025-11-30',
      },
      {
        id: 'blog-magazine-v1',
        name: 'Magazine Blog',
        description: 'Content-rich magazine-style blog template with featured posts, categories, newsletter signup, and author profiles.',
        previewImage: '/templates/previews/magazine-blog.jpg',
        version: '1.1.0',
        category: 'blog',
        tags: ['magazine', 'news', 'newsletter', 'categories'],
        downloadUrl: 'https://templates.perissos.dev/magazine-blog-v1.1.0.zip',
        author: 'Perissos Team',
        authorUrl: 'https://perissos.dev',
        rating: 4.7,
        downloads: 1102,
        lastUpdated: '2025-12-05',
      },
      {
        id: 'startup-landing-v1',
        name: 'Startup Launch',
        description: 'Pre-launch startup landing page with countdown timer, email capture, features, and social proof sections.',
        previewImage: '/templates/previews/startup-landing.jpg',
        version: '1.0.0',
        category: 'landing',
        tags: ['startup', 'launch', 'countdown', 'email-capture'],
        downloadUrl: 'https://templates.perissos.dev/startup-landing-v1.0.0.zip',
        author: 'Alex Kim',
        authorUrl: 'https://alexkim.design',
        rating: 4.4,
        downloads: 567,
        lastUpdated: '2025-11-20',
      },
      {
        id: 'restaurant-v1',
        name: 'Restaurant & Cafe',
        description: 'Warm restaurant template with menu, reservations, gallery, testimonials, and location sections.',
        previewImage: '/templates/previews/restaurant.jpg',
        version: '1.0.0',
        category: 'business',
        tags: ['restaurant', 'menu', 'reservations', 'food'],
        downloadUrl: 'https://templates.perissos.dev/restaurant-v1.0.0.zip',
        author: 'Perissos Team',
        authorUrl: 'https://perissos.dev',
        rating: 4.3,
        downloads: 423,
        lastUpdated: '2025-11-10',
      },
    ]

    const template = marketplaceTemplates.find(t => t.id === templateId)
    if (!template) {
      return NextResponse.json({ error: 'Template not found in marketplace' }, { status: 404 })
    }

    // Download the ZIP from the marketplace
    const zipResponse = await fetch(template.downloadUrl)
    if (!zipResponse.ok) {
      return NextResponse.json({ error: 'Failed to download template from marketplace' }, { status: 500 })
    }

    const arrayBuffer = await zipResponse.arrayBuffer()

    // Upload to Payload media
    const payload = await getPayload({ config })

    // Upload ZIP file
    const zipDoc = await payload.create({
      collection: 'media',
      data: {
        alt: `${template.name} source ZIP`,
        caption: `Original template ZIP for ${template.name}`,
      },
      file: {
        data: Buffer.from(arrayBuffer),
        mimetype: 'application/zip',
        name: `${template.id}.zip`,
        size: arrayBuffer.byteLength,
      },
      overrideAccess: true,
      user: user,
    })

    // Create the template document
    const templateDoc = await payload.create({
      collection: 'templates',
      data: {
        name: template.name,
        description: template.description,
        previewImage: undefined, // Could download and upload preview image
        layoutConfig: { sections: ['hero', 'services', 'about', 'portfolio', 'blog', 'pricing', 'cta', 'contact'] },
        zipFile: zipDoc.id,
        isActive: false,
        version: template.version,
        category: template.category,
      },
      overrideAccess: true,
      user: user,
    })

    return NextResponse.json({
      success: true,
      message: `Template "${template.name}" installed successfully!`,
      template: templateDoc,
      instructions: 'Go to the Templates list and click "Activate" to use this template.',
    })
  } catch (error: any) {
    console.error('Marketplace install error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to install template from marketplace',
        details: 'Please try again or contact support.',
      },
      { status: 500 }
    )
  }
}