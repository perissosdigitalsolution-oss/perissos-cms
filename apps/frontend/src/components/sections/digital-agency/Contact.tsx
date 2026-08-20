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

export function DigitalAgencyContact({ section }: { section: ContactProps }) {
  const { badgeIcon, badgeText, title, titleHighlight, description, submitButtonText, submitButtonIcon, contactItems = [], socials = [], formFields = [] } = section

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
    <section className="section contact" id="contact">
      <div className="container">
        <div className="contact-header">
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
        <div className="contact-grid">
          <div className="contact-info">
            {contactItems.map((item: any, i: number) => (
              <div key={i} className="contact-item">
                <i className={item.icon} />
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
          <form className="contact-form">
            {formFields.map((field: any, i: number) => (
              <div key={i} className="form-field">
                <label htmlFor={field.name}>{field.label}</label>
                <input id={field.name} name={field.name} type={field.type || 'text'} placeholder={field.placeholder} />
              </div>
            ))}
            <button type="submit" className="btn btn-primary">
              {submitButtonText || 'Send'}
              {submitButtonIcon && <i className={submitButtonIcon}></i>}
            </button>
          </form>
        </div>
        {socials && socials.length > 0 && (
          <div className="contact-socials">
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