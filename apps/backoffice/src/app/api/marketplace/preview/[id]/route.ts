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

function extractAndBuildHtml(zip: AdmZip, templateName: string, templateVersion: string, page: string) {
  const entries = zip.getEntries()

  const htmlPages: { name: string; path: string }[] = []
  const cssFiles: string[] = []
  const jsFiles: string[] = []

  for (const entry of entries) {
    if (entry.isDirectory) continue
    const entryName = entry.entryName.toLowerCase()
    if (entryName.endsWith('.html')) {
      const name = entry.entryName.split('/').pop() || entry.entryName
      htmlPages.push({ name, path: entry.entryName })
    } else if (entryName.endsWith('.css')) {
      cssFiles.push(entry.entryName)
    } else if (entryName.endsWith('.js')) {
      jsFiles.push(entry.entryName)
    }
  }

  const requestedPage = htmlPages.find(p =>
    p.name === page || p.path === page || p.name.toLowerCase() === page.toLowerCase()
  ) || htmlPages.find(p => p.name === 'index.html') || htmlPages[0]

  if (!requestedPage) {
    return `<!DOCTYPE html><html><head><title>No HTML</title></head>
      <body style="font-family:sans-serif;padding:40px;text-align:center">
        <h2>No HTML files found</h2>
        <p>Archive contains: ${entries.map(e => e.entryName).join(', ')}</p>
      </body></html>`
  }

  let html = zip.readAsText(requestedPage.path)

  let inlineCSS = ''
  for (const cssPath of cssFiles) {
    try { inlineCSS += `\n/* ${cssPath} */\n${zip.readAsText(cssPath)}\n` } catch {}
  }

  let inlineJS = ''
  for (const jsPath of jsFiles) {
    try { inlineJS += `\n/* ${jsPath} */\n${zip.readAsText(jsPath)}\n` } catch {}
  }

  if (inlineCSS) {
    if (html.includes('<style')) {
      html = html.replace('<style>', `<style>\n${inlineCSS}\n`)
    } else {
      html = html.replace('</head>', `<style>${inlineCSS}</style>\n</head>`)
    }
  }

  if (inlineJS) {
    if (html.includes('<script')) {
      html = html.replace('<script>', `<script>\n${inlineJS}\n`)
    } else {
      html = html.replace('</body>', `<script>${inlineJS}</script>\n</body>`)
    }
  }

  const pageListHTML = htmlPages.length > 1 ? `
    <div style="position:fixed;top:0;left:0;right:0;z-index:99999;background:#1a1a2e;color:white;padding:8px 16px;display:flex;align-items:center;gap:12px;font-family:system-ui;font-size:13px;box-shadow:0 2px 8px rgba(0,0,0,0.3)">
      <strong style="color:#FF6600">Preview:</strong>
      <span>${templateName} v${templateVersion}</span>
      <span style="color:#666">|</span>
      ${htmlPages.map(p => `
        <a href="?page=${encodeURIComponent(p.name)}"
           style="color:${p.name === requestedPage.name ? '#FF6600' : '#aaa'};text-decoration:none;padding:4px 8px;border-radius:4px;${p.name === requestedPage.name ? 'background:rgba(255,102,0,0.15)' : ''}"
        >${p.name.replace('.html', '')}</a>
      `).join('')}
    </div>
    <div style="height:36px"></div>
  ` : ''

  html = html.replace('<body>', `<body>\n${pageListHTML}`)

  return html
}

function buildZipUrl(url: string, filename?: string): string {
  const minioEndpoint = process.env.R2_ENDPOINT || 'http://localhost:9000'
  const bucket = process.env.R2_BUCKET || 'perissos-media'
  const fname = filename || url.split('/').pop() || ''
  return `${minioEndpoint}/${bucket}/${fname}`
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const url = new URL(request.url)
    const page = url.searchParams.get('page') || 'index.html'
    const type = url.searchParams.get('type') || 'marketplace'

    const payload = await getPayload({ config })

    let templateName = ''
    let templateVersion = ''
    let zipFileUrl = ''
    let zipFilename = ''

    if (type === 'installed') {
      const template = await payload.findByID({
        collection: 'templates',
        id: Number(id),
        depth: 1,
      })
      if (!template) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 })
      }
      const zf = template.zipFile as any
      if (!zf?.url) {
        return NextResponse.json({ error: 'No ZIP file attached' }, { status: 404 })
      }
      templateName = template.name
      templateVersion = template.version || ''
      zipFileUrl = zf.url
      zipFilename = zf.filename
    } else {
      const result = await payload.find({
        collection: 'marketplace-templates',
        where: { id: { equals: Number(id) } },
        limit: 1,
        depth: 1,
      })
      if (result.docs.length === 0) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 })
      }
      const template = result.docs[0]
      const zf = template.zipFile as any
      if (!zf?.url) {
        return NextResponse.json({ error: 'No ZIP file attached' }, { status: 404 })
      }
      templateName = template.name
      templateVersion = template.version || ''
      zipFileUrl = zf.url
      zipFilename = zf.filename
    }

    const internalUrl = buildZipUrl(zipFileUrl, zipFilename)
    const zipBuffer = await fetchZipAsBuffer(internalUrl)
    const zip = new AdmZip(zipBuffer)
    const html = extractAndBuildHtml(zip, templateName, templateVersion, page)

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error: any) {
    console.error('Preview error:', error)
    return new NextResponse(`<!DOCTYPE html><html><head><title>Error</title></head>
      <body style="font-family:sans-serif;padding:40px;text-align:center">
        <h2>Preview Failed</h2><p>${error.message}</p>
        <p><a href="javascript:history.back()">Go Back</a></p>
      </body></html>`, { status: 500, headers: { 'Content-Type': 'text/html' } })
  }
}
