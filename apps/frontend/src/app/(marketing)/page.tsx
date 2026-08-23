'use client'

import React, { useEffect, useState, useCallback, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { EditToolbar } from '@/components/EditToolbar'
import { SectionEditor } from '@/components/SectionEditor'
import { ContentPanel } from '@/components/ContentPanel'
import { getTemplateConfig, getTemplateTheme } from '@/lib/template-registry'

const GrapejsEditor = dynamic(() => import('@/components/GrapejsEditor').then(m => m.GrapejsEditor), {
  ssr: false,
  loading: () => (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20000, background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#FF6600', marginBottom: '16px', display: 'block' }} />
        <div style={{ fontSize: '14px' }}>Loading Page Builder...</div>
      </div>
    </div>
  ),
})

interface Section {
  blockType: string
  [key: string]: any
}

// Normalize DB theme keys (--primary, --dark) to camelCase (primary, dark)
function normalizeTheme(raw: any): any {
  if (!raw || typeof raw !== 'object') return raw
  const out: any = { ...raw }
  const keyMap: Record<string, string> = {
    '--primary': 'primary', '--primary-hover': 'primaryHover', '--dark': 'dark',
    '--dark-2': 'dark2', '--dark-3': 'dark3', '--light': 'light', '--white': 'white',
    '--gray': 'gray', '--border': 'border', '--font-body': 'fontBody',
    '--font-heading': 'fontHeading', '--border-radius': 'borderRadius', '--spacing': 'spacing',
  }
  for (const [dbKey, camelKey] of Object.entries(keyMap)) {
    if (out[dbKey] !== undefined) {
      out[camelKey] = out[dbKey]
      delete out[dbKey]
    }
  }
  return out
}

function extractTemplateContent(html: string): { styles: string; content: string } {
  let styles = ''
  let content = html

  // Extract <style> tags (including inlined template CSS)
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi
  let match
  while ((match = styleRegex.exec(html)) !== null) {
    styles += match[1] + '\n'
  }

  // Extract content between <body> and </body>
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  if (bodyMatch) {
    content = bodyMatch[1]
  }

  // Keep the template's own header and footer — they are part of the design
  // Only strip boilerplate tags
  content = content.replace(/<!DOCTYPE[^>]*>/gi, '')
  content = content.replace(/<html[^>]*>/gi, '')
  content = content.replace(/<\/html>/gi, '')
  content = content.replace(/<head[\s\S]*?<\/head>/gi, '')
  content = content.replace(/<meta[^>]*>/gi, '')
  content = content.replace(/<title>[^<]*<\/title>/gi, '')
  content = content.replace(/<link[^>]*>/gi, '')
  content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  content = content.replace(/<script[^>]*\/>/gi, '')

  return { styles: styles.trim(), content: content.trim() }
}

interface Page {
  id: string
  title: string
  slug: string
  sections: Section[]
}

function Header({ editMode, toolbarHeight, theme }: { editMode?: boolean; toolbarHeight?: number; theme?: any }) {
  const headerTop = editMode && toolbarHeight ? toolbarHeight : 0
  const logoLight = theme?.logoLight
  const logoDark = theme?.logoDark
  return (
    <header
      className="header"
      id="header"
      style={{
        top: headerTop,
      }}
    >
      <div className="container">
        <a href="/" className="logo">
          {(logoLight || logoDark) ? (
            <>
              {logoLight && <img src={logoLight} alt="Logo" className="logo-light" style={{ maxHeight: '40px' }} />}
              {logoDark && <img src={logoDark} alt="Logo" className="logo-dark" style={{ maxHeight: '40px' }} />}
            </>
          ) : (
            <div className="logo-icon"><i className="fas fa-rocket"></i></div>
          )}
          <span>Perissos</span>
        </a>
        <nav className="nav" id="nav">
          <a href="#hero" className="nav-link">Home</a>
          <a href="#services" className="nav-link">Services</a>
          <a href="#about" className="nav-link">About</a>
          <a href="#portfolio" className="nav-link">Portfolio</a>
          <a href="#blog" className="nav-link">Blog</a>
          <a href="#contact" className="nav-link">Contact</a>
        </nav>
        <div className="header-actions">
          <a href="#contact" className="btn btn-primary">Get Started</a>
          <button className="hamburger" id="hamburger" aria-label="Toggle navigation">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <a href="/" className="logo">
                <div className="logo-icon"><i className="fas fa-rocket"></i></div>
                <span>Perissos</span>
              </a>
              <p className="footer-desc">We are a full-service digital agency dedicated to helping businesses grow through innovative technology solutions.</p>
              <div className="contact-socials">
                <a href="#" className="contact-social"><i className="fab fa-facebook-f"></i></a>
                <a href="#" className="contact-social"><i className="fab fa-twitter"></i></a>
                <a href="#" className="contact-social"><i className="fab fa-instagram"></i></a>
                <a href="#" className="contact-social"><i className="fab fa-linkedin-in"></i></a>
              </div>
            </div>
            <div>
              <h4 className="footer-title">Quick Links</h4>
              <ul className="footer-links">
                <li><a href="#about"><i className="fas fa-chevron-right"></i> About Us</a></li>
                <li><a href="#services"><i className="fas fa-chevron-right"></i> Services</a></li>
                <li><a href="#portfolio"><i className="fas fa-chevron-right"></i> Portfolio</a></li>
                <li><a href="#blog"><i className="fas fa-chevron-right"></i> Blog</a></li>
                <li><a href="#contact"><i className="fas fa-chevron-right"></i> Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="footer-title">Services</h4>
              <ul className="footer-links">
                <li><a href="#services"><i className="fas fa-chevron-right"></i> Web Development</a></li>
                <li><a href="#services"><i className="fas fa-chevron-right"></i> Mobile Apps</a></li>
                <li><a href="#services"><i className="fas fa-chevron-right"></i> UI/UX Design</a></li>
                <li><a href="#services"><i className="fas fa-chevron-right"></i> Digital Marketing</a></li>
                <li><a href="#services"><i className="fas fa-chevron-right"></i> AI Solutions</a></li>
              </ul>
            </div>
            <div>
              <h4 className="footer-title">Contact Info</h4>
              <div className="footer-contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <p>123 Digital Street, Tech City, TC 12345</p>
              </div>
              <div className="footer-contact-item">
                <i className="fas fa-phone"></i>
                <p>+1 (555) 123-4567</p>
              </div>
              <div className="footer-contact-item">
                <i className="fas fa-envelope"></i>
                <p>hello@perissos.dev</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p className="footer-copy">&copy; {new Date().getFullYear()} Perissos. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

function highlightTitle(title: string, highlight: string | undefined) {
  if (!highlight || !title.includes(highlight)) return title
  const parts = title.split(highlight)
  return (
    <>
      {parts[0]}
      <span>{highlight}</span>
      {parts.slice(1).join(highlight)}
    </>
  )
}

function renderSection(section: Section, index: number, templateCategory: string = 'digital-agency') {
  const template = getTemplateConfig(templateCategory)
  const Renderer = template.sections[section.blockType]
  
  if (!Renderer) {
    console.warn(`No renderer for blockType: ${section.blockType} in template ${templateCategory}`)
    return (
      <div key={index} className="section-unknown" data-missing={section.blockType}>
        <p>Unknown section type: {section.blockType}</p>
      </div>
    )
  }
  
  return <Renderer key={index} section={section} />
}

export default function LandingPage() {
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [pageId, setPageId] = useState<string | null>(null)
  const [pageSlug, setPageSlug] = useState('home')
  const [isEditing, setIsEditing] = useState(false)
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [toolbarHeight, setToolbarHeight] = useState(60)
  const [theme, setTheme] = useState<any>(null)
  const [renderedHtml, setRenderedHtml] = useState<string | null>(null)
  const [showContentPanel, setShowContentPanel] = useState(false)
  const [showPageBuilder, setShowPageBuilder] = useState(false)
  const [projectData, setProjectData] = useState<any>(null)
  const [cssVariableMapping, setCssVariableMapping] = useState<Record<string, string[]>>({})
  const [templateSections, setTemplateSections] = useState<string[]>([])
  const [templateSectionDefs, setTemplateSectionDefs] = useState<Record<string, any>>({})
  const [templateCategory, setTemplateCategory] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('perissos-template-category') || 'digital-agency'
    }
    return 'digital-agency'
  })

  const cmsUrl = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3000'

  // Load CSS variable mapping, sections, and section definitions from template layoutConfig
  useEffect(() => {
    if (!templateCategory) return
    fetch(`${cmsUrl}/api/templates?where[category][equals]=${templateCategory}&depth=1`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const template = data.docs?.[0]
        const layoutConfig = template?.layoutConfig
        if (layoutConfig?.cssVariableMapping) {
          setCssVariableMapping(layoutConfig.cssVariableMapping)
        }
        if (layoutConfig?.sections) {
          setTemplateSections(layoutConfig.sections)
        }
        if (layoutConfig?.sectionDefinitions) {
          setTemplateSectionDefs(layoutConfig.sectionDefinitions)
        }
      })
      .catch(() => {})
  }, [templateCategory, cmsUrl])

  useEffect(() => {
    const fetchCmsUrl = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3000'
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    fetch(`${fetchCmsUrl}/api/pages?where%5Bslug%5D%5Bequals%5D=home&depth=1`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: any) => {
        if (data.docs?.[0]) {
          const doc = data.docs[0]
          setPageId(doc.id)
          setPageSlug(doc.slug || 'home')
    if (doc.theme) setTheme(normalizeTheme(doc.theme))
          if (doc.template?.category) setTemplateCategory(doc.template.category)
          if (doc.renderedHtml) setRenderedHtml(doc.renderedHtml)
          if (doc.projectData) setProjectData(doc.projectData)

          // Use page sections if available, otherwise fall back to template layoutConfig.sectionContents
          if (doc.sections && doc.sections.length > 0) {
            setSections(doc.sections)
          } else if (doc.template?.id) {
            fetch(`${fetchCmsUrl}/api/templates/${doc.template.id}?depth=1`, { credentials: 'include' })
              .then(res => res.json())
              .then(tmplData => {
                const lc = tmplData?.layoutConfig
                if (lc?.sectionContents) {
                  const secs = lc.sectionContents
                    .filter((s: any) => !['footer', 'header'].includes(s.type))
                    .map((s: any, i: number) => {
                      const bt = s.blockType || s.type
                      const p = s.props || s
                      return { ...p, blockType: bt, _order: i, _path: `root.${i}` }
                    })
                  setSections(secs)
                }
              })
              .catch(() => {})
          }
        }
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
      .finally(() => {
        clearTimeout(timeoutId)
      })
  }, [])

  // Shared: process page data and resolve template sectionContents if needed
  const processPageData = (doc: any) => {
    setPageId(doc.id)
    setPageSlug(doc.slug || 'home')
    if (doc.theme) setTheme(doc.theme)
    if (doc.template?.category) setTemplateCategory(doc.template.category)
    if (doc.renderedHtml) setRenderedHtml(doc.renderedHtml)
    else setRenderedHtml(null)
    if (doc.projectData) setProjectData(doc.projectData)

    if (doc.sections && doc.sections.length > 0) {
      setSections(doc.sections)
    } else if (doc.template?.id) {
      const fetchCmsUrl = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3000'
      fetch(`${fetchCmsUrl}/api/templates/${doc.template.id}?depth=1`, { credentials: 'include' })
        .then(res => res.json())
        .then(tmplData => {
          const lc = tmplData?.layoutConfig
          if (lc?.sectionContents) {
            const secs = lc.sectionContents
              .filter((s: any) => !['footer', 'header'].includes(s.type))
              .map((s: any, i: number) => {
                const bt = s.blockType || s.type
                const p = s.props || s
                return { ...p, blockType: bt, _order: i, _path: `root.${i}` }
              })
            setSections(secs)
          }
        })
        .catch(() => {})
    }
  }

  // Re-fetch page data when tab becomes visible (after template switch in backoffice)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const fetchCmsUrl = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3000'
        fetch(`${fetchCmsUrl}/api/pages?where%5Bslug%5D%5Bequals%5D=home&depth=1`)
          .then((res) => res.json())
          .then((data: any) => {
            if (data.docs?.[0]) processPageData(data.docs[0])
          })
          .catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Lightweight poll: check template change every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      const fetchCmsUrl = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3000'
      fetch(`${fetchCmsUrl}/api/pages?where%5Bslug%5D%5Bequals%5D=home&depth=1`)
        .then((res) => res.json())
        .then((data: any) => {
          if (data.docs?.[0]) processPageData(data.docs[0])
        })
        .catch(() => {})
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  // Inject template CSS from renderedHtml into <head> for proper cascade
  // This ensures template styles ALWAYS win over Tailwind preflight
  useEffect(() => {
    if (typeof window === 'undefined') return

    // FULL CLEANUP of previous template's injected styles
    const linkEl = document.getElementById('template-css')
    if (linkEl) linkEl.remove()
    const oldStyle = document.getElementById('template-rendered-css')
    if (oldStyle) oldStyle.remove()

    // Clear ALL old inline CSS variables on <html> from previous template
    const root = document.documentElement
    const propsToRemove: string[] = []
    for (let i = 0; i < root.style.length; i++) {
      const prop = root.style.item(i)
      if (prop.startsWith('--')) propsToRemove.push(prop)
    }
    propsToRemove.forEach(prop => root.style.removeProperty(prop))

    // Clear ALL body inline styles from previous template
    document.body.style.background = ''
    document.body.style.color = ''
    document.body.style.fontFamily = ''

    if (!renderedHtml) {
      // Path B: load template-specific CSS file
      if (templateCategory) {
        let newLink = document.getElementById('template-css') as HTMLLinkElement
        if (!newLink) {
          newLink = document.createElement('link')
          newLink.id = 'template-css'
          newLink.rel = 'stylesheet'
          document.head.appendChild(newLink)
        }
        newLink.href = templateCategory === 'restaurant' ? '/styles/restaurant.css' : '/styles/digital-agency.css'
      }
      return
    }

    // Helper: resolve var() references from the root's inline properties
    const resolveVar = (value: string): string | null => {
      const varRef = value.match(/var\(\s*--([^)]+)\s*\)/)
      if (varRef) {
        const resolved = root.style.getPropertyValue(`--${varRef[1]}`).trim()
        if (resolved) return resolved
      }
      return null
    }

    // Path A: extract all CSS from renderedHtml <style> tags and inject into <head>
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi
    let allStyles = ''
    let match
    while ((match = styleRegex.exec(renderedHtml)) !== null) {
      allStyles += match[1] + '\n'
    }

    if (allStyles) {
      const styleEl = document.createElement('style')
      styleEl.id = 'template-rendered-css'
      styleEl.textContent = allStyles
      document.head.appendChild(styleEl)
    }

    // Apply template :root CSS variables as inline styles on <html>
    const rootStyleMatch = allStyles.match(/:root\s*\{([\s\S]*?)\}/)
    if (rootStyleMatch) {
      const varRegex = /--([a-zA-Z0-9_-]+)\s*:\s*([^;]+)/g
      let vMatch
      while ((vMatch = varRegex.exec(rootStyleMatch[1])) !== null) {
        root.style.setProperty(`--${vMatch[1]}`, vMatch[2].trim())
      }
    }

    // Extract body properties and resolve var() references
    const bodyBlock = allStyles.match(/body\s*\{([^}]*)\}/)?.[1] || ''

    const bgMatch = bodyBlock.match(/background\s*:\s*([^;]+)/)
    if (bgMatch) {
      const raw = bgMatch[1].trim()
      document.body.style.background = resolveVar(raw) || raw
    }

    const colorMatch = bodyBlock.match(/(?<![\w-])color\s*:\s*([^;]+)/)
    if (colorMatch) {
      const raw = colorMatch[1].trim()
      document.body.style.color = resolveVar(raw) || raw
    }

    const fontMatch = bodyBlock.match(/font-family\s*:\s*([^;]+)/)
    if (fontMatch) {
      const raw = fontMatch[1].trim()
      document.body.style.fontFamily = resolveVar(raw) || raw
    }
  }, [renderedHtml, templateCategory])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.body.className = `${templateCategory}-template`
      localStorage.setItem('perissos-template-category', templateCategory)
    }
  }, [templateCategory])
  useEffect(() => {
    fetch(`${cmsUrl}/api/users/me`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setIsEditing(true)
        }
      })
      .catch(() => {})
  }, [cmsUrl])

  const handleSectionSave = useCallback((sectionIndex: number, updatedSection: any) => {
    const newSections = [...sections]
    newSections[sectionIndex] = updatedSection
    setSections(newSections)
  }, [sections])

  const handleThemeChange = useCallback((newTheme: any) => {
    setTheme(newTheme)
    // Inject CSS variables using template-specific mapping
    if (typeof window !== 'undefined' && cssVariableMapping) {
      const root = document.documentElement
      const themeKeyToValue: Record<string, string> = {
        primary: newTheme.primary || '',
        primaryHover: newTheme.primaryHover || '',
        dark: newTheme.dark || '',
        light: newTheme.light || newTheme.white || '',
        white: newTheme.white || '',
        gray: newTheme.gray || '',
        border: newTheme.border || '',
        fontBody: newTheme.fontBody || '',
        fontHeading: newTheme.fontHeading || '',
      }
      for (const [themeKey, cssVars] of Object.entries(cssVariableMapping)) {
        const value = themeKeyToValue[themeKey]
        if (value) {
          for (const cssVar of cssVars) {
            root.style.setProperty(cssVar, value)
          }
        }
      }
    }
  }, [cssVariableMapping])

  const handleSaveAll = useCallback(async () => {
    if (!pageId) return
    setIsSaving(true)
    try {
      // Save theme and sections separately so sections validation errors don't block theme save
      await Promise.all([
        fetch(`${cmsUrl}/api/pages/${pageId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ theme }),
        }),
        fetch(`${cmsUrl}/api/pages/${pageId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ sections }),
        }),
      ])
    } catch (err) {
      console.error('Save failed:', err)
    } finally {
      setIsSaving(false)
    }
  }, [pageId, sections, theme, cmsUrl])

  const handlePageBuilderSave = useCallback(async (newProjectData: any, newRenderedHtml: string) => {
    if (!pageId) return
    try {
       await fetch(`${cmsUrl}/api/pages/${pageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          projectData: newProjectData,
          renderedHtml: newRenderedHtml,
        }),
      })
      setProjectData(newProjectData)
      setRenderedHtml(newRenderedHtml)

      // Notify parent to update sections if needed
      // The sections data from Payload's blocks field is the source of truth
      // Any changes from GrapeJS should be reflected back in the blocks field
    } catch (err) {
      console.error('Page Builder save failed:', err)
    }
  }, [pageId, cmsUrl])

  // Apply theme to CSS variables for ALL users (not just logged in)
  // Theme is always camelCase after normalization
  useEffect(() => {
    if (theme) {
      const root = document.documentElement
      // Set all camelCase keys as --kebab CSS vars
      const keyToVar: Record<string, string> = {
        primary: '--primary', primaryHover: '--primary-hover', dark: '--dark',
        dark2: '--dark-2', dark3: '--dark-3', light: '--light', white: '--white',
        gray: '--gray', border: '--border', fontBody: '--font-body',
        fontHeading: '--font-heading', borderRadius: '--border-radius', spacing: '--spacing',
      }
      for (const [camelKey, cssVar] of Object.entries(keyToVar)) {
        if (theme[camelKey]) root.style.setProperty(cssVar, theme[camelKey])
      }
      // Template-specific CSS variables from layoutConfig mapping
      if (cssVariableMapping) {
        const themeKeyToValue: Record<string, string> = {
          primary: theme.primary || '',
          primaryHover: theme.primaryHover || '',
          dark: theme.dark || '',
          light: theme.light || theme.white || '',
          white: theme.white || '',
          gray: theme.gray || '',
          border: theme.border || '',
          fontBody: theme.fontBody || '',
          fontHeading: theme.fontHeading || '',
        }
        for (const [themeKey, cssVars] of Object.entries(cssVariableMapping)) {
          const value = themeKeyToValue[themeKey]
          if (value) {
            for (const cssVar of cssVars) {
              root.style.setProperty(cssVar, value)
            }
          }
        }
      }
    }
  }, [theme, cssVariableMapping])

  // Click-to-edit overlays on rendered HTML sections
  useEffect(() => {
    if (!isEditing || !renderedHtml || sections.length === 0) return

    const timer = setTimeout(() => {
      // Map HTML section IDs to sections array indices
      const idToBlockType: Record<string, string> = {
        hero: 'hero', services: 'services', about: 'about',
        'why-us': 'whyUs', team: 'team', portfolio: 'portfolio',
        blog: 'blog', pricing: 'pricing', contact: 'contact',
        'cta': 'cta', menu: 'menu', specials: 'specials',
        gallery: 'gallery', testimonials: 'testimonials', 'menu-highlights': 'menuHighlights',
        reservation: 'reservation',
      }

      // Find all section elements and add overlays
      const sectionEls = document.querySelectorAll('section[id]')
      sectionEls.forEach((el) => {
        const sectionId = el.id
        const blockType = idToBlockType[sectionId] || sectionId
        const sectionIndex = sections.findIndex(s => s.blockType === blockType)
        if (sectionIndex === -1) return

        // Don't add duplicate overlays
        if ((el as HTMLElement).dataset.editOverlay === 'true') return
        ;(el as HTMLElement).dataset.editOverlay = 'true'

        // Make section relative for overlay positioning
        const pos = getComputedStyle(el).position
        if (pos === 'static') (el as HTMLElement).style.position = 'relative'

        // Create overlay
        const overlay = document.createElement('div')
        overlay.className = 'section-edit-overlay'
        overlay.dataset.sectionIndex = String(sectionIndex)
        overlay.style.cssText = `
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          z-index: 50; cursor: pointer; pointer-events: none;
          transition: all 0.2s ease;
        `

        // Label that appears on hover
        const label = document.createElement('div')
        label.className = 'section-edit-label'
        label.innerHTML = `<i class="fas fa-edit" style="margin-right:6px;"></i>Edit ${blockType}`
        label.style.cssText = `
          position: absolute; top: 8px; right: 8px;
          background: rgba(255,102,0,0.9); color: #fff;
          padding: 6px 14px; border-radius: 6px;
          font-size: 12px; font-weight: 600; font-family: 'DM Sans', sans-serif;
          opacity: 0; transition: opacity 0.2s ease;
          pointer-events: none; display: flex; align-items: center; gap: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        `
        overlay.appendChild(label)

        // Hover events
        overlay.addEventListener('mouseenter', () => {
          overlay.style.pointerEvents = 'auto'
          overlay.style.background = 'rgba(255,102,0,0.06)'
          overlay.style.outline = '2px solid rgba(255,102,0,0.5)'
          overlay.style.outlineOffset = '-2px'
          label.style.opacity = '1'
        })
        overlay.addEventListener('mouseleave', () => {
          overlay.style.pointerEvents = 'none'
          overlay.style.background = 'transparent'
          overlay.style.outline = 'none'
          label.style.opacity = '0'
        })

        // Click handler — open SectionEditor directly
        overlay.addEventListener('click', (e) => {
          e.preventDefault()
          e.stopPropagation()
          setSelectedSectionIndex(sectionIndex)
        })

        el.appendChild(overlay)
      })
    }, 500) // Wait for HTML to render

    return () => {
      clearTimeout(timer)
      // Clean up overlays
      document.querySelectorAll('.section-edit-overlay').forEach(o => o.remove())
      document.querySelectorAll('section[data-edit-overlay]').forEach(el => {
        delete (el as HTMLElement).dataset.editOverlay
      })
    }
  }, [isEditing, renderedHtml, sections])

  useEffect(() => {
    if (loading || sections.length === 0) return

    const handleScroll = () => {
      const header = document.getElementById('header')
      if (header) {
        if (window.scrollY > 50) {
          header.classList.add('scrolled')
        } else {
          header.classList.remove('scrolled')
        }
      }
    }

    const handleSmoothScroll = (e: Event) => {
      const target = e.target as HTMLAnchorElement
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault()
        const id = target.getAttribute('href')?.slice(1)
        const element = document.getElementById(id || '')
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
    }

    const handleHamburger = () => {
      const nav = document.getElementById('nav')
      if (nav) {
        nav.classList.toggle('active')
      }
    }

    window.addEventListener('scroll', handleScroll)
    document.addEventListener('click', handleSmoothScroll)

    const hamburger = document.getElementById('hamburger')
    if (hamburger) {
      hamburger.addEventListener('click', handleHamburger)
    }

    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('click', handleSmoothScroll)
      if (hamburger) {
        hamburger.removeEventListener('click', handleHamburger)
      }
    }
  }, [loading, sections])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600" />
      </div>
    )
  }

  // Render the actual template HTML in both view and edit mode
  // This ensures the Food Express design is always shown correctly
  if (renderedHtml) {
    const extracted = extractTemplateContent(renderedHtml)
    return (
      <>
        {isEditing && (
          <EditToolbar
            pageId={pageId}
            pageSlug={pageSlug}
            onSave={handleSaveAll}
            isSaving={isSaving}
            onHeightChange={setToolbarHeight}
            theme={theme}
            onThemeChange={handleThemeChange}
            onOpenContent={() => setShowContentPanel(true)}
            onOpenPageBuilder={() => setShowPageBuilder(true)}
            templateCategory={templateCategory}
            cssVariableMapping={cssVariableMapping}
          />
        )}
        {isEditing && (
          <style dangerouslySetInnerHTML={{ __html: `#masthead, header.header, header#header { top: ${toolbarHeight}px !important; }` }} />
        )}
        {extracted.styles && (
          <style dangerouslySetInnerHTML={{ __html: extracted.styles }} />
        )}
        <div dangerouslySetInnerHTML={{ __html: extracted.content }} />

        {/* Content Editor Panel */}
        <ContentPanel
          isOpen={showContentPanel}
          onClose={() => setShowContentPanel(false)}
          sections={sections}
          pageId={pageId}
          cmsUrl={cmsUrl}
          onSectionsChange={setSections}
          templateCategory={templateCategory}
          sectionDefs={templateSectionDefs}
        />

        {/* Page Builder (GrapeJS) */}
        {showPageBuilder && (
          <GrapejsEditor
            pageId={pageId}
            cmsUrl={cmsUrl}
            initialProjectData={projectData}
            initialRenderedHtml={renderedHtml}
            theme={theme}
            templateCategory={templateCategory}
            templateSections={templateSections}
            templateSectionDefs={templateSectionDefs}
            cssVariableMapping={cssVariableMapping}
            onSave={handlePageBuilderSave}
            onClose={() => setShowPageBuilder(false)}
          />
        )}
      </>
    )
  }

  // Fallback: React sections (when no renderedHtml exists)
  return (
    <>
      <main className="relative">
      {/* Edit Mode Toolbar */}
      {isEditing && (
        <EditToolbar
          pageId={pageId}
          pageSlug={pageSlug}
          onSave={handleSaveAll}
          isSaving={isSaving}
          onHeightChange={setToolbarHeight}
          theme={theme}
          onThemeChange={handleThemeChange}
          onOpenContent={() => setShowContentPanel(true)}
          onOpenPageBuilder={() => setShowPageBuilder(true)}
          templateCategory={templateCategory}
          cssVariableMapping={cssVariableMapping}
        />
      )}

      <Header editMode={isEditing} toolbarHeight={toolbarHeight} theme={theme} />
      {sections.length > 0 ? (
        sections.map((section, i) => (
          <div
            key={i}
            data-section-editor
            style={{
              position: 'relative',
              cursor: isEditing ? 'pointer' : 'default',
            }}
            onClick={(e) => {
              if (!isEditing) return
              // Don't trigger if clicking on links or buttons
              const target = e.target as HTMLElement
              if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button')) {
                return
              }
              e.preventDefault()
              e.stopPropagation()
              setSelectedSectionIndex(i)
            }}
            onMouseEnter={(e) => {
              if (!isEditing) return
              const el = e.currentTarget
              const overlay = document.createElement('div')
              overlay.className = 'section-edit-overlay'
              overlay.style.position = 'absolute'
              overlay.style.inset = '0'
              overlay.style.background = 'rgba(255, 102, 0, 0.05)'
              overlay.style.border = '2px dashed rgba(255, 102, 0, 0.4)'
              overlay.style.borderRadius = '8px'
              overlay.style.pointerEvents = 'none'
              overlay.style.zIndex = '10'
              overlay.style.display = 'flex'
              overlay.style.alignItems = 'flex-start'
              overlay.style.justifyContent = 'center'
              overlay.style.paddingTop = '8px'

              const label = document.createElement('span')
              label.style.background = '#FF6600'
              label.style.color = 'white'
              label.style.padding = '4px 12px'
              label.style.borderRadius = '4px'
              label.style.fontSize = '11px'
              label.style.fontWeight = '600'
              label.style.fontFamily = 'DM Sans, sans-serif'
              label.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)'
              label.textContent = 'Click to Edit — ' + section.blockType

              overlay.appendChild(label)
              el.style.position = 'relative'
              el.appendChild(overlay)
            }}
            onMouseLeave={(e) => {
              const overlay = e.currentTarget.querySelector('.section-edit-overlay')
              if (overlay) overlay.remove()
            }}
          >
            {renderSection(section, i, templateCategory)}
          </div>
        ))
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to Perissos</h1>
            <p className="text-gray-600 dark:text-gray-400">Create your first page in the admin panel.</p>
          </div>
        </div>
      )}
      <Footer />

      {/* Section Editor Panel */}
      <SectionEditor
        section={selectedSectionIndex !== null ? sections[selectedSectionIndex] : null}
        sectionIndex={selectedSectionIndex ?? 0}
        isOpen={selectedSectionIndex !== null}
        onClose={() => setSelectedSectionIndex(null)}
        onSave={(updatedSection) => {
          if (selectedSectionIndex !== null) {
            handleSectionSave(selectedSectionIndex, updatedSection)
          }
        }}
      />

      {/* Page Builder (GrapeJS) */}
      {showPageBuilder && (
        <GrapejsEditor
          pageId={pageId}
          cmsUrl={cmsUrl}
          initialProjectData={projectData}
          initialRenderedHtml={renderedHtml}
          theme={theme}
          templateCategory={templateCategory}
          templateSections={templateSections}
          templateSectionDefs={templateSectionDefs}
          cssVariableMapping={cssVariableMapping}
          onSave={handlePageBuilderSave}
          onClose={() => setShowPageBuilder(false)}
        />
      )}
    </main>
    </>
  )
}
