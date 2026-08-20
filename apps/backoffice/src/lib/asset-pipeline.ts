import * as cheerio from 'cheerio'
import { getPayload } from 'payload'
import config from '@payload-config'

export interface AssetResult {
  id: string | number
  url: string
  originalUrl: string
}

/**
 * Download a file from a URL
 */
export async function downloadAsset(url: string): Promise<Buffer | null> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Perissos-CMS-Template-Importer/1.0',
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.warn(`Failed to download ${url}: ${response.status}`)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (error) {
    console.warn(`Error downloading ${url}:`, error)
    return null
  }
}

/**
 * Upload an asset to Payload media collection
 */
export async function uploadToMedia(
  payload: Awaited<ReturnType<typeof getPayload>>,
  fileName: string,
  buffer: Buffer,
  mimeType: string,
  alt: string,
  user: any
): Promise<{ id: string | number; url: string } | null> {
  try {
    const mediaDoc = await payload.create({
      collection: 'media',
      data: {
        alt,
        caption: `Imported asset for template`,
      },
      file: {
        data: buffer,
        mimetype: mimeType,
        name: fileName,
        size: buffer.length,
      },
      overrideAccess: true,
      user,
    })
    return { id: mediaDoc.id, url: mediaDoc.url }
  } catch (error) {
    console.error(`Failed to upload ${fileName}:`, error)
    return null
  }
}

/**
 * Determine mime type from URL or filename
 */
export function getMimeType(url: string, fallback: string = 'application/octet-stream'): string {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase()
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    css: 'text/css',
    js: 'application/javascript',
    woff: 'font/woff',
    woff2: 'font/woff2',
    ttf: 'font/ttf',
    eot: 'application/vnd.ms-fontobject',
    zip: 'application/zip',
    pdf: 'application/pdf',
  }
  return ext && mimeTypes[ext] ? mimeTypes[ext] : fallback
}

/**
 * Extract filename from URL
 */
export function getFileName(url: string, fallback: string = 'asset'): string {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const filename = pathname.split('/').pop() || fallback
    return filename
  } catch {
    return fallback
  }
}

/**
 * Resolve relative URLs
 */
function resolveUrl(url: string, base: string): string {
  try {
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//') || url.startsWith('data:')) {
      return url.startsWith('//') ? 'https:' + url : url
    }
    return new URL(url, base).href
  } catch {
    return url
  }
}

/**
 * Collect all asset URLs from HTML
 */
function collectAssetUrls($: any, baseUrl: string): string[] {
  const urls = new Set<string>()

  // Images
  const imgElements = $('img').get()
  for (let i = 0; i < imgElements.length; i++) {
    const el = imgElements[i]
    const $el = $(el)
    const src = $el.attr('src') || $el.attr('data-src')
    if (src) urls.add(resolveUrl(src, baseUrl))
    const srcset = $el.attr('srcset')
    if (srcset) {
      const parts = srcset.split(',')
      for (let k = 0; k < parts.length; k++) {
        const s = parts[k]
        urls.add(resolveUrl(s.trim().split(' ')[0], baseUrl))
      }
    }
  }

  // Background images
  const bgElements = $($('[style*="background-image"]').get())
  for (let i = 0; i < bgElements.length; i++) {
    const el = bgElements[i]
    const style = $(el).attr('style') || ''
    const matches = style.match(/background-image:\s*url\(['"]?([^'")]+)['"]?\)/gi)
    if (matches) {
      for (let j = 0; j < matches.length; j++) {
        const m = matches[j]
        const url = m.match(/url\(['"]?([^'")]+)['"]?\)/i)?.[1]
        if (url) urls.add(resolveUrl(url, baseUrl))
      }
    }
  }

  // Stylesheets
  const linkElements = $('link[rel="stylesheet"]').get()
  for (let i = 0; i < linkElements.length; i++) {
    const el = linkElements[i]
    const href = $(el).attr('href')
    if (href && !href.includes('fonts.googleapis.com')) {
      urls.add(resolveUrl(href, baseUrl))
    }
  }

  return Array.from(urls)
}

/**
 * Download and upload a single asset
 */
async function downloadAndUploadAsset(
  url: string,
  baseUrl: string,
  payload: Awaited<ReturnType<typeof getPayload>>,
  user: any
): Promise<{ originalUrl: string; newUrl: string } | null> {
  try {
    const absoluteUrl = resolveUrl(url, baseUrl)
    const buffer = await downloadAsset(absoluteUrl)
    if (!buffer) return null

    const fileName = getFileName(absoluteUrl)
    const mimeType = getMimeType(absoluteUrl, 'image/jpeg')
    const alt = `Imported asset from ${absoluteUrl}`

    const result = await uploadToMedia(payload, fileName, buffer, mimeType, `Imported asset from ${absoluteUrl}`, user)
    if (result) {
      return { originalUrl: url, newUrl: result.url }
    }
    return null
  } catch (error) {
    console.warn(`Failed to process asset ${url}:`, error)
    return null
  }
}

/**
 * Process all assets in HTML content
 * Downloads external assets, uploads to media, returns mapping of original URL -> new URL
 */
