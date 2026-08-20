'use client'

import React from 'react'

interface GalleryProps {
  badgeIcon?: string
  badgeText?: string
  title: string
  titleHighlight?: string
  description?: string
  images?: Array<{ url: string; caption?: string; alt?: string }>
}

export function RestaurantGallery({ section }: { section: GalleryProps }) {
  const { badgeIcon, badgeText, title, titleHighlight, description, images = [] } = section

  function highlightTitle(text: string, highlight?: string) {
    if (!highlight) return text
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === highlight?.toLowerCase() ? (
        <span key={i} className="r-highlight">{part}</span>
      ) : part
    )
  }

  return (
    <section className="r-section r-gallery" id="gallery">
      <div className="r-container">
        {badgeIcon && badgeText && (
          <div className="r-badge"><i className={badgeIcon}></i> {badgeText}</div>
        )}
        <h2 className="r-title">{highlightTitle(title, titleHighlight)}</h2>
        {description && <p className="r-desc">{description}</p>}
        <div className="r-gallery-grid">
          {images.map((image: any, i: number) => (
            <div key={i} className="r-gallery-item">
              <img src={image.url} alt={image.alt || title} />
              {image.caption && (
                <div className="r-gallery-overlay">
                  <span>{image.caption}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}