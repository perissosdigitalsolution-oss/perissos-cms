'use client'

import React from 'react'

interface TestimonialsProps {
  badgeIcon?: string
  badgeText?: string
  title: string
  titleHighlight?: string
  description?: string
  testimonials?: Array<{ name: string; role: string; avatar?: string; rating: number; text: string }>
  socials?: Array<{ icon: string; url: string }>
}

export function DigitalAgencyTestimonials({ section }: { section: TestimonialsProps }) {
  const { badgeIcon, badgeText, title, titleHighlight, description, testimonials = [], socials = [] } = section

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
    <section className="section testimonials" id="testimonials">
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
        <div className="testimonials-grid">
          {testimonials.map((t: any, i: number) => (
            <div key={i} className="testimonial-card">
              {t.avatar && (
                <div className="testimonial-avatar">
                  <img src={t.avatar} alt={t.name} />
                </div>
              )}
              <div className="testimonial-stars">
                {Array.from({ length: 5 }, (_, i) => (
                  <i key={i} className={i < (t.rating || 5) ? 'fas fa-star' : 'far fa-star'} />
                ))}
              </div>
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <strong>{t.name}</strong>
                <span>{t.role}</span>
              </div>
            </div>
          ))}
        </div>
        {socials && socials.length > 0 && (
          <div className="testimonial-socials">
            {socials.map((s: any, i: number) => (
              <a key={i} href={s.url} className="social-link">
                <i className={s.icon} />
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}