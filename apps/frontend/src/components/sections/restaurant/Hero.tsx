'use client'

import React from 'react'

interface HeroProps {
  badgeIcon?: string
  badgeText?: string
  title: string
  titleHighlight?: string
  description?: string
  primaryButtonText?: string
  primaryButtonUrl?: string
  primaryButtonIcon?: string
  secondaryButtonText?: string
  secondaryButtonUrl?: string
  secondaryButtonIcon?: string
  stats?: Array<{ value: string; label: string }>
  mainImage?: string
  floatingCards?: Array<{ image?: string; icon?: string; label: string; value: string }>
}

export function RestaurantHero({ section }: { section: HeroProps }) {
  const { badgeIcon, badgeText, title, titleHighlight, description, primaryButtonText, primaryButtonUrl, primaryButtonIcon, secondaryButtonText, secondaryButtonUrl, secondaryButtonIcon, stats, mainImage, floatingCards } = section

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
    <section className="r-section r-hero" id="hero">
      <div className="r-container">
        <div className="r-hero-content">
          {badgeIcon && badgeText && (
            <div className="r-badge">
              <i className={badgeIcon}></i>
              {badgeText}
            </div>
          )}
          <h1 className="r-hero-title">
            {highlightTitle(title, titleHighlight)}
          </h1>
          {description && <p className="r-hero-text">{description}</p>}
          <div className="r-hero-buttons">
            {primaryButtonText && (
              <a href={primaryButtonUrl || '#menu'} className="r-btn r-btn-primary">
                {primaryButtonText}
                {primaryButtonIcon && <i className={primaryButtonIcon}></i>}
              </a>
            )}
            {secondaryButtonText && (
              <a href={secondaryButtonUrl || '#'} className="r-btn r-btn-outline">
                {secondaryButtonIcon && <i className={secondaryButtonIcon}></i>}
                {secondaryButtonText}
              </a>
            )}
          </div>
          {stats && stats.length > 0 && (
            <div className="r-hero-stats">
              {stats.map((stat: any, i: number) => (
                <div key={i} className="r-stat-item">
                  <div className="r-stat-number">{stat.value}</div>
                  <div className="r-stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        {mainImage || (floatingCards && floatingCards.length > 0) && (
          <div className="r-hero-image">
            {mainImage ? (
              <div className="r-hero-img-main">
                <img src={mainImage} alt={title} />
              </div>
            ) : (
              <div className="r-hero-img-main">
                <i className="fas fa-utensils r-hero-placeholder"></i>
              </div>
            )}
            {floatingCards && floatingCards.length > 0 && (
              <>
                {floatingCards.map((card: any, i: number) => (
                  <div key={i} className={`r-floating-card r-floating-card-${i + 1}`}>
                    <div className={`r-floating-icon`}>
                      {card.image ? <img src={card.image} alt={card.label} /> : <i className={card.icon}></i>}
                    </div>
                    <div className="r-floating-text">
                      <h4>{card.label}</h4>
                      <p>{card.value}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  )
}