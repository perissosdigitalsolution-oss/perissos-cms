'use client'

import React from 'react'

interface WhyUsProps {
  badgeIcon?: string
  badgeText?: string
  title: string
  titleHighlight?: string
  items?: Array<{ icon?: string; label: string; description?: string }>
  stats?: Array<{ icon?: string; number: string; label: string }>
}

export function DigitalAgencyWhyUs({ section }: { section: WhyUsProps }) {
  const { badgeIcon, badgeText, title, titleHighlight, items = [], stats = [] } = section

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
    <section className="section why-us" id="why-us">
      <div className="container">
        <div className="why-us-content">
          {badgeIcon && badgeText && (
            <div className="section-badge">
              <i className={badgeIcon}></i> {badgeText}
            </div>
          )}
          <h2 className="section-title">
            {highlightTitle(title, titleHighlight)}
          </h2>
          {items && items.length > 0 && (
            <div className="why-list">
              {items.map((item: any, i: number) => (
                <div key={i} className="why-item">
                  {item.icon && <div className="why-icon"><i className={item.icon}></i></div>}
                  <div className="why-text">
                    <h4>{item.label}</h4>
                    {item.description && <p>{item.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {stats && stats.length > 0 && (
          <div className="why-stats">
            {stats.map((stat: any, i: number) => (
              <div key={i} className="why-stat-card">
                {stat.icon && <div className="why-stat-icon"><i className={stat.icon}></i></div>}
                <div className="why-stat-number">{stat.number}</div>
                <div className="why-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}