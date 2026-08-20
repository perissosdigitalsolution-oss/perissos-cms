'use client'

import React from 'react'

interface PricingProps {
  badgeIcon?: string
  badgeText?: string
  title: string
  titleHighlight?: string
  description?: string
  items?: Array<{ name: string; price: string; period?: string; features: string[]; buttonText?: string; buttonUrl?: string; highlighted?: boolean }>
}

export function DigitalAgencyPricing({ section }: { section: PricingProps }) {
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
    <section className="section pricing" id="pricing">
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
        <div className="pricing-grid">
          {items.map((item: any, i: number) => (
            <div key={i} className={`pricing-card ${item.highlighted ? 'highlighted' : ''}`}>
              <h3 className="pricing-name">{item.name}</h3>
              <div className="pricing-price">
                <span className="amount">{item.price}</span>
                {item.period && <span className="period">/{item.period}</span>}
              </div>
              <ul className="pricing-features">
                {item.features.map((f: string, i: number) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
              {item.buttonText && (
                <a href={item.buttonUrl || '#'} className={`btn ${item.highlighted ? 'btn-primary' : 'btn-outline'}`}>
                  {item.buttonText}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}