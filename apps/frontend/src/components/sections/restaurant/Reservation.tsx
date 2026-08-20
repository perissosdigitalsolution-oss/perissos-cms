'use client'

import React from 'react'

interface ReservationProps {
  badgeIcon?: string
  badgeText?: string
  title: string
  titleHighlight?: string
  description?: string
  submitButtonText?: string
  submitButtonIcon?: string
  benefits?: Array<{ icon: string; text: string }>
}

export function RestaurantReservation({ section }: { section: ReservationProps }) {
  const { badgeIcon, badgeText, title, titleHighlight, description, submitButtonText, submitButtonIcon, benefits = [] } = section

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
    <section className="r-section r-reservation" id="reservation">
      <div className="r-container r-reservation-grid">
        <div className="r-reservation-info">
          {badgeIcon && badgeText && (
            <div className="r-badge"><i className={badgeIcon}></i> {badgeText}</div>
          )}
          <h2 className="r-title">{highlightTitle(title, titleHighlight)}</h2>
          {description && <p className="r-desc">{description}</p>}
          {benefits && benefits.length > 0 && (
            <div className="r-benefits">
              {benefits.map((b: any, i: number) => (
                <div key={i} className="r-benefit">
                  <div className="r-benefit-icon"><i className={b.icon}></i></div>
                  <div className="r-benefit-text">{b.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <form className="r-reservation-form">
          <div className="r-form-row">
            <div className="r-form-group">
              <label htmlFor="res-name">Name</label>
              <input id="res-name" name="name" type="text" placeholder="Your name" required />
            </div>
            <div className="r-form-group">
              <label htmlFor="res-email">Email</label>
              <input id="res-email" name="email" type="email" placeholder="Your email" required />
            </div>
          </div>
          <div className="r-form-row">
            <div className="r-form-group">
              <label htmlFor="res-date">Date</label>
              <input id="res-date" name="date" type="date" required />
            </div>
            <div className="r-form-group">
              <label htmlFor="res-time">Time</label>
              <input id="res-time" name="time" type="time" required />
            </div>
          </div>
          <div className="r-form-row">
            <div className="r-form-group">
              <label htmlFor="res-guests">Guests</label>
              <select id="res-guests" name="guests" required>
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
                <option value="5">5+ Guests</option>
              </select>
            </div>
            <div className="r-form-group">
              <label htmlFor="res-phone">Phone</label>
              <input id="res-phone" name="phone" type="tel" placeholder="Your phone" />
            </div>
          </div>
          <button type="submit" className="r-btn r-btn-primary r-btn-block">
            {submitButtonText || 'Reserve Now'}
            {submitButtonIcon && <i className={submitButtonIcon}></i>}
          </button>
        </form>
      </div>
    </section>
  )
}