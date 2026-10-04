'use client'

import { useEffect, useMemo, useRef } from 'react'
import { templateRegistry, type TemplateConfig } from '@/lib/template-registry'

interface RenderedHtmlPageProps {
  html: string
  templateName?: string
}

function getTemplateCategory(templateName?: string): string {
  if (!templateName) return 'digital-agency'
  const lower = templateName.toLowerCase()
  if (lower.includes('nexsas') || lower.includes('perissos')) return 'nexsas'
  if (lower.includes('restaurant') || lower.includes('food')) return 'restaurant'
  if (lower.includes('digital') || lower.includes('agency')) return 'digital-agency'
  return 'digital-agency'
}

function extractTemplateContent(html: string): { styles: string; content: string; cssLinks: string[] } {
  let styles = ''
  let content = html
  const cssLinks: string[] = []

  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi
  let match
  while ((match = styleRegex.exec(html)) !== null) {
    styles += match[1] + '\n'
  }

  const linkRegex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi
  let linkMatch
  while ((linkMatch = linkRegex.exec(html)) !== null) {
    cssLinks.push(linkMatch[1])
  }

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  if (bodyMatch) {
    content = bodyMatch[1]
  }

  content = content.replace(/<!DOCTYPE[^>]*>/gi, '')
  content = content.replace(/<html[^>]*>/gi, '')
  content = content.replace(/<\/html>/gi, '')
  content = content.replace(/<head[\s\S]*?<\/head>/gi, '')
  content = content.replace(/<meta[^>]*>/gi, '')
  content = content.replace(/<title>[^<]*<\/title>/gi, '')
  content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  content = content.replace(/<script[^>]*\/>/gi, '')

  return { styles: styles.trim(), content: content.trim(), cssLinks }
}

export function RenderedHtmlPage({ html, templateName }: RenderedHtmlPageProps) {
  const templateCategory = getTemplateCategory(templateName)
  const containerRef = useRef<HTMLDivElement>(null)

  const { styles, content, cssLinks } = useMemo(() => extractTemplateContent(html), [html])

  // Prefer the stylesheet the page HTML already references (self-describing templates).
  // Never fall back to an unrelated template's CSS: an unlayered reset from another
  // template overrides the layered utilities of the page's own stylesheet
  // (e.g. digital-agency.css `* { margin: 0; padding: 0 }` killing nexsas.css layout).
  const embeddedCss = cssLinks.find((href) => /^\/styles\/[\w-]+\.css$/.test(href)) || null
  const embeddedId = embeddedCss ? embeddedCss.replace('/styles/', '').replace(/\.css$/, '') : null
  const effectiveCategory = embeddedId || templateCategory
  const exactConfig: TemplateConfig | undefined = templateRegistry[effectiveCategory]

  // Load template CSS + vendor JS + inject inline styles
  useEffect(() => {
    if (typeof window === 'undefined') return

    // 1. Ensure template CSS is loaded — skip when the page ships its own stylesheet
    if (embeddedCss) {
      const stale = document.getElementById('page-template-css')
      if (stale) stale.remove()
    } else {
      const cssHref = templateRegistry[templateCategory]?.cssPath || '/styles/nexsas.css'
      let cssLink = document.getElementById('page-template-css') as HTMLLinkElement | null
      if (!cssLink) {
        cssLink = document.createElement('link')
        cssLink.id = 'page-template-css'
        cssLink.rel = 'stylesheet'
        document.head.appendChild(cssLink)
      }
      cssLink.href = cssHref
    }

    const theme = exactConfig?.theme

    // 2. Load Google Fonts (only for templates that have a registry entry)
    if (theme) {
      const fontBody = theme.fontBody || 'Inter Tight, sans-serif'
      const fontHeading = theme.fontHeading || 'Space Grotesk, sans-serif'
      const fontFamilies = [
        ...new Set([
          ...fontBody.split(',').map(f => f.trim().replace(/'/g, '').replace(/sans-serif/, '').replace(/serif/, '').trim()),
          ...fontHeading.split(',').map(f => f.trim().replace(/'/g, '').replace(/sans-serif/, '').replace(/serif/, '').trim()),
        ].filter(f => f)),
      ]
      if (fontFamilies.length > 0) {
        const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${fontFamilies.map(f => `${f.replace(/\s+/g, '+')}:wght@400;500;600;700`).join('&family=')}&display=swap`
        let fontsLink = document.getElementById('page-google-fonts') as HTMLLinkElement | null
        if (!fontsLink) {
          fontsLink = document.createElement('link')
          fontsLink.id = 'page-google-fonts'
          fontsLink.rel = 'stylesheet'
          document.head.appendChild(fontsLink)
        }
        fontsLink.href = googleFontsUrl
      }
    } else {
      const staleFonts = document.getElementById('page-google-fonts')
      if (staleFonts) staleFonts.remove()
    }

    // 3. Load vendor JS for animations
    const vendorScripts = [
      '/vendor/gsap.min.js',
      '/vendor/lenis.min.js',
      '/vendor/split-text.min.js',
      '/vendor/springer.min.js',
      '/vendor/scroll-trigger.min.js',
      '/vendor/number-counter.js',
      '/vendor/vanilla-infinite-marquee.min.js',
      '/styles/nexas.js',
    ]
    for (const src of vendorScripts) {
      if (!document.querySelector(`script[src="${src}"]`)) {
        const script = document.createElement('script')
        script.src = src
        script.async = false
        document.body.appendChild(script)
      }
    }

    // 4. Apply template CSS variables
    const root = document.documentElement
    if (theme) {
      const keyToVar: Record<string, string> = {
        primary: '--primary', primaryHover: '--primary-hover', dark: '--dark',
        light: '--light', white: '--white', gray: '--gray', border: '--border',
        fontBody: '--font-body', fontHeading: '--font-heading',
      }
      for (const [key, cssVar] of Object.entries(keyToVar)) {
        if (theme[key as keyof typeof theme]) {
          root.style.setProperty(cssVar, theme[key as keyof typeof theme] as string)
        }
      }
    }

    // 5. Set body class
    document.body.className = `${effectiveCategory}-template`

    return () => {
      // Cleanup on unmount
      const link = document.getElementById('page-template-css')
      if (link) link.remove()
      const fonts = document.getElementById('page-google-fonts')
      if (fonts) fonts.remove()
    }
  }, [templateCategory, embeddedCss, effectiveCategory, exactConfig])

  return (
    <>
      {styles && <style dangerouslySetInnerHTML={{ __html: styles }} />}
      {cssLinks.map((link, i) => (
        <link key={`css-link-${i}`} rel="stylesheet" href={link} />
      ))}
      <div ref={containerRef} dangerouslySetInnerHTML={{ __html: content }} />
    </>
  )
}
