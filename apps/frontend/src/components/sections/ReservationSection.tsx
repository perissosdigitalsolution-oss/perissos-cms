'use client'

import React from 'react'

interface Benefit {
  icon: string
  text: string
}

interface ReservationProps {
  badgeIcon?: string
  badgeText?: string
  title: string
  titleHighlight?: string
  description?: string
  benefits?: Benefit[]
  submitButtonText?: string
  submitButtonIcon?: string
}

export function ReservationSection({
  badgeIcon,
  badgeText,
  title,
  titleHighlight,
  description,
  benefits = [],
  submitButtonText = 'Confirm Reservation',
  submitButtonIcon = 'fas fa-check',
}: ReservationProps) {
  function highlightTitle(text: string, highlight?: string) {
    if (!highlight) return text
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={i} className="restaurant-highlight">{part}</span>
      ) : part
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
  }

  return (
    <section className="r-section r-reservation" id="reservation">
      <div className="r-container r-reservation-grid">
        <div className="r-reservation-info">
          {badgeIcon && badgeText && (
            <div className="r-badge">
              <i className={badgeIcon}></i> {badgeText}
            </div>
          )}
          <h2 className="r-title">{highlightTitle(title, titleHighlight)}</h2>
          {description && <p className="r-desc">{description}</p>}
          {benefits.length > 0 && (
            <ul className="r-check-list">
              {benefits.map((b, i) => (
                <li key={i}>
                  <i className={b.icon}></i> {b.text}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="r-reservation-form-wrapper">
          <form className="r-reservation-form" onSubmit={handleSubmit}>
            <div className="r-form-group">
              <label htmlFor="res-name">Your Name</label>
              <input type="text" id="res-name" placeholder="ex: John Doe" required />
            </div>
            <div className="r-form-group">
              <label htmlFor="res-phone">Phone Number</label>
              <input type="tel" id="res-phone" placeholder="(555) 000-0000" required />
            </div>
            <div className="r-form-row">
              <div className="r-form-group">
                <label htmlFor="res-date">Reservation Date</label>
                <input type="date" id="res-date" required />
              </div>
              <div className="r-form-group">
                <label htmlFor="res-time">Preferred Time</label>
                <input type="time" id="res-time" required />
              </div>
            </div>
            <div className="r-form-row">
              <div className="r-form-group">
                <label htmlFor="res-guests">Number of Guests</label>
                <select id="res-guests" required>
                  <option value="">Select</option>
                  <option>1 Person</option>
                  <option>2 People</option>
                  <option>3 People</option>
                  <option>4 People</option>
                  <option>5+ People</option>
                </select>
              </div>
              <div className="r-form-group">
                <label htmlFor="res-seating">Seating Preference</label>
                <select id="res-seating" required>
                  <option value="">Select</option>
                  <option>Indoor</option>
                  <option>Outdoor</option>
                  <option>Bar Area</option>
                </select>
              </div>
            </div>
            <button type="submit" className="r-btn r-btn-primary r-btn-block">
              {submitButtonText} {submitButtonIcon && <i className={submitButtonIcon}></i>}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
