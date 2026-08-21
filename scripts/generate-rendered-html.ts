// Generate renderedHtml for existing templates by inlining CSS/JS from their source files
import { readFileSync, readdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import AdmZip from 'adm-zip'

const root = process.cwd()

function generateFromDir(dirPath: string): string {
  let html = readFileSync(join(dirPath, 'index.html'), 'utf-8')

  // Inline CSS files — skip stubs (<200 chars)
  const cssDir = join(dirPath, 'css')
  try {
    const cssFiles = readdirSync(cssDir).filter(f => f.endsWith('.css'))
    let inlineCSS = ''
    for (const f of cssFiles) {
      const content = readFileSync(join(cssDir, f), 'utf-8')
      if (content.trim().length < 200) continue
      inlineCSS += `\n${content}\n`
    }
    if (inlineCSS) {
      html = html.replace('</head>', `<style id="template-inlined-css">${inlineCSS}</style>\n</head>`)
    }
  } catch {}

  // Inline JS files
  const jsDir = join(dirPath, 'js')
  try {
    const jsFiles = readdirSync(jsDir).filter(f => f.endsWith('.js'))
    let inlineJS = ''
    for (const f of jsFiles) {
      inlineJS += `\n${readFileSync(join(jsDir, f), 'utf-8')}\n`
    }
    if (inlineJS) {
      html = html.replace('</body>', `<script>${inlineJS}</script>\n</body>`)
    }
  } catch {}

  return html
}

function generateFromZip(zipPath: string): string {
  const zip = new AdmZip(zipPath)
  const entries = zip.getEntries()
  const htmlEntry = entries.find(e => !e.isDirectory && e.entryName.toLowerCase().endsWith('index.html'))
  if (!htmlEntry) return ''

  let html = zip.readAsText(htmlEntry.entryName)

  // Inline CSS files — skip stubs (<200 chars) and files already in HTML
  const cssEntries = entries.filter(e => !e.isDirectory && e.entryName.toLowerCase().endsWith('.css'))
  let extraCSS = ''
  for (const cssEntry of cssEntries) {
    try {
      const cssContent = zip.readAsText(cssEntry.entryName)
      if (cssContent.trim().length < 200) continue
      const firstRule = cssContent.trim().substring(0, 50)
      if (html.includes(firstRule)) continue
      extraCSS += `\n${cssContent}\n`
    } catch {}
  }

  const jsEntries = entries.filter(e => !e.isDirectory && e.entryName.toLowerCase().endsWith('.js'))
  let inlineJS = ''
  for (const jsEntry of jsEntries) {
    try { inlineJS += `\n${zip.readAsText(jsEntry.entryName)}\n` } catch {}
  }

  // Inject extra CSS BEFORE first <style> so existing styles take priority
  if (extraCSS) {
    const firstStyle = html.indexOf('<style')
    if (firstStyle > -1) {
      html = html.substring(0, firstStyle) + `<style id="template-extra-css">${extraCSS}</style>\n` + html.substring(firstStyle)
    } else {
      html = html.replace('</head>', `<style id="template-extra-css">${extraCSS}</style>\n</head>`)
    }
  }
  if (inlineJS) {
    html = html.replace('</body>', `<script>${inlineJS}</script>\n</body>`)
  }

  return html
}

// Generate for both templates
const foodExpressHtml = generateFromDir(join(root, 'template/food express'))
const digitalAgencyHtml = generateFromZip(join(root, 'template/digital Agency/digital_agency_test.zip'))

console.log(`Food Express: ${foodExpressHtml.length} chars`)
console.log(`Digital Agency: ${digitalAgencyHtml.length} chars`)

// Write to files for manual SQL update
import { writeFileSync } from 'fs'
writeFileSync('/tmp/food-express-rendered.html', foodExpressHtml)
writeFileSync('/tmp/digital-agency-rendered.html', digitalAgencyHtml)
console.log('Written to /tmp/food-express-rendered.html and /tmp/digital-agency-rendered.html')
