'use client'

import React from 'react'

interface ContactProps {
  badgeIcon?: string
  badgeText?: string
  title: string
  titleHighlight?: string
  description?: string
  submitButtonText?: string
  submitButtonIcon?: string
  contactItems?: Array<{ icon: string; label: string; value: string }>
  socials?: Array<{ icon: string; url: string }>
  formFields?: Array<{ name: string; label: string; type: string; placeholder?: string }>
}

export function RestaurantContact({ section }: { section: ContactProps }) {
  const { badgeIcon, badgeText, title, titleHighlight, description, submitButtonText, submitButtonIcon, contactItems = [], socials = [], formFields = [] } = section

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
    <section className="r-section r-contact" id="contact">
      <div className="r-container">
        {badgeIcon && badgeText && (
          <div className="r-badge"><i className={badgeIcon}></i> {badgeText}</div>
        )}
        <h2 className="r-title">{highlightTitle(title, titleHighlight)}</h2>
        {description && <p className="r-desc">{description}</p>}
        <div className="r-contact-grid">
          <div className="r-contact-info">
            {contactItems.map((item: any, i: number) => (
              <div key={i} className="r-contact-item">
                <div className="r-contact-icon"><i className={item.icon}></i></div>
                <div>
                  <strong className="r-contact-label">{item.label}</strong>
                  <p className="r-contact-value">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
          <form className="r-contact-form">
            <div className="r-form-row">
              <div className="r-form-group">
                <label htmlFor="con-name">Name</label>
                <input id="con-name" name="name" type="text" placeholder="Your name" required />
              </div>
              <div className="r-form-group">
                <label htmlFor="con-email">Email</label>
                <input id="con-email" name="email" type="email" placeholder="Your email" required />
              </div>
            </div>
            <div className="r-form-row">
              <div className="r-form-group">
                <label htmlFor="con-subject">Subject</label>
                <input id="con-subject" name="subject" type="text" placeholder="Subject" />
              </div>
            </div>
            <div className="r-form-group">
              <label htmlFor="con-message">Message</label>
              <textarea id="con-message" name="message" rows={5} placeholder="Your message" required></textarea>
            </div>
            <button type="submit" className="r-btn r-btn-primary r-btn-block">
              {submitButtonText || 'Send Message'}
              {submitButtonIcon && <i className={submitButtonIcon}></i>}
            </button>
          </form>
        </div>
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
    </section>
  )
}