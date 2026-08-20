'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'

interface LivePreviewProps {
  blocks: any[]
  selectedBlockIndex: number | null
  onBlockSelect: (index: number) => void
  className?: string
}

interface PreviewBlock {
  blockType: string
  [key: string]: any
}

/**
 * Live Preview iframe component
 * Renders blocks in real-time via postMessage to iframe
 */
export function LivePreview({ 
  blocks, 
  selectedBlockIndex, 
  onBlockSelect,
  className = ''
}: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [iframeContent, setIframeContent] = useState<string>('')
  const [previewWidth, setPreviewWidth] = useState(0)
  const [previewHeight, setPreviewHeight] = useState(0)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [isResizing, setIsResizing] = useState(false)
  const resizeHandleRef = useRef<HTMLDivElement>(null)

  const iframeUrl = '/preview'

  // Generate HTML content for iframe
  const generateIframeHtml = useCallback(() => {
    const blocksHtml = blocks.map((block: PreviewBlock, index: number) => {
      const isSelected = index === selectedBlockIndex
      return `
        <div 
          data-block-index="${index}"
          data-block-type="${block.blockType}"
          class="preview-block ${isSelected ? 'selected' : ''}"
          style="position: relative;"
        >
          ${renderBlockHtml(block, index)}
        </div>
      `
    }).join('')

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Live Preview</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Plus+Jakarta+Sans:wght@200..800&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
        <link rel="stylesheet" href="/styles/digital-agency.css">
        <link rel="stylesheet" href="/styles/restaurant.css">
        <style>
          * { box-sizing: border-box; }
          body { 
            margin: 0; 
            padding: 0; 
            font-family: var(--font-body, 'DM Sans', sans-serif);
            background: #fff;
            color: #181817;
            line-height: 1.6;
          }
          .preview-block {
            transition: outline 0.2s ease, box-shadow 0.2s ease;
          }
          .preview-block.selected {
            outline: 2px solid #FF6600;
            outline-offset: 2px;
            box-shadow: 0 0 0 4px rgba(255, 102, 0, 0.1);
          }
          .preview-block:hover {
            outline: 1px dashed #FF6600;
            outline-offset: 2px;
          }
          .block-highlight {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            border: 2px solid #FF6600;
            border-radius: 4px;
            opacity: 0;
            transition: opacity 0.2s;
          }
          .preview-block.selected .block-highlight {
            opacity: 1;
          }
        </style>
      </head>
      <body class="digital-agency-template">
        <div id="preview-root">
          ${blocks.map((block: any, index: number) => renderBlockHtml(block, index)).join('')}
        </div>
        <script>
          window.blocks = ${JSON.stringify(blocks)};
          window.selectedBlockIndex = ${selectedBlockIndex !== null ? selectedBlockIndex : 'null'};
          
          // Highlight block on hover
          document.addEventListener('mouseover', (e) => {
            const block = e.target.closest('[data-block-index]');
            if (block) {
              block.classList.add('hover');
            }
          });
          document.addEventListener('mouseout', (e) => {
            const block = e.target.closest('[data-block-index]');
            if (block) {
              block.classList.remove('hover');
            }
          });
          
          // Scroll to selected block
          function scrollToBlock(index) {
            const block = document.querySelector('[data-block-index="' + index + '"]');
            if (block) {
              block.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
          
          // Listen for block selection from parent
          window.addEventListener('message', (e) => {
            if (e.data.type === 'SELECT_BLOCK') {
              scrollToBlock(e.data.index);
            }
          });
        </script>
      </body>
      </html>
    `
  }, [blocks, selectedBlockIndex])

  // Render individual block HTML
  const renderBlockHtml = (block: any, index: number): string => {
    if (!block || !block.blockType) return ''
    
    switch (block.blockType) {
      case 'hero':
        return renderHeroBlock(block)
      case 'services':
        return renderServicesBlock(block)
      case 'about':
        return renderAboutBlock(block)
      case 'whyUs':
        return renderWhyUsBlock(block)
      case 'team':
        return renderTeamBlock(block)
      case 'portfolio':
        return renderPortfolioBlock(block)
      case 'blog':
        return renderBlogBlock(block)
      case 'pricing':
        return renderPricingBlock(block)
      case 'cta':
        return renderCtaBlock(block)
      case 'contact':
        return renderContactBlock(block)
      case 'menu':
        return renderMenuBlock(block)
      case 'menuHighlights':
        return renderMenuHighlightsBlock(block)
      case 'reservation':
        return renderReservationBlock(block)
      case 'gallery':
        return renderGalleryBlock(block)
      case 'testimonials':
        return renderTestimonialsBlock(block)
      case 'specials':
        return renderSpecialsBlock(block)
      default:
        return `<div class="preview-block" data-block-type="${block.blockType}">Unknown block type: ${block.blockType}</div>`
    }
  }

  // Block renderers (simplified versions matching frontend components)
  const renderHeroBlock = (block: any) => `
    <section class="hero" id="${block.id || 'hero'}">
      <div class="hero-bg">
        ${block.backgroundImage ? `<img src="${block.backgroundImage}" alt="" class="hero-bg-img" />` : ''}
        <div class="hero-bg-overlay"></div>
      </div>
      <div class="hero-content">
        ${block.badgeText ? `<span class="hero-badge">${block.badgeText}</span>` : ''}
        <h1 class="hero-title">${block.title || 'We Build Digital Experiences That Matter'}${block.titleHighlight ? `<span class="highlight">${block.titleHighlight}</span>` : ''}</h1>
        <p class="hero-desc">${block.description || 'Transforming businesses through innovative technology solutions.'}</p>
        <div class="hero-buttons">
          ${block.primaryButtonText ? `<a href="${block.primaryButtonUrl || '#contact'}" class="btn btn-primary">${block.primaryButtonText}${block.primaryButtonIcon ? `<i class="${block.primaryButtonIcon}"></i>` : ''}</a>` : ''}
          ${block.secondaryButtonText ? `<a href="${block.secondaryButtonUrl || '#portfolio'}" class="btn btn-outline">${block.secondaryButtonText}${block.secondaryButtonIcon ? `<i class="${block.secondaryButtonIcon}"></i>` : ''}</a>` : ''}
        </div>
        ${block.stats ? `<div class="hero-stats">${block.stats.map((stat: any) => `<div class="stat"><span class="stat-value">${stat.value}</span><span class="stat-label">${stat.label}</span></div>`).join('')}</div>` : ''}
      </div>
    </section>
  `

  const renderServicesBlock = (block: any) => `
    <section class="services" id="${block.id || 'services'}">
      <div class="container">
        ${block.badgeText ? `<span class="section-badge">${block.badgeText}</span>` : ''}
        <h2 class="section-title">${block.title || 'Solutions That Drive Digital Growth'}${block.titleHighlight ? `<span class="highlight">${block.titleHighlight}</span>` : ''}</h2>
        <p class="section-desc">${block.description || 'We offer a comprehensive suite of digital services...'}</p>
        <div class="services-grid">
          ${(block.items || []).map((item: any) => `
            <div class="service-card">
              <div class="service-icon"><i class="${item.icon || 'fas fa-code'}"></i></div>
              <h3 class="service-title">${item.title || 'Web Development'}</h3>
              <p class="service-desc">${item.description || 'Custom web solutions...'}</p>
              ${item.linkText ? `<a href="${item.linkUrl || '#'}" class="service-link">${item.linkText} <i class="${item.linkIcon || 'fas fa-arrow-right'}"></i></a>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `

  // Additional block renderers (simplified for brevity)
  const renderAboutBlock = (block: any) => `<section class="about"><div class="container"><h2>${block.title || 'About Us'}</h2><p>${block.description || ''}</p></section>`
  const renderWhyUsBlock = (block: any) => `<section class="why-us"><div class="container"><h2>${block.title || 'Why Choose Us'}</h2></section>`
  const renderTeamBlock = (block: any) => `<section class="team"><div class="container"><h2>${block.title || 'Our Team'}</h2></section>`
  const renderPortfolioBlock = (block: any) => `<section class="portfolio"><div class="container"><h2>${block.title || 'Portfolio'}</h2></section>`
  const renderBlogBlock = (block: any) => `<section class="blog"><div class="container"><h2>${block.title || 'Blog'}</h2></section>`
  const renderPricingBlock = (block: any) => `<section class="pricing"><div class="container"><h2>${block.title || 'Pricing'}</h2></section>`
  const renderCtaBlock = (block: any) => `<section class="cta"><div class="container"><h2>${block.title || 'Ready to Start?'}</h2></section>`
  const renderContactBlock = (block: any) => `<section class="contact"><div class="container"><h2>${block.title || 'Contact Us'}</h2></section>`
  const renderMenuBlock = (block: any) => `<section class="menu"><div class="container"><h2>${block.title || 'Menu'}</h2></section>`
  const renderMenuHighlightsBlock = (block: any) => `<section class="menu-highlights"><div class="container"><h2>${block.title || 'Highlights'}</h2></section>`
  const renderReservationBlock = (block: any) => `<section class="reservation"><div class="container"><h2>${block.title || 'Reservations'}</h2></section>`
  const renderGalleryBlock = (block: any) => `<section class="gallery"><div class="container"><h2>${block.title || 'Gallery'}</h2></section>`
  const renderTestimonialsBlock = (block: any) => `<section class="testimonials"><div class="container"><h2>${block.title || 'Testimonials'}</h2></section>`
  const renderSpecialsBlock = (block: any) => `<section class="specials"><div class="container"><h2>${block.title || 'Specials'}</h2></section>`

  // Generate iframe content on mount and when blocks change
  useEffect(() => {
    const html = generateIframeHtml()
    setIframeContent(html)
  }, [generateIframeHtml])

  // Handle iframe load
  const handleIframeLoad = () => {
    setIsLoaded(true)
    // Sync scroll position
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage({ type: 'SYNC_SCROLL', scrollTop: scrollPosition }, '*')
    }
  }

  // Handle messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      
      if (event.data.type === 'BLOCK_SELECT') {
        onBlockSelect(event.data.index)
      } else if (event.data.type === 'SCROLL') {
        setScrollPosition(event.data.scrollTop)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onBlockSelect])

  // Handle resize
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    document.addEventListener('mousemove', handleResize)
    document.addEventListener('mouseup', handleResizeEnd)
  }

  const handleResize = (e: MouseEvent) => {
    if (!isResizing) return
    const rect = (iframeRef.current?.parentElement as HTMLElement)?.getBoundingClientRect()
    if (rect) {
      const newWidth = Math.max(300, Math.min(800, e.clientX - rect.left))
      setPreviewWidth(newWidth)
    }
  }

  const handleResizeEnd = () => {
    setIsResizing(false)
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', handleResizeEnd)
  }

  return (
    <div className={`live-preview ${className}`} style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
      {/* Toolbar */}
      <div className="preview-toolbar" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        background: '#fafafa',
        borderBottom: '1px solid #e5e5e5',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Live Preview</span>
          <span style={{ 
            width: '8px', height: '8px', 
            borderRadius: '50%', 
            background: isLoaded ? '#10b981' : '#f59e0b',
            flexShrink: 0 
          }} />
          <span style={{ fontSize: '11px', color: '#7A7A74' }}>
            {isLoaded ? 'Ready' : 'Loading...'}
          </span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => iframeRef.current?.contentWindow?.postMessage({ type: 'REFRESH' }, '*')}
            style={{ padding: '4px 8px', fontSize: '11px', background: '#fff', border: '1px solid #e5e5e5', borderRadius: '4px', cursor: 'pointer' }}
            title="Refresh Preview"
          >
            <i className="fas fa-sync-alt" style={{ fontSize: '10px' }} />
          </button>
        </div>
      </div>

      {/* Preview Area with Resize Handle */}
      <div style={{ 
        display: 'flex', 
        flex: 1, 
        overflow: 'hidden', 
        position: 'relative',
        background: '#fff',
      }}>
        {/* Resize Handle */}
        <div
          ref={resizeHandleRef}
          onMouseDown={handleResizeStart}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '6px',
            cursor: 'col-resize',
            background: 'transparent',
            zIndex: 10,
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => { if (!isResizing) e.currentTarget.style.background = '#FF660020' }}
          onMouseLeave={(e) => { if (!isResizing) e.currentTarget.style.background = 'transparent' }}
        >
          <div style={{
            position: 'absolute',
            top: '50%',
            right: '-2px',
            transform: 'translateY(-50%)',
            width: '4px',
            height: '40px',
            background: '#FF6600',
            borderRadius: '2px',
            opacity: isResizing ? 1 : 0.3,
            transition: 'opacity 0.2s',
          }} />
        </div>

        {/* Iframe */}
        <iframe
          ref={iframeRef}
          srcDoc={iframeContent}
          style={{
            flex: 1,
            border: 'none',
            background: '#fff',
            width: previewWidth > 0 ? `${previewWidth}px` : '100%',
            height: '100%',
            minWidth: '300px',
            maxWidth: '800px',
          }}
          onLoad={handleIframeLoad}
          sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"
        />

        {/* Selected Block Indicator */}
        {selectedBlockIndex !== null && (
          <div style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            left: '6px',
            padding: '8px 12px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            borderRadius: '8px',
            fontSize: '12px',
            zIndex: 20,
            pointerEvents: 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-mouse-pointer" style={{ color: '#FF6600' }} />
              <span>Block {selectedBlockIndex + 1} of {blocks.length}</span>
              <span style={{ color: '#FF6600' }}>
                {blocks[selectedBlockIndex]?.blockType || 'Unknown'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LivePreview