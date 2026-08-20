'use client'

import React from 'react'

interface BlogProps {
  badgeIcon?: string
  badgeText?: string
  title: string
  titleHighlight?: string
  description?: string
  items?: Array<{ title: string; excerpt: string; image?: string; date?: string; linkText?: string; linkUrl?: string }>
}

export function DigitalAgencyBlog({ section }: { section: BlogProps }) {
  const { badgeIcon, badgeText, title, titleHighlight, description, items = [] } = section

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
    <section className="section blog" id="blog">
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
        <div className="blog-grid">
          {items.map((item: any, i: number) => (
            <article key={i} className="blog-card">
              {item.image && (
                <div className="blog-image">
                  <img src={item.image} alt={item.title} />
                </div>
              )}
              <div className="blog-content">
                {item.date && <time className="blog-date">{item.date}</time>}
                <h3 className="blog-title">{item.title}</h3>
                <p className="blog-excerpt">{item.excerpt}</p>
                {item.linkText && (
                  <a href={item.linkUrl || '#'} className="blog-link">
                    {item.linkText}
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}