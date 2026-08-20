'use client'

import React, { useRef } from 'react'

interface GalleryImage {
  url: string
  caption?: string
  alt?: string
}

interface GalleryProps {
  badgeIcon?: string
  badgeText?: string
  title: string
  titleHighlight?: string
  description?: string
  images?: GalleryImage[]
}

export function GallerySection({
  badgeIcon,
  badgeText,
  title,
  titleHighlight,
  description,
  images = [],
}: GalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  function highlightTitle(text: string, highlight?: string) {
    if (!highlight) return text
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={i} className="restaurant-highlight">{part}</span>
      ) : part
    )
  }

  function scroll(direction: 'prev' | 'next') {
    if (!trackRef.current) return
    const amount = 320
    trackRef.current.scrollBy({
      left: direction === 'next' ? amount : -amount,
      behavior: 'smooth',
    })
  }

  return (
    <section className="r-section r-gallery" id="gallery">
      <div className="r-container">
        {badgeIcon && badgeText && (
          <div className="r-badge">
            <i className={badgeIcon}></i> {badgeText}
          </div>
        )}
        <h2 className="r-title">{highlightTitle(title, titleHighlight)}</h2>
        {description && <p className="r-desc">{description}</p>}

        <div className="r-gallery-carousel">
          <div className="r-gallery-track" ref={trackRef}>
            {images.map((img, i) => (
              <div key={i} className="r-gallery-item">
                {img.url ? (
                  <img src={img.url} alt={img.alt || img.caption || ''} />
                ) : (
                  <div className="r-gallery-placeholder">
                    <i className="fas fa-image"></i>
                  </div>
                )}
                {img.caption && (
                  <div className="r-gallery-overlay">
                    <span>{img.caption}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button className="r-gallery-btn r-gallery-prev" onClick={() => scroll('prev')} aria-label="Previous">
            <i className="fas fa-chevron-left"></i>
          </button>
          <button className="r-gallery-btn r-gallery-next" onClick={() => scroll('next')} aria-label="Next">
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </section>
  )
}
