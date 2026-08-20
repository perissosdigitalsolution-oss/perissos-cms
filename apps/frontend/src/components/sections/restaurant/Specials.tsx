'use client'

import React from 'react'

interface SpecialsProps {
  badgeIcon?: string
  badgeText?: string
  title: string
  titleHighlight?: string
  description?: string
  items?: Array<{ name: string; price: string; description?: string; image?: string; badge?: string }>
}

export function RestaurantSpecials({ section }: { section: SpecialsProps }) {
  const { badgeIcon, badgeText, title, titleHighlight, description, items = [] } = section

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
    <section className="r-section r-specials" id="specials">
      <div className="r-container">
        {badgeIcon && badgeText && (
          <div className="r-badge"><i className={badgeIcon}></i> {badgeText}</div>
        )}
        <h2 className="r-title">{highlightTitle(title, titleHighlight)}</h2>
        {description && <p className="r-desc">{description}</p>}
        <div className="r-offers-grid">
          {items.map((item: any, i: number) => (
            <div key={i} className="r-offer-card">
              {item.badge && <div className="r-offer-badge">{item.badge}</div>}
              {item.image && <img src={item.image} alt={item.name} className="r-offer-image" />}
              <h3 className="r-offer-name">{item.name}</h3>
              <div className="r-offer-price">{item.price}</div>
              {item.description && <p className="r-offer-desc">{item.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}