export async function processAssets(
  html: string,
  baseUrl: string,
  user: any,
  payload: Awaited<ReturnType<typeof getPayload>>
): Promise<{ html: string; assetMap: Map<string, string> }> {
  const $ = cheerio.load(html) as any
  const assetMap = new Map<string, string>()

  // Collect all asset URLs
  const assetUrls = collectAssetUrls($, 'http://localhost')

  // Download and upload all assets in parallel
  const results = await Promise.all(
    assetUrls.map(url => downloadAndUploadAsset(url, 'http://localhost', payload, user))
  )

  // Build asset map
  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    if (result) {
      assetMap.set(result.originalUrl, result.newUrl)
    }
  }

  // Rewrite URLs in HTML
  const processedHtml = rewriteHtmlUrls($, assetMap)

  return { html: processedHtml, assetMap }
}

/**
 * Rewrite URLs in HTML to use new asset URLs
 */
function rewriteHtmlUrls($: any, assetMap: Map<string, string>): string {
  // Images
  const imgElements = $('img').get()
  for (let i = 0; i < imgElements.length; i++) {
    const el = imgElements[i]
    const $el = $(el)
    const src = $el.attr('src') || $el.attr('data-src')
    if (src && assetMap.has(src)) {
      $el.attr('src', assetMap.get(src)!)
    }
    const srcset = $el.attr('srcset')
    if (srcset) {
      const parts = srcset.split(',')
      const newParts = []
      for (let k = 0; k < parts.length; k++) {
        const s = parts[k]
        const [url, ...rest] = s.trim().split(' ')
        const newUrl = assetMap.get(url) || url
        newParts.push([newUrl, ...rest].join(' '))
      }
      $el.attr('srcset', newParts.join(', '))
    }
  }

  // Background images
  const bgElements = $($('[style*="background-image"]').get())
  for (let i = 0; i < bgElements.length; i++) {
    const el = bgElements[i]
    const $el = $(el)
    const style = $el.attr('style') || ''
    let newStyle = style
    const entries = Array.from(assetMap.entries())
    for (let j = 0; j < entries.length; j++) {
      const entry = entries[j]
      const oldUrl = entry[0]
      const newUrl = entry[1]
      newStyle = newStyle.replace(oldUrl, newUrl)
    }
    $el.attr('style', newStyle)
  }

  // Stylesheets
  const linkElements = $('link[rel="stylesheet"]').get()
  for (let i = 0; i < linkElements.length; i++) {
    const el = linkElements[i]
    const $el = $(el)
    const href = $el.attr('href')
    if (href && assetMap.has(href)) {
      $el.attr('href', assetMap.get(href)!)
    }
  }

  return $.html()
}

/**
 * Extract and process Google Fonts
 */
export async function processFonts(
  html: string,
  user: any,
  payload: Awaited<ReturnType<typeof getPayload>>
): Promise<{ html: string; fontMap: Map<string, string> }> {
  const $ = cheerio.load(html) as any
  const fontMap = new Map<string, string>()

  // Extract Google Fonts URLs
  const fontUrls: string[] = []
  const linkElements = $('link[href*="fonts.googleapis.com"]').get()
  for (let i = 0; i < linkElements.length; i++) {
    const el = linkElements[i]
    const href = $(el).attr('href')
    if (href) fontUrls.push(href)
  }

  // Process each font URL
  for (let i = 0; i < fontUrls.length; i++) {
    const fontUrl = fontUrls[i]
    // For now, just keep the original URL - fonts are typically served via CDN
    // In the future, we could download and self-host font files
    fontMap.set(fontUrl, fontUrl)
  }

  return { html: $.html(), fontMap }
}

/**
 * Extract CSS custom properties and theme config
 */
export function extractThemeConfig($: any): Record<string, string> {
  const theme: Record<string, string> = {}

  const styleElements = $('style').get()
  for (let i = 0; i < styleElements.length; i++) {
    const el = styleElements[i]
    const css = $(el).html() || ''
    const rootMatches = css.match(/:root\s*\{([^}]+)\}/g)
    if (rootMatches) {
      for (let j = 0; j < rootMatches.length; j++) {
        const block = rootMatches[j]
        const varMatches = block.match(/--[\w-]+\s*:\s*[^;]+/g)
        if (varMatches) {
          for (let k = 0; k < varMatches.length; k++) {
            const v = varMatches[k]
            const parts = v.split(':')
            const key = parts[0].trim()
            const value = parts.slice(1).join(':').trim()
            if (key && value) theme[key] = value.replace(/;$/, '')
          }
        }
      }
    }
  }

  const rootElements = $(':root, html, body').get()
  for (let i = 0; i < rootElements.length; i++) {
    const el = rootElements[i]
    const style = $(el).attr('style') || ''
    const vars = style.match(/--[\w-]+\s*:\s*[^;]+/g)
    if (vars) {
      for (let j = 0; j < vars.length; j++) {
        const v = vars[j]
        const parts = v.split(':')
        const key = parts[0].trim()
        const value = parts.slice(1).join(':').trim()
        if (key && value) theme[key] = value.replace(/;$/, '')
      }
    }
  }

  return theme
}

