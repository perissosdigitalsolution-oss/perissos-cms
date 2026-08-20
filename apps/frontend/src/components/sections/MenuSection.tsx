'use client'

import React, { useState } from 'react'

interface MenuItem {
  name: string
  description?: string
  price: string
  image?: string
  dietaryTags?: string[]
  isRecommended?: boolean
}

interface MenuCategory {
  name: string
  items: MenuItem[]
}

interface MenuProps {
  badgeIcon?: string
  badgeText?: string
  title: string
  titleHighlight?: string
  description?: string
  categories?: MenuCategory[]
  buttonText?: string
  buttonIcon?: string
  buttonUrl?: string
}

export function MenuSection({
  badgeIcon,
  badgeText,
  title,
  titleHighlight,
  description,
  categories = [],
  buttonText,
  buttonIcon,
  buttonUrl,
}: MenuProps) {
  const [activeCategory, setActiveCategory] = useState(0)

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
    <section className="r-section r-menu" id="menu">
      <div className="r-container">
        {badgeIcon && badgeText && (
          <div className="r-badge">
            <i className={badgeIcon}></i> {badgeText}
          </div>
        )}
        <h2 className="r-title">{highlightTitle(title, titleHighlight)}</h2>
        {description && <p className="r-desc">{description}</p>}

        {categories.length > 0 && (
          <>
            <div className="r-menu-tabs">
              {categories.map((cat, i) => (
                <button
                  key={i}
                  className={`r-menu-tab ${i === activeCategory ? 'active' : ''}`}
                  onClick={() => setActiveCategory(i)}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="r-menu-list">
              {categories[activeCategory]?.items.map((item, i) => (
                <div key={i} className="r-menu-item">
                  <div className="r-menu-item-info">
                    <div className="r-menu-item-header">
                      <span className="r-menu-item-name">
                        {item.name}
                        {item.isRecommended && (
                          <i className="fas fa-thumbs-up r-menu-recommended"></i>
                        )}
                      </span>
                      <span className="r-menu-dots"></span>
                      <span className="r-menu-item-price">{item.price}</span>
                    </div>
                    {item.description && (
                      <p className="r-menu-item-desc">{item.description}</p>
                    )}
                    {item.dietaryTags && item.dietaryTags.length > 0 && (
                      <div className="r-menu-item-tags">
                        {item.dietaryTags.map((tag, j) => (
                          <span key={j} className="r-menu-tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {buttonText && (
          <div className="r-center-btn">
            <a href={buttonUrl || '#menu'} className="r-btn r-btn-primary">
              {buttonText} {buttonIcon && <i className={buttonIcon}></i>}
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
