'use client'

import React from 'react'

interface CTAProps {
  badgeIcon?: string
  badgeText?: string
  title: string
  titleHighlight?: string
  description?: string
  buttonText?: string
  buttonUrl?: string
  buttonIcon?: string
  secondaryButtonText?: string
  secondaryButtonUrl?: string
  secondaryButtonIcon?: string
}

export function DigitalAgencyCTA({ section }: { section: CTAProps }) {
  const { badgeIcon, badgeText, title, titleHighlight, description, buttonText, buttonUrl, buttonIcon, secondaryButtonText, secondaryButtonUrl, secondaryButtonIcon } = section

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
    <section className="section cta" id="cta">
      <div className="container">
        <div className="cta-content">
          {badgeIcon && badgeText && (
            <div className="section-badge">
              <i className={badgeIcon}></i> {badgeText}
            </div>
          )}
          <h2 className="section-title">
            {highlightTitle(title, titleHighlight)}
          </h2>
          {description && <p className="cta-text">{description}</p>}
          <div className="cta-buttons">
            {buttonText && (
              <a href={buttonUrl || '#contact'} className="btn btn-primary">
                {buttonText}
                {buttonIcon && <i className={buttonIcon}></i>}
              </a>
            )}
            {secondaryButtonText && (
              <a href={secondaryButtonUrl || '#'} className="btn btn-outline">
                {secondaryButtonIcon && <i className={secondaryButtonIcon}></i>}
                {secondaryButtonText}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}