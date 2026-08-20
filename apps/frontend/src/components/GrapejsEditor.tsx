'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import DOMPurify from 'dompurify'
import { getTemplateConfig } from '@/lib/template-registry'
import 'grapesjs/dist/css/grapes.min.css'

interface GrapejsEditorProps {
  pageId: string | null
  cmsUrl: string
  initialProjectData?: any
  initialRenderedHtml?: string | null
  theme?: any
  templateCategory?: string
  templateSections?: string[]
  templateSectionDefs?: Record<string, { label: string; icon: string; fields: Array<{ name: string; label: string; type: string; help?: string; itemFields?: Array<{ name: string; label: string; type: string }> }> }>
  cssVariableMapping?: Record<string, string[]>
  onSave?: (projectData: any, renderedHtml: string) => void
  onClose?: () => void
}

export function GrapejsEditor({
  pageId,
  cmsUrl,
  initialProjectData,
  initialRenderedHtml,
  theme,
  templateCategory,
  templateSections,
  templateSectionDefs,
  cssVariableMapping,
  onSave,
  onClose,
}: GrapejsEditorProps) {
  const editorRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLTextAreaElement>(null)
  const [isReady, setIsReady] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [chatPrompt, setChatPrompt] = useState('')
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([])
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (!containerRef.current || editorRef.current) return

    let cancelled = false

    const initEditor = async () => {
      const grapesjs = (await import('grapesjs')).default
      const gjsPresetWebpage = (await import('grapesjs-preset-webpage')).default
      const gjsPluginForms = (await import('grapesjs-plugin-forms')).default

      if (cancelled || !containerRef.current) return

      const templateConfig = getTemplateConfig(templateCategory || 'digital-agency')
      const templateCssUrl = templateConfig?.cssPath || '/styles/digital-agency.css'
      const templateFontBody = templateConfig?.theme?.fontBody || 'DM Sans, sans-serif'
      const templateFontHeading = templateConfig?.theme?.fontHeading || 'Plus Jakarta Sans, sans-serif'
      const fontFamilies = [
        ...new Set([
          ...templateFontBody.split(',').map(f => f.trim().replace(/'/g, '').replace(/sans-serif/, '').replace(/serif/, '').trim()),
          ...templateFontHeading.split(',').map(f => f.trim().replace(/'/g, '').replace(/sans-serif/, '').replace(/serif/, '').trim()),
        ].filter(f => f)),
      ]
      const googleFontsUrl = fontFamilies.length > 0
        ? `https://fonts.googleapis.com/css2?family=${fontFamilies.map(f => `${f.replace(/\s+/g, '+')}:wght@400;500;600;700`).join('&family=').replace(/&family=/, '')}&display=swap`
        : null
      const canvasStyles = [
        'https://unpkg.com/grapesjs/dist/css/grapes.min.css',
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
        templateCssUrl,
      ]
      if (googleFontsUrl) canvasStyles.push(googleFontsUrl)

      const editor = grapesjs.init({
        container: containerRef.current,
        height: '100%',
        width: '100%',
        storageManager: false,
        plugins: [gjsPresetWebpage, gjsPluginForms],
        pluginsOpts: {
          [gjsPresetWebpage as any]: {
            formsOpts: false,
          },
        },
        canvas: {
          styles: canvasStyles,
        },
        deviceManager: {
          devices: [
            { name: 'Desktop', width: '' },
            { name: 'Tablet', width: '768px', widthMedia: '992px' },
            { name: 'Mobile', width: '375px', widthMedia: '480px' },
          ],
        },
      });

      if (cancelled) {
        editor.destroy()
        return
      }

      editorRef.current = editor

      registerBlocks(editor, templateSections, templateSectionDefs)

      let extractedStyles = ''
      if (initialRenderedHtml) {
        const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi
        let match
        while ((match = styleRegex.exec(initialRenderedHtml)) !== null) {
          extractedStyles += match[1] + '\n'
        }
      }

      const injectAllStyles = () => {
        const canvasDoc = editor.Canvas.getDocument?.()
        if (!canvasDoc) return
        const head = canvasDoc.head || canvasDoc.getElementsByTagName('head')[0]
        if (!head) return

        // 1. Inject restaurant.css, digital-agency.css as base stylesheets
        const baseSheets = [
          { id: 'gjs-restaurant-css', href: '/styles/restaurant.css' },
          { id: 'gjs-digital-css', href: '/styles/digital-agency.css' },
        ]
        for (const sheet of baseSheets) {
          if (!canvasDoc.getElementById(sheet.id)) {
            const linkEl = canvasDoc.createElement('link')
            linkEl.id = sheet.id
            linkEl.rel = 'stylesheet'
            linkEl.href = sheet.href
            head.appendChild(linkEl)
          }
        }

        // 2. Inject Google Fonts
        const fontsUrl = 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Marcellus&family=Open+Sans:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&family=Roboto+Slab:wght@400;500;600;700&display=swap'
        if (!canvasDoc.getElementById('gjs-google-fonts')) {
          const linkEl = canvasDoc.createElement('link')
          linkEl.id = 'gjs-google-fonts'
          linkEl.rel = 'stylesheet'
          linkEl.href = fontsUrl
          head.appendChild(linkEl)
        }

        // 3. Inject Font Awesome
        if (!canvasDoc.getElementById('gjs-fontawesome')) {
          const linkEl = canvasDoc.createElement('link')
          linkEl.id = 'gjs-fontawesome'
          linkEl.rel = 'stylesheet'
          linkEl.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
          head.appendChild(linkEl)
        }

        // 4. Inject template CSS + overrides as a single <style> (LAST — overrides all)
        const overrideCss = `
          /* DO NOT set height:100% on canvas elements — GrapeJS auto-resizes them */
          .gjs-cv-canvas { background: #fff !important; }
          .gjs-cv-canvas-bg { background: #fff !important; }
          .gjs-editor-cont { background: #fff !important; }
          /* Override GrapeJS wrapper defaults */
          [data-gjs-type="wrapper"] { min-height: auto !important; padding-top: 0 !important; }
          body { overflow-x: hidden !important; font-family: 'Open Sans', sans-serif !important; background: #fff !important; margin: 0 !important; padding: 0 !important; }
          img { max-width: 100%; height: auto; display: block; }
          a { text-decoration: none; }
          header#masthead { position: relative !important; background-color: #000 !important; color: #fff !important; z-index: 100 !important; }
          header, .header-inner { background-color: #000 !important; color: #fff !important; }
          .nav-left a, .nav-right a, .header-logo, .hamburger, .center-btn, .submenu a,
          .nav-left a.active, .nav-left a:hover, .nav-right a:hover { color: #fff !important; }
          .nav-left a.active, .nav-left a:hover, .nav-right a:hover { color: #c8a97e !important; }
          .hero, section.hero, .section-heading, .hero-content, .hero-title, .hero-text { color: #fff !important; }
          .hero h1, .hero h2, .hero h3, .hero p, .section-heading h2, .section-heading p { color: #fff !important; }
          .hero-title span, .hero-text span, .restaurant-highlight, .section-heading h2 span { color: #c8a97e !important; }
          .about, .testimonials, .gallery, .features-grid, .offer-card, .rating-info { color: #333 !important; }
          .reservation, .menu, .menu-highlights, .contact, .specials { background-color: #fff !important; color: #333 !important; }
          .reservation-form-wrapper { background-color: #f5f5f5 !important; border: 1px solid #e0e0e0 !important; }
          .footer, .footer-main { background-color: #1a1a1a !important; color: #fff !important; }
          .footer a, .footer h4, .footer p, .footer li { color: #ccc !important; }
          .footer h4 { color: #fff !important; }
          .section-heading h2 { color: #1a1a1a !important; }
          .section-heading h2 span { color: #c8a97e !important; }
          .mobile-menu { display: none !important; }
          section.hero, .hero { padding-top: 40px !important; min-height: auto !important; }
        `
        const existing = canvasDoc.getElementById('gjs-template-merged')
        if (existing) existing.remove()
        const styleEl = canvasDoc.createElement('style')
        styleEl.id = 'gjs-template-merged'
        styleEl.textContent = (extractedStyles || '') + '\n' + overrideCss
        head.appendChild(styleEl)

        // 5. Inject theme CSS variables
        if (theme) {
          injectThemeStyles(editor, theme, cssVariableMapping)
        }

        // 6. Force iframe sizing
        const frameEl = editor.Canvas.getFrameEl?.()
        if (frameEl) {
          frameEl.style.width = '100%'
          frameEl.style.height = '100%'
        }
      }

      const refreshCanvas = () => {
        if (!editorRef.current || cancelled) return
        try {
          // Try editor.refresh() first
          if (typeof editorRef.current.refresh === 'function') {
            editorRef.current.refresh()
          }
          // Also try Canvas.refresh()
          if (typeof editorRef.current.Canvas?.refresh === 'function') {
            editorRef.current.Canvas.refresh()
          }
          // Manual fallback: measure iframe content and resize
          const frameEl = editorRef.current.Canvas?.getFrameEl?.()
          if (frameEl) {
            try {
              const iframeDoc = frameEl.contentDocument || frameEl.contentWindow?.document
              if (iframeDoc) {
                const scrollH = iframeDoc.documentElement.scrollHeight
                if (scrollH > 0) {
                  frameEl.style.height = scrollH + 'px'
                  // Also set the wrapper elements
                  const wrapper = frameEl.closest('.gjs-frame-wrapper')
                  if (wrapper) wrapper.style.height = scrollH + 'px'
                  const frames = frameEl.closest('.gjs-cv-canvas__frames, .gjs-frames')
                  if (frames) frames.style.height = scrollH + 'px'
                  const canvas = frameEl.closest('.gjs-cv-canvas')
                  if (canvas) canvas.style.height = scrollH + 'px'
                }
              }
            } catch (e) {
              // cross-origin — ignore
            }
          }
        } catch (e) {
          // swallow
        }
      }

      // Listen for canvas frame ready — inject styles before content renders
      editor.on('canvas:frame:load', () => {
        if (!cancelled) {
          setTimeout(injectAllStyles, 50)
          setTimeout(refreshCanvas, 200)
          setTimeout(refreshCanvas, 800)
        }
      })

      editor.on('load', () => {
        if (!cancelled) {
          setIsReady(true)
          injectAllStyles()
          // Let GrapeJS auto-resize the canvas after content settles
          setTimeout(refreshCanvas, 200)
          setTimeout(refreshCanvas, 600)
          setTimeout(refreshCanvas, 1200)
        }
      })

      // Now load the content
      if (initialProjectData) {
        editor.loadProjectData(initialProjectData)
        setTimeout(() => { injectAllStyles(); refreshCanvas() }, 300)
        setTimeout(refreshCanvas, 1000)
      } else if (initialRenderedHtml) {
        const bodyMatch = initialRenderedHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
        const htmlNoBody = bodyMatch ? bodyMatch[1] : initialRenderedHtml
        const cleanHtml = DOMPurify.sanitize(htmlNoBody, {
          ADD_TAGS: ['section', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'i', 'span', 'img', 'button', 'br', 'ul', 'li', 'strong', 'em', 'nav', 'header', 'footer', 'form', 'input', 'textarea', 'select', 'option', 'figure', 'figcaption', 'video', 'source'],
          ADD_ATTR: ['class', 'style', 'href', 'src', 'alt', 'id', 'data-*', 'placeholder', 'type', 'value', 'role', 'aria-*'],
        })
        editor.setComponents(cleanHtml)
        // Inject styles and trigger canvas resize after content renders in iframe
        setTimeout(() => { injectAllStyles(); refreshCanvas() }, 200)
        setTimeout(refreshCanvas, 600)
        setTimeout(refreshCanvas, 1500)
        setTimeout(refreshCanvas, 3000)
      }
    }

    initEditor();

    return () => {
        cancelled = true
        if (editorRef.current) {
          editorRef.current.destroy()
          editorRef.current = null
        }
      }
    }, []);

  useEffect(() => {
    if (editorRef.current && theme) {
      injectThemeStyles(editorRef.current, theme, cssVariableMapping)
    }
  }, [theme, cssVariableMapping])

  const handleSave = useCallback(async () => {
    if (!editorRef.current || isSaving) return
    setIsSaving(true)

    try {
      const editor = editorRef.current
      const projectData = editor.getProjectData()
      const html = editor.getHtml()
      const css = editor.getCss()
      const renderedHtml = `<style>${css}</style>${html}`

      await onSave?.(projectData, renderedHtml)
    } finally {
      setIsSaving(false)
    }
  }, [onSave, isSaving])

  const handleAiGenerate = useCallback(async () => {
    if (!chatPrompt.trim() || isGenerating) return
    const prompt = chatPrompt.trim()
    setChatPrompt('')
    setChatMessages(prev => [...prev, { role: 'user', content: prompt }])
    setIsGenerating(true)

    try {
      const res = await fetch(`${cmsUrl}/api/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          prompt,
          templateCategory,
          theme,
          context: 'section',
        }),
      })

      const data = await res.json()
      if (data.html && editorRef.current) {
        const cleanHtml = DOMPurify.sanitize(data.html, { ADD_TAGS: ['section', 'div', 'h1', 'h2', 'h3', 'p', 'a', 'i', 'span', 'img', 'button', 'br', 'ul', 'li', 'strong', 'em'], ADD_ATTR: ['class', 'style', 'href', 'src', 'alt'] })
        const wrapper = editorRef.current.DomComponents?.getWrapper?.()
        if (wrapper) {
          wrapper.append(cleanHtml)
        }
        setChatMessages(prev => [...prev, { role: 'ai', content: `Generated section added to canvas (via ${data.provider})` }])
      } else if (data.error) {
          setChatMessages(prev => [...prev, { role: 'ai', content: `Error: ${data.error}` }])
        }
    } catch (err: any) {
      setChatMessages(prev => [...prev, { role: 'ai', content: `Error: ${err.message}` }])
    } finally {
      setIsGenerating(false)
    }
  }, [chatPrompt, isGenerating, cmsUrl])

  const handleClose = useCallback(() => {
    onClose?.()
  }, [onClose])

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 20000,
      background: '#1a1a1a',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        height: '48px',
        background: '#222',
        borderBottom: '1px solid #333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <i className="fas fa-pencil-ruler" style={{ color: '#FF6600', fontSize: '18px' }} />
          <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>
            Page Builder
          </span>
          {isSaving && (
            <span style={{ color: '#FF6600', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fas fa-spinner fa-spin" /> Saving...
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: '6px 16px',
              background: '#FF6600',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isSaving ? 'wait' : 'pointer',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            <i className="fas fa-save" style={{ marginRight: '6px' }} />
            Save
          </button>
          <button
            onClick={handleClose}
            style={{
              padding: '6px 12px',
              background: 'transparent',
              color: '#999',
              border: '1px solid #444',
              borderRadius: '6px',
              fontSize: '13px',
              cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            <i className="fas fa-times" style={{ marginRight: '6px' }} />
            Close
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div ref={containerRef} style={{ flex: 1, position: 'relative' }} />

        {showChat && (
          <div style={{
            width: '340px',
            background: '#1e1e1e',
            borderLeft: '1px solid #333',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
          }}>
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid #333',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <i className="fas fa-wand-magic-sparkles" style={{ color: '#8b5cf6', fontSize: '14px' }} />
              <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>AI Design Assistant</span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
              {chatMessages.length === 0 && (
                <div style={{ color: '#666', fontSize: '12px', textAlign: 'center', padding: '40px 16px' }}>
                  <i className="fas fa-wand-magic-sparkles" style={{ fontSize: '24px', marginBottom: '12px', display: 'block', color: '#8b5cf6', opacity: 0.5 }} />
                  Describe what you want to create and AI will generate it for you.
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} style={{
                  marginBottom: '8px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: msg.role === 'user' ? '#2a2a3a' : '#252525',
                  border: msg.role === 'user' ? '1px solid #4a4a6a' : '1px solid #333',
                }}>
                  <div style={{ fontSize: '11px', color: msg.role === 'user' ? '#8b8bff' : '#8b5cf6', marginBottom: '4px', fontWeight: 600 }}>
                    {msg.role === 'user' ? 'You' : 'AI'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#ccc', lineHeight: 1.5 }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div style={{ padding: '8px 12px', background: '#252525', borderRadius: '8px', border: '1px solid #333', marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#8b5cf6', marginBottom: '4px', fontWeight: 600 }}>AI</div>
                  <div style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="fas fa-spinner fa-spin" /> Generating...
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: '12px', borderTop: '1px solid #333' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <textarea
                  ref={chatInputRef}
                  value={chatPrompt}
                  onChange={e => setChatPrompt(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleAiGenerate()
                    }
                  }}
                  placeholder="Describe what to create..."
                  rows={2}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: '#2a2a2a',
                    border: '1px solid #444',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    fontFamily: 'DM Sans, sans-serif',
                    resize: 'none',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={handleAiGenerate}
                  disabled={isGenerating || !chatPrompt.trim()}
                  style={{
                    padding: '8px 12px',
                    background: isGenerating ? '#555' : '#8b5cf6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isGenerating ? 'wait' : 'pointer',
                    fontSize: '14px',
                    alignSelf: 'flex-end',
                  }}
                >
                  <i className="fas fa-paper-plane" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function registerBlocks(
  editor: any,
  templateSections?: string[],
  templateSectionDefs?: Record<string, { label: string; icon: string; fields: Array<{ name: string; label: string; type: string; help?: string; itemFields?: Array<{ name: string; label: string; type: string }> }> }>
) {
  if (templateSections && templateSectionDefs) {
    templateSections.forEach(sectionType => {
      const def = templateSectionDefs[sectionType]
      if (!def) return

      const traits = (def.fields || []).map(f => ({
        name: f.name,
        label: f.label,
        type: f.type === 'textarea' ? 'textarea' : 'text',
      }))

      const content = generateSectionHtml(sectionType, def)

      editor.Blocks.add(`template-${sectionType}`, {
        label: def.label,
        category: 'Template Sections',
        content,
        attributes: { class: `fa ${def.icon || 'fas fa-puzzle-piece'}` },
        traits,
      })

      editor.DomComponents.addType(`template-${sectionType}`, {
        model: {
          defaults: {
            traits: traits.map((t: any) => ({
              type: t.type === 'textarea' ? 'textarea' : 'text',
              name: t.name,
              label: t.label,
            })),
          },
        },
      })
    })
  }

  const defaultBlocks = [
    { id: 'hero', label: 'Hero Banner', category: 'Default Sections', content: `<section style="padding: 80px 40px; text-align: center; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #fff;"><h1 style="font-size: 48px; font-weight: 700; margin-bottom: 16px;">Your Heading Here</h1><p style="font-size: 18px; opacity: 0.8; margin-bottom: 32px; max-width: 600px; margin-left: auto; margin-right: auto;">Your description text goes here. Make it compelling and concise.</p><a href="#" style="display: inline-block; padding: 14px 32px; background: #FF6600; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Get Started</a></section>` },
    { id: 'features', label: 'Features Grid', category: 'Default Sections', content: `<section style="padding: 60px 40px; background: #fff;"><div style="max-width: 1100px; margin: 0 auto;"><h2 style="font-size: 32px; font-weight: 700; text-align: center; margin-bottom: 40px;">Our Features</h2><div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px;"><div style="padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;"><div style="width: 48px; height: 48px; background: rgba(255,102,0,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;"><i class="fas fa-bolt" style="color: #FF6600; font-size: 20px;"></i></div><h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Fast Performance</h3><p style="color: #666; font-size: 14px; line-height: 1.6;">Lightning-fast load times optimized for modern browsers.</p></div><div style="padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;"><div style="width: 48px; height: 48px; background: rgba(255,102,0,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;"><i class="fas fa-shield-halved" style="color: #FF6600; font-size: 20px;"></i></div><h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Secure</h3><p style="color: #666; font-size: 14px; line-height: 1.6;">Enterprise-grade security for your data.</p></div><div style="padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;"><div style="width: 48px; height: 48px; background: rgba(255,102,0,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;"><i class="fas fa-mobile-screen" style="color: #FF6600; font-size: 20px;"></i></div><h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Responsive</h3><p style="color: #666; font-size: 14px; line-height: 1.6;">Looks great on every device and screen size.</p></div></div></div></section>` },
    { id: 'cta', label: 'Call to Action', category: 'Default Sections', content: `<section style="padding: 80px 40px; background: linear-gradient(135deg, #FF6600 0%, #e55a00 100%); text-align: center; color: #fff;"><h2 style="font-size: 36px; font-weight: 700; margin-bottom: 16px;">Ready to Get Started?</h2><p style="font-size: 18px; opacity: 0.9; margin-bottom: 32px; max-width: 500px; margin-left: auto; margin-right: auto;">Join thousands of satisfied customers today.</p><a href="#" style="display: inline-block; padding: 14px 32px; background: #fff; color: #FF6600; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">Start Free Trial</a></section>` },
    { id: 'text-content', label: 'Text Content', category: 'Basic', content: `<div style="padding: 40px; max-width: 800px; margin: 0 auto;"><h2 style="font-size: 28px; font-weight: 700; margin-bottom: 16px;">Section Title</h2><p style="color: #555; font-size: 16px; line-height: 1.8;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p></div>` },
    { id: 'image-text', label: 'Image + Text', category: 'Basic', content: `<div style="padding: 40px; display: flex; gap: 40px; align-items: center; max-width: 1100px; margin: 0 auto;"><div style="flex: 1; min-height: 300px; background: #f3f4f6; border-radius: 12px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-image" style="font-size: 48px; color: #ccc;"></i></div><div style="flex: 1;"><h2 style="font-size: 28px; font-weight: 700; margin-bottom: 16px;">About Us</h2><p style="color: #555; font-size: 16px; line-height: 1.8; margin-bottom: 24px;">We are a team of passionate professionals dedicated to delivering exceptional results.</p><a href="#" style="color: #FF6600; font-weight: 600; text-decoration: none;">Learn More →</a></div></div>` },
    { id: 'gallery', label: 'Image Gallery', category: 'Basic', content: `<section style="padding: 60px 40px; background: #fafafa;"><h2 style="font-size: 32px; font-weight: 700; text-align: center; margin-bottom: 40px;">Gallery</h2><div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; max-width: 1100px; margin: 0 auto;"><div style="aspect-ratio: 4/3; background: #e5e7eb; border-radius: 8px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-image" style="font-size: 32px; color: #ccc;"></i></div><div style="aspect-ratio: 4/3; background: #e5e7eb; border-radius: 8px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-image" style="font-size: 32px; color: #ccc;"></i></div><div style="aspect-ratio: 4/3; background: #e5e7eb; border-radius: 8px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-image" style="font-size: 32px; color: #ccc;"></i></div></div></section>` },
    { id: 'contact-form', label: 'Contact Form', category: 'Forms', content: `<section style="padding: 60px 40px; background: #fff;"><div style="max-width: 500px; margin: 0 auto;"><h2 style="font-size: 28px; font-weight: 700; text-align: center; margin-bottom: 32px;">Contact Us</h2><form style="display: flex; flex-direction: column; gap: 16px;"><input type="text" placeholder="Your Name" style="padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;"><input type="email" placeholder="Email Address" style="padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;"><textarea rows="4" placeholder="Your Message" style="padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; resize: vertical;"></textarea><button type="submit" style="padding: 12px; background: #FF6600; color: #fff; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer;">Send Message</button></form></div></section>` },
    { id: 'testimonial', label: 'Testimonial', category: 'Default Sections', content: `<section style="padding: 60px 40px; background: #f9fafb; text-align: center;"><div style="max-width: 700px; margin: 0 auto;"><i class="fas fa-quote-left" style="font-size: 36px; color: #FF6600; opacity: 0.3; margin-bottom: 16px;"></i><p style="font-size: 20px; line-height: 1.7; color: #374151; font-style: italic; margin-bottom: 24px;">This product has completely transformed our business. The results exceeded all expectations.</p><div style="display: flex; align-items: center; justify-content: center; gap: 12px;"><div style="width: 48px; height: 48px; background: #e5e7eb; border-radius: 50%;"></div><div style="text-align: left;"><div style="font-weight: 600; color: #111;">Jane Smith</div><div style="font-size: 13px; color: #666;">CEO, TechCorp</div></div></div></div></section>` },
    { id: 'pricing-table', label: 'Pricing Table', category: 'Default Sections', content: `<section style="padding: 60px 40px; background: #fff;"><h2 style="font-size: 32px; font-weight: 700; text-align: center; margin-bottom: 40px;">Pricing Plans</h2><div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1000px; margin: 0 auto;"><div style="padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px; text-align: center;"><h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Starter</h3><div style="font-size: 36px; font-weight: 700; margin-bottom: 16px;">$9<span style="font-size: 14px; font-weight: 400; color: #666;">/mo</span></div><ul style="list-style: none; padding: 0; margin-bottom: 24px; color: #666; font-size: 14px;"><li style="padding: 6px 0;">5 Projects</li><li style="padding: 6px 0;">10GB Storage</li><li style="padding: 6px 0;">Email Support</li></ul><a href="#" style="display: block; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; text-decoration: none; color: #374151; font-weight: 500;">Choose Plan</a></div><div style="padding: 32px; border: 2px solid #FF6600; border-radius: 12px; text-align: center; position: relative;"><div style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #FF6600; color: #fff; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">Popular</div><h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Professional</h3><div style="font-size: 36px; font-weight: 700; margin-bottom: 16px;">$29<span style="font-size: 14px; font-weight: 400; color: #666;">/mo</span></div><ul style="list-style: none; padding: 0; margin-bottom: 24px; color: #666; font-size: 14px;"><li style="padding: 6px 0;">Unlimited Projects</li><li style="padding: 6px 0;">100GB Storage</li><li style="padding: 6px 0;">Priority Support</li></ul><a href="#" style="display: block; padding: 10px; background: #FF6600; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 600;">Choose Plan</a></div><div style="padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px; text-align: center;"><h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">Enterprise</h3><div style="font-size: 36px; font-weight: 700; margin-bottom: 16px;">$99<span style="font-size: 14px; font-weight: 400; color: #666;">/mo</span></div><ul style="list-style: none; padding: 0; margin-bottom: 24px; color: #666; font-size: 14px;"><li style="padding: 6px 0;">Everything in Pro</li><li style="padding: 6px 0;">Unlimited Storage</li><li style="padding: 6px 0;">24/7 Phone Support</li></ul><a href="#" style="display: block; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; text-decoration: none; color: #374151; font-weight: 500;">Choose Plan</a></div></div></section>` },
  ]

  defaultBlocks.forEach(block => {
    editor.Blocks.add(block.id, {
      label: block.label,
      category: block.category,
      content: block.content,
    })
  })
}

function generateSectionHtml(sectionType: string, def: { label: string; icon: string; fields: Array<{ name: string; label: string; type: string }> }): string {
  const titleField = def.fields.find(f => f.name === 'title' || f.name === 'heading')
  const descField = def.fields.find(f => f.type === 'textarea')
  const badgeField = def.fields.find(f => f.name === 'badgeText')

  const title = titleField ? `<h2 style="font-size: 32px; font-weight: 700; margin-bottom: 16px;">${def.label}</h2>` : ''
  const badge = badgeField ? `<div style="display: inline-block; padding: 4px 12px; background: rgba(255,102,0,0.1); color: #FF6600; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 16px;">${def.label}</div>` : ''
  const desc = descField ? `<p style="color: #666; font-size: 16px; line-height: 1.7; max-width: 600px; margin: 0 auto 32px;">Your ${def.label.toLowerCase()} content goes here. Edit this section to customize.</p>` : ''

  const sectionStyles: Record<string, string> = {
    hero: 'padding: 100px 40px; text-align: center; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: #fff;',
    menuHighlights: 'padding: 60px 40px; background: #fff;',
    reservation: 'padding: 60px 40px; background: #f9fafb;',
    gallery: 'padding: 60px 40px; background: #fafafa;',
    testimonials: 'padding: 60px 40px; background: #f9fafb; text-align: center;',
    contact: 'padding: 60px 40px; background: #fff;',
  }

  const sectionStyle = sectionStyles[sectionType] || 'padding: 60px 40px; background: #fff;'

  return `<section style="${sectionStyle}"><div style="max-width: 1100px; margin: 0 auto; text-align: center;">${badge}${title}${desc}<div style="padding: 40px; border: 2px dashed #e5e7eb; border-radius: 12px; color: #999; font-size: 14px;"><i class="${def.icon || 'fas fa-puzzle-piece'}" style="font-size: 32px; margin-bottom: 12px; display: block;"></i>Drag blocks here or edit this section in the Content Panel</div></div></section>`
}

function injectThemeStyles(editor: any, theme: any, cssVariableMapping?: Record<string, string[]>) {
  const canvasDoc = editor.Canvas.getDocument?.()
  if (!canvasDoc) return

  const root = canvasDoc.documentElement
  if (!root) return

  const vars: Record<string, string> = {
    '--primary': theme.primary || '#FF6600',
    '--primary-hover': theme.primaryHover || '#e55a00',
    '--dark': theme.dark || '#1a1a1a',
    '--light': theme.light || '#ffffff',
    '--white': theme.white || '#ffffff',
    '--gray': theme.gray || '#666666',
    '--border': theme.border || '#e5e5e5',
    '--font-body': theme.fontBody || 'DM Sans, sans-serif',
    '--font-heading': theme.fontHeading || 'Plus Jakarta Sans, sans-serif',
  }

  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value)
  }

  if (cssVariableMapping) {
    const themeKeyToValue: Record<string, string> = {
      primary: theme.primary,
      primaryHover: theme.primaryHover,
      dark: theme.dark,
      light: theme.light || theme.white,
      white: theme.white,
      gray: theme.gray,
      border: theme.border,
      fontBody: theme.fontBody,
      fontHeading: theme.fontHeading,
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

export default GrapejsEditor
