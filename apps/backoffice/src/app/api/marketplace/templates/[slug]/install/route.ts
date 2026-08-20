import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import AdmZip from 'adm-zip'

async function fetchZipAsBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to download ZIP: ${response.statusText}`)
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

function extractRenderedHtml(zip: AdmZip): string {
  const entries = zip.getEntries()
  const htmlEntry = entries.find(e => !e.isDirectory && e.entryName.toLowerCase().endsWith('index.html'))
  if (!htmlEntry) return ''

  let html = zip.readAsText(htmlEntry.entryName)

  const cssEntries = entries.filter(e => !e.isDirectory && e.entryName.toLowerCase().endsWith('.css'))
  let inlineCSS = ''
  for (const cssEntry of cssEntries) {
    try { inlineCSS += `\n${zip.readAsText(cssEntry.entryName)}\n` } catch {}
  }

  const jsEntries = entries.filter(e => !e.isDirectory && e.entryName.toLowerCase().endsWith('.js'))
  let inlineJS = ''
  for (const jsEntry of jsEntries) {
    try { inlineJS += `\n${zip.readAsText(jsEntry.entryName)}\n` } catch {}
  }

  if (inlineCSS) {
    html = html.replace('</head>', `<style>${inlineCSS}</style>\n</head>`)
  }
  if (inlineJS) {
    html = html.replace('</body>', `<script>${inlineJS}</script>\n</body>`)
  }

  return html
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'marketplace-templates',
      where: {
        slug: { equals: slug },
      },
      limit: 1,
      depth: 0,
    })

    if (result.docs.length === 0) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    const marketplaceTemplate = result.docs[0]

    const existing = await payload.find({
      collection: 'templates',
      where: {
        marketplaceTemplateId: { equals: marketplaceTemplate.id },
      },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      return NextResponse.json(
        { error: 'Template already installed' },
        { status: 409 }
      )
    }

    const planHierarchy: Record<string, number> = { free: 0, pro: 1, enterprise: 2 }
    const requiredPlan = marketplaceTemplate.requiredPlan || 'free'
    if (marketplaceTemplate.isPremium && requiredPlan !== 'free') {
      let userPlan = 'free'
      try {
        const authHeader = request.headers.get('authorization') || ''
        const cookieHeader = request.headers.get('cookie') || ''
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) :
          (cookieHeader.match(/payload-token=([^;]+)/)?.[1] || '')
        if (token) {
          const payload = await getPayload({ config })
          const { docs } = await payload.find({ collection: 'users', limit: 1, depth: 0 })
          const [headerB64, payloadB64] = token.split('.')
          const tokenPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString())
          const userId = tokenPayload.id
          if (userId) {
            const user = await payload.findByID({ collection: 'users', id: userId, depth: 0 })
            if (user?.role === 'admin') userPlan = 'enterprise'
            else if (user?.role === 'editor') userPlan = 'pro'
          }
        }
      } catch { /* fallback to free */ }

      const userLevel = planHierarchy[userPlan] ?? 0
      const requiredLevel = planHierarchy[requiredPlan] ?? 0
      if (userLevel < requiredLevel) {
        return NextResponse.json(
          { error: `This template requires a ${requiredPlan} plan or higher`, requiredPlan, userPlan },
          { status: 403 }
        )
      }
    }

    const extractId = (val: any): number | null => {
      if (val && typeof val === 'object' && val.id !== undefined) return Number(val.id)
      if (typeof val === 'number') return val
      if (typeof val === 'string' && !isNaN(Number(val))) return Number(val)
      return null
    }

    const versions = Array.isArray(marketplaceTemplate.versions)
      ? marketplaceTemplate.versions.map((v: any) => ({
          version: v.version || '',
          changelog: v.changelog || '',
          zipFile: extractId(v.zipFile),
          layoutConfig: v.layoutConfig || undefined,
        }))
      : []

    const cookieHeader = request.headers.get('cookie') || ''
    const authHeader = request.headers.get('authorization') || ''
    const serverURL = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3000'

    const createResponse = await fetch(`${serverURL}/api/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: JSON.stringify({
        name: marketplaceTemplate.name,
        description: marketplaceTemplate.description || '',
        previewImage: extractId(marketplaceTemplate.previewImage),
        layoutConfig: marketplaceTemplate.layoutConfig || {},
        zipFile: extractId(marketplaceTemplate.zipFile),
        isActive: false,
        version: marketplaceTemplate.version,
        category: marketplaceTemplate.category,
        marketplaceTemplateId: marketplaceTemplate.id,
        installedVersion: marketplaceTemplate.version,
        availableVersions: versions,
      }),
    })

    if (!createResponse.ok) {
      const errorData = await createResponse.json()
      console.error('Template create failed:', JSON.stringify(errorData))
      return NextResponse.json(
        { error: 'Failed to install template', details: errorData },
        { status: 500 }
      )
    }

    const createData = await createResponse.json()

    // Extract rendered HTML from ZIP and store on the home page
    try {
      const zipMedia = marketplaceTemplate.zipFile as any
      const zipUrl = zipMedia?.url
      if (zipUrl) {
        const minioEndpoint = process.env.R2_ENDPOINT || 'http://localhost:9000'
        const bucket = process.env.R2_BUCKET || 'perissos-media'
        const fname = zipMedia.filename || zipUrl.split('/').pop() || ''
        const internalUrl = `${minioEndpoint}/${bucket}/${fname}`
        const zipBuffer = await fetchZipAsBuffer(internalUrl)
        const zip = new AdmZip(zipBuffer)
        const renderedHtml = extractRenderedHtml(zip)

        if (renderedHtml) {
          // Find or create the home page and store rendered HTML
          const homeResult = await payload.find({
            collection: 'pages',
            where: { slug: { equals: 'home' } },
            limit: 1,
          })

          if (homeResult.docs.length > 0) {
            await payload.update({
              collection: 'pages',
              id: homeResult.docs[0].id,
              data: { renderedHtml } as any,
            })
          } else {
            await payload.create({
              collection: 'pages',
              data: {
                title: 'Home',
                slug: 'home',
                renderedHtml,
                publishedAt: new Date().toISOString(),
              } as any,
            })
          }
          console.log(`[install] Stored rendered HTML (${renderedHtml.length} chars) on home page`)
        }
      }
    } catch (htmlErr) {
      console.error('[install] Failed to extract rendered HTML:', htmlErr)
    }

    await fetch(`${serverURL}/api/marketplace-templates/${marketplaceTemplate.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: JSON.stringify({
        downloads: (marketplaceTemplate.downloads || 0) + 1,
      }),
    })

    return NextResponse.json({
      success: true,
      template: createData.doc,
    })
  } catch (error: any) {
    console.error('Marketplace install error:', error)
    return NextResponse.json(
      { error: 'Failed to install template' },
      { status: 500 }
    )
  }
}
