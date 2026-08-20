'use client'

import React from 'react'

interface AboutProps {
  badgeIcon?: string
  badgeText?: string
  title: string
  titleHighlight?: string
  description?: string
  mainImage?: string
  experienceNumber?: string
  experienceLabel?: string
  features?: Array<{ icon?: string; text: string }>
  buttonText?: string
  buttonUrl?: string
  buttonIcon?: string
}

export function DigitalAgencyAbout({ section }: { section: AboutProps }) {
  const { badgeIcon, badgeText, title, titleHighlight, description, mainImage, experienceNumber, experienceLabel, features = [], buttonText, buttonUrl, buttonIcon } = section

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
    <section className="section about" id="about">
      <div className="container">
        <div className="about-image">
          {mainImage ? (
            <div className="about-img-main">
              <img src={mainImage} alt={title} />
            </div>
          ) : (
            <div className="about-img-main">
              <i className="fas fa-building"></i>
            </div>
          )}
          {experienceNumber && (
            <div className="experience-badge">
              <div className="number">{experienceNumber}</div>
              <div className="text">{experienceLabel}</div>
            </div>
          )}
        </div>
        <div className="about-content">
          {badgeIcon && badgeText && (
            <div className="section-badge">
              <i className={badgeIcon}></i> {badgeText}
            </div>
          )}
          <h2 className="section-title">
            {highlightTitle(title, titleHighlight)}
          </h2>
          {description && <p className="about-desc">{description}</p>}
          {features && features.length > 0 && (
            <div className="about-features">
              {features.map((f: any, i: number) => (
                <div key={i} className="about-feature">
                  <div className={`about-feature-icon`}><i className={f.icon || 'fas fa-check'}></i></div>
                  <div className="about-feature-text">{f.text}</div>
                </div>
              ))}
            </div>
          )}
          {buttonText && (
            <a href={buttonUrl || '#contact'} className="btn btn-primary">
              {buttonText}
              {buttonIcon && <i className={buttonIcon}></i>}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}