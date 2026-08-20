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

export function DigitalAgencyHero({ section }: { section: HeroProps }) {
  const { badgeIcon, badgeText, title, titleHighlight, description, primaryButtonText, primaryButtonUrl, primaryButtonIcon, secondaryButtonText, secondaryButtonUrl, secondaryButtonIcon, stats, mainImage, floatingCards } = section

  function highlightTitle(text: string, highlight?: string) {
    if (!highlight) return text
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === highlight?.toLowerCase() ? (
        <span key={i} className="hero-highlight">{part}</span>
      ) : part
    )
  }

  return (
    <section className="hero" id="hero">
      <div className="container">
        <div className="hero-content">
          {badgeIcon && badgeText && (
            <div className="hero-badge">
              <i className={badgeIcon}></i>
              {badgeText}
            </div>
          )}
          <h1 className="hero-title">
            {highlightTitle(title, titleHighlight)}
          </h1>
          {description && <p className="hero-text">{description}</p>}
          <div className="hero-buttons">
            {primaryButtonText && (
              <a href={primaryButtonUrl || '#contact'} className="btn btn-primary">
                {primaryButtonText}
                {primaryButtonIcon && <i className={primaryButtonIcon}></i>}
              </a>
            )}
            {secondaryButtonText && (
              <a href={secondaryButtonUrl || '#'} className="btn btn-outline">
                {secondaryButtonIcon && <i className={secondaryButtonIcon}></i>}
                {secondaryButtonText}
              </a>
            )}
          </div>
          {stats && stats.length > 0 && (
            <div className="hero-stats">
              {stats.map((stat: any, i: number) => (
                <div key={i} className="stat-item">
                  <div className="stat-number">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        {mainImage || (floatingCards && floatingCards.length > 0) && (
          <div className="hero-image">
            {mainImage ? (
              <div className="hero-img-main">
                <img src={mainImage} alt={title} />
              </div>
            ) : (
              <div className="hero-img-main">
                <i className="fas fa-laptop-code hero-img-placeholder"></i>
              </div>
            )}
            {floatingCards && floatingCards.length > 0 && (
              <>
                {floatingCards.map((card: any, i: number) => (
                  <div key={i} className={`floating-card floating-card-${i + 1}`}>
                    <div className={`floating-icon`}>
                      {card.image ? <img src={card.image} alt={card.label} /> : <i className={card.icon}></i>}
                    </div>
                    <div className="floating-text">
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