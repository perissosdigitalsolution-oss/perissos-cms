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

export function RestaurantTestimonials({ section }: { section: TestimonialsProps }) {
  const { badgeIcon, badgeText, title, titleHighlight, description, testimonials = [], socials = [] } = section

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
    <section className="r-section r-testimonials" id="testimonials">
      <div className="r-container">
        <div className="r-testimonials-grid">
          <div className="r-testimonials-left">
            {badgeIcon && badgeText && (
              <div className="r-badge"><i className={badgeIcon}></i> {badgeText}</div>
            )}
            <h2 className="r-title">{highlightTitle(title, titleHighlight)}</h2>
            {description && <p className="r-desc">{description}</p>}
            {socials && socials.length > 0 && (
              <div className="r-social-icons">
                {socials.map((s: any, i: number) => (
                  <a key={i} href={s.url} className="r-social-link">
                    <i className={s.icon} />
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="r-testimonial-cards">
            {testimonials.map((t: any, i: number) => (
              <div key={i} className="r-testimonial-card">
                <div className="r-testimonial-avatar">
                  {t.avatar ? <img src={t.avatar} alt={t.name} /> : <div className="r-testimonial-avatar-placeholder"><i className="fas fa-user"></i></div>}
                </div>
                <div className="r-testimonial-stars">
                  {Array.from({ length: 5 }, (_, i) => (
                    <i key={i} className={i < (t.rating || 5) ? 'fas fa-star' : 'far fa-star'} />
                  ))}
                </div>
                <p className="r-testimonial-text">"{t.text}"</p>
                <div className="r-testimonial-author">
                  <strong className="r-testimonial-name">{t.name}</strong>
                  <span className="r-testimonial-role">{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}