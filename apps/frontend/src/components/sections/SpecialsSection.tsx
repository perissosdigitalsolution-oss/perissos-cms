'use client'

import React from 'react'

interface SpecialOffer {
  title: string
  description: string
  discountPercent: number
  counterTarget: number
  label?: string
}

interface SpecialsProps {
  badgeIcon?: string
  badgeText?: string
  title: string
  titleHighlight?: string
  description?: string
  offers?: SpecialOffer[]
}

export function SpecialsSection({
  badgeIcon,
  badgeText,
  title,
  titleHighlight,
  description,
  offers = [],
}: SpecialsProps) {
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
    <section className="r-section r-specials" id="specials">
      <div className="r-container">
        {badgeIcon && badgeText && (
          <div className="r-badge">
            <i className={badgeIcon}></i> {badgeText}
          </div>
        )}
        <h2 className="r-title">{highlightTitle(title, titleHighlight)}</h2>
        {description && <p className="r-desc">{description}</p>}

        <div className="r-offers-grid">
          {offers.map((offer, i) => (
            <div key={i} className="r-offer-card">
              <div className="r-offer-accent"></div>
              <div className="r-offer-content">
                <div className="r-offer-counter">
                  <span className="r-counter-number">{offer.counterTarget}</span>
                  <span className="r-counter-suffix">%</span>
                </div>
                <span className="r-offer-label">{offer.label || 'off'}</span>
                <h4 className="r-offer-title">{offer.title}</h4>
                <p className="r-offer-desc">{offer.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
