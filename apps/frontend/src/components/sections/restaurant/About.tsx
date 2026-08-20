'use client'

import React from 'react'

interface AboutProps {
  badgeIcon?: string
  badgeText?: string
  title: string
  titleHighlight?: string
  description?: string
  mainImage?: string
  stats?: Array<{ icon?: string; number: string; label: string }>
}

export function RestaurantAbout({ section }: { section: AboutProps }) {
  const { badgeIcon, badgeText, title, titleHighlight, description, mainImage, stats = [] } = section

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
    <section className="r-section r-about" id="about">
      <div className="r-container r-about-grid">
        <div className="r-about-image">
          {mainImage ? <img src={mainImage} alt={title} /> : <div className="r-about-placeholder"><i className="fas fa-utensils"></i></div>}
        </div>
        <div className="r-about-content">
          {badgeIcon && badgeText && (
            <div className="r-badge"><i className={badgeIcon}></i> {badgeText}</div>
          )}
          <h2 className="r-title">{highlightTitle(title, titleHighlight)}</h2>
          {description && <p className="r-desc">{description}</p>}
          {stats && stats.length > 0 && (
            <div className="r-about-stats">
              {stats.map((stat: any, i: number) => (
                <div key={i} className="r-stat-card">
                  {stat.icon && <div className="r-stat-icon"><i className={stat.icon}></i></div>}
                  <div className="r-stat-number">{stat.number}</div>
                  <div className="r-stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}