'use client'

import React from 'react'

interface TeamProps {
  badgeIcon?: string
  badgeText?: string
  title: string
  titleHighlight?: string
  description?: string
  members?: Array<{ name: string; role: string; image?: string; bio?: string }>
}

export function DigitalAgencyTeam({ section }: { section: TeamProps }) {
  const { badgeIcon, badgeText, title, titleHighlight, description, members = [] } = section

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
    <section className="section team" id="team">
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
        <div className="team-grid">
          {members.map((member: any, i: number) => (
            <div key={i} className="team-card">
              {member.image && (
                <div className="team-image">
                  <img src={member.image} alt={member.name} />
                </div>
              )}
              <h3 className="team-name">{member.name}</h3>
              <p className="team-role">{member.role}</p>
              {member.bio && <p className="team-bio">{member.bio}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}