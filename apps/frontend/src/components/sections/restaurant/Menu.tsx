'use client'

import React from 'react'

interface MenuProps {
  badgeIcon?: string
  badgeText?: string
  title: string
  titleHighlight?: string
  description?: string
  categories?: Array<{ name: string; items: Array<{ name: string; description?: string; price: string; image?: string }> }>
}

export function RestaurantMenu({ section }: { section: MenuProps }) {
  const { badgeIcon, badgeText, title, titleHighlight, description, categories = [] } = section

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
    <section className="r-section r-menu" id="menu">
      <div className="r-container">
        {badgeIcon && badgeText && (
          <div className="r-badge"><i className={badgeIcon}></i> {badgeText}</div>
        )}
        <h2 className="r-title">{highlightTitle(title, titleHighlight)}</h2>
        {description && <p className="r-desc">{description}</p>}
        {categories.map((cat: any, ci: number) => (
          <div key={ci} className="r-menu-category">
            <h3 className="r-menu-category-title">{cat.name}</h3>
            <div className="r-menu-items">
              {cat.items?.map((item: any, i: number) => (
                <div key={i} className="r-menu-item">
                  <div className="r-menu-item-info">
                    <h4 className="r-menu-item-name">{item.name}</h4>
                    {item.description && <p className="r-menu-item-desc">{item.description}</p>}
                  </div>
                  <span className="r-menu-item-price">{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}