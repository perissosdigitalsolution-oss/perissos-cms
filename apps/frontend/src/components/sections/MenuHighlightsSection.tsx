'use client'

import React from 'react'

interface HighlightItem {
  name: string
  description?: string
  price: string
  image?: string
}

interface MenuHighlightsProps {
  badgeIcon?: string
  badgeText?: string
  title: string
  titleHighlight?: string
  description?: string
  items?: HighlightItem[]
  buttonText?: string
  buttonIcon?: string
  buttonUrl?: string
}

export function MenuHighlightsSection({
  badgeIcon,
  badgeText,
  title,
  titleHighlight,
  description,
  items = [],
  buttonText,
  buttonIcon,
  buttonUrl,
}: MenuHighlightsProps) {
  function highlightTitle(text: string, highlight?: string) {
    if (!highlight) return text
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={i} className="restaurant-highlight">{part}</span>
      ) : part
    )
  }

  return (
    <section className="r-section r-menu-highlights" id="menu-highlights">
      <div className="r-container">
        {badgeIcon && badgeText && (
          <div className="r-badge">
            <i className={badgeIcon}></i> {badgeText}
          </div>
        )}
        <h2 className="r-title">{highlightTitle(title, titleHighlight)}</h2>
        {description && <p className="r-desc">{description}</p>}

        <div className="r-highlights-grid">
          {items.map((item, i) => (
            <div key={i} className="r-highlight-card">
              <div className="r-highlight-image">
                {item.image ? (
                  <img src={item.image} alt={item.name} />
                ) : (
                  <div className="r-highlight-placeholder">
                    <i className="fas fa-utensils"></i>
                  </div>
                )}
              </div>
              <div className="r-highlight-info">
                <h6 className="r-highlight-name">{item.name}</h6>
                <h5 className="r-highlight-price">{item.price}</h5>
                <div className="r-highlight-divider"></div>
                {item.description && (
                  <p className="r-highlight-desc">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {buttonText && (
          <div className="r-center-btn">
            <a href={buttonUrl || '#menu'} className="r-btn r-btn-primary">
              {buttonText} {buttonIcon && <i className={buttonIcon}></i>}
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
