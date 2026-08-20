'use client'

import React from 'react'

interface Testimonial {
  name: string
  role: string
  avatar?: string
  rating: number
  text: string
}

interface Social {
  icon: string
  url?: string
}

interface TestimonialsProps {
  badgeIcon?: string
  badgeText?: string
  title: string
  titleHighlight?: string
  description?: string
  testimonials?: Testimonial[]
  socials?: Social[]
}

export function TestimonialsSection({
  badgeIcon,
  badgeText,
  title,
  titleHighlight,
  description,
  testimonials = [],
  socials = [],
}: TestimonialsProps) {
  function highlightTitle(text: string, highlight?: string) {
    if (!highlight) return text
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={i} className="restaurant-highlight">{part}</span>
      ) : part
    )
  }

  return (
    <section className="r-section r-testimonials" id="testimonials">
      <div className="r-container r-testimonials-grid">
        <div className="r-testimonials-left">
          {socials.length > 0 && (
            <div className="r-social-icons">
              {socials.map((s, i) => (
                <a key={i} href={s.url || '#'} aria-label={s.icon}>
                  <i className={s.icon}></i>
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="r-testimonials-right">
          {badgeIcon && badgeText && (
            <div className="r-badge">
              <i className={badgeIcon}></i> {badgeText}
            </div>
          )}
          <h2 className="r-title">{highlightTitle(title, titleHighlight)}</h2>
          {description && <p className="r-desc">{description}</p>}

          <div className="r-testimonial-cards">
            {testimonials.map((t, i) => (
              <div key={i} className="r-testimonial-card">
                <div className="r-testimonial-avatar">
                  {t.avatar ? (
                    <img src={t.avatar} alt={t.name} />
                  ) : (
                    <div className="r-testimonial-avatar-placeholder">
                      <i className="fas fa-user"></i>
                    </div>
                  )}
                </div>
                <div className="r-testimonial-stars">
                  {Array.from({ length: 5 }, (_, j) => (
                    <i
                      key={j}
                      className={`fas fa-star ${j < t.rating ? '' : 'r-star-empty'}`}
                    ></i>
                  ))}
                </div>
                <p className="r-testimonial-text">&ldquo;{t.text}&rdquo;</p>
                <h6 className="r-testimonial-name">{t.name}</h6>
                <span className="r-testimonial-role">{t.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
