'use client'

import React from 'react'

interface PortfolioProps {
  badgeIcon?: string
  badgeText?: string
  title: string
  titleHighlight?: string
  description?: string
  items?: Array<{ title: string; description?: string; image?: string; linkText?: string; linkUrl?: string; linkIcon?: string }>
}

export function DigitalAgencyPortfolio({ section }: { section: PortfolioProps }) {
  const { badgeIcon, badgeText, title, titleHighlight, description, items = [] } = section

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
    <section className="section portfolio" id="portfolio">
      <div className="container">
        {badgeIcon && badgeText && (
          <div className="section-badge">
            <i className={badgeIcon}></i> {badgeText}
          </div>
        )}
        <h2 className="section-title">
          {highlightTitle(title, titleHighlight)}
        </h2>
        {description && <p className="section-desc">{description}</p>}
        <div className="portfolio-grid">
          {items.map((item: any, i: number) => (
            <div key={i} className="portfolio-card">
              {item.image && (
                <div className="portfolio-image">
                  <img src={item.image} alt={item.title} />
                </div>
              )}
              <h3 className="portfolio-title">{item.title}</h3>
              {item.description && <p className="portfolio-text">{item.description}</p>}
              {item.linkText && (
                <a href={item.linkUrl || '#'} className="portfolio-link">
                  {item.linkText}
                  {item.linkIcon && <i className={item.linkIcon}></i>}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}