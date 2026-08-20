'use client'

import React from 'react'

interface ServicesProps {
  badgeIcon?: string
  badgeText?: string
  title: string
  titleHighlight?: string
  description?: string
  items?: Array<{ icon?: string; title: string; description?: string; linkText?: string; linkUrl?: string; linkIcon?: string }>
}

export function DigitalAgencyServices({ section }: { section: ServicesProps }) {
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
    <section className="section" id="services">
      <div className="container">
        <div className="section-header">
          {badgeIcon && badgeText && (
            <div className="section-badge">
              <i className={badgeIcon}></i> {badgeText}
            </div>
          )}
          <h2 className="section-title">
            {highlightTitle(title, titleHighlight)}
          </h2>
          {description && <p className="section-desc">{description}</p>}
        </div>
        <div className="services-grid">
          {items.map((item: any, i: number) => (
            <div key={i} className="service-card">
              {item.icon && <div className="service-icon"><i className={item.icon}></i></div>}
              <h3 className="service-title">{item.title}</h3>
              {item.description && <p className="service-text">{item.description}</p>}
              {item.linkText && (
                <a href={item.linkUrl || '#'} className="service-link">
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