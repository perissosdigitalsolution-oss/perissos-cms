'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { EditToolbar } from '@/components/EditToolbar'
import { SectionEditor } from '@/components/SectionEditor'

interface Section {
  blockType: string
  [key: string]: any
}

interface Page {
  id: string
  title: string
  slug: string
  sections: Section[]
}

function Header({ editMode, toolbarHeight }: { editMode?: boolean; toolbarHeight?: number }) {
  const headerTop = editMode && toolbarHeight ? toolbarHeight : 0
  return (
    <header
      className="header"
      id="header"
      style={{
        top: headerTop,
      }}
    >
      <div className="container">
        <a href="/" className="logo">
          <div className="logo-icon"><i className="fas fa-rocket"></i></div>
          <span>Perissos</span>
        </a>
        <nav className="nav" id="nav">
          <a href="#hero" className="nav-link">Home</a>
          <a href="#services" className="nav-link">Services</a>
          <a href="#about" className="nav-link">About</a>
          <a href="#portfolio" className="nav-link">Portfolio</a>
          <a href="#blog" className="nav-link">Blog</a>
          <a href="#contact" className="nav-link">Contact</a>
        </nav>
        <div className="header-actions">
          <a href="#contact" className="btn btn-primary">Get Started</a>
          <button className="hamburger" id="hamburger" aria-label="Toggle navigation">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <a href="/" className="logo">
                <div className="logo-icon"><i className="fas fa-rocket"></i></div>
                <span>Perissos</span>
              </a>
              <p className="footer-desc">We are a full-service digital agency dedicated to helping businesses grow through innovative technology solutions.</p>
              <div className="contact-socials">
                <a href="#" className="contact-social"><i className="fab fa-facebook-f"></i></a>
                <a href="#" className="contact-social"><i className="fab fa-twitter"></i></a>
                <a href="#" className="contact-social"><i className="fab fa-instagram"></i></a>
                <a href="#" className="contact-social"><i className="fab fa-linkedin-in"></i></a>
              </div>
            </div>
            <div>
              <h4 className="footer-title">Quick Links</h4>
              <ul className="footer-links">
                <li><a href="#about"><i className="fas fa-chevron-right"></i> About Us</a></li>
                <li><a href="#services"><i className="fas fa-chevron-right"></i> Services</a></li>
                <li><a href="#portfolio"><i className="fas fa-chevron-right"></i> Portfolio</a></li>
                <li><a href="#blog"><i className="fas fa-chevron-right"></i> Blog</a></li>
                <li><a href="#contact"><i className="fas fa-chevron-right"></i> Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="footer-title">Services</h4>
              <ul className="footer-links">
                <li><a href="#services"><i className="fas fa-chevron-right"></i> Web Development</a></li>
                <li><a href="#services"><i className="fas fa-chevron-right"></i> Mobile Apps</a></li>
                <li><a href="#services"><i className="fas fa-chevron-right"></i> UI/UX Design</a></li>
                <li><a href="#services"><i className="fas fa-chevron-right"></i> Digital Marketing</a></li>
                <li><a href="#services"><i className="fas fa-chevron-right"></i> AI Solutions</a></li>
              </ul>
            </div>
            <div>
              <h4 className="footer-title">Contact Info</h4>
              <div className="footer-contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <p>123 Digital Street, Tech City, TC 12345</p>
              </div>
              <div className="footer-contact-item">
                <i className="fas fa-phone"></i>
                <p>+1 (555) 123-4567</p>
              </div>
              <div className="footer-contact-item">
                <i className="fas fa-envelope"></i>
                <p>hello@perissos.dev</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p className="footer-copy">&copy; {new Date().getFullYear()} Perissos. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

function highlightTitle(title: string, highlight: string | undefined) {
  if (!highlight || !title.includes(highlight)) return title
  const parts = title.split(highlight)
  return (
    <>
      {parts[0]}
      <span>{highlight}</span>
      {parts.slice(1).join(highlight)}
    </>
  )
}

function renderSection(section: Section, index: number) {
  const { blockType, ...props } = section

  switch (blockType) {
    case 'hero':
      return (
        <section className="hero" id="hero" key={index}>
          <div className="container">
            <div className="hero-content">
              {props.badgeIcon && props.badgeText && (
                <div className="hero-badge">
                  <i className={props.badgeIcon}></i>
                  {props.badgeText}
                </div>
              )}
              <h1 className="hero-title">
                {highlightTitle(props.title, props.titleHighlight)}
              </h1>
              {props.description && <p className="hero-text">{props.description}</p>}
              <div className="hero-buttons">
                {props.primaryButtonText && (
                  <a href={props.primaryButtonUrl || '#contact'} className="btn btn-primary">
                    {props.primaryButtonText}
                    {props.primaryButtonIcon && <i className={props.primaryButtonIcon}></i>}
                  </a>
                )}
                {props.secondaryButtonText && (
                  <a href={props.secondaryButtonUrl || '#'} className="btn btn-outline">
                    {props.secondaryButtonIcon && <i className={props.secondaryButtonIcon}></i>}
                    {props.secondaryButtonText}
                  </a>
                )}
              </div>
              {props.stats && props.stats.length > 0 && (
                <div className="hero-stats">
                  {props.stats.map((stat: any, i: number) => (
                    <div key={i} className="stat-item">
                      <div className="stat-number">{stat.value}</div>
                      <div className="stat-label">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {props.floatingCards && props.floatingCards.length > 0 && (
              <div className="hero-image">
                <div className="hero-img-main">
                  <i className="fas fa-laptop-code hero-img-placeholder"></i>
                </div>
                {props.floatingCards.map((card: any, i: number) => (
                  <div key={i} className={`floating-card floating-card-${i + 1}`}>
                    <div className={`floating-icon`}><i className={card.icon}></i></div>
                    <div className="floating-text">
                      <h4>{card.label}</h4>
                      <p>{card.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )

    case 'services':
      return (
        <section className="section" id="services" key={index}>
          <div className="container">
            <div className="section-header">
              {props.badgeIcon && props.badgeText && (
                <div className="section-badge">
                  <i className={props.badgeIcon}></i> {props.badgeText}
                </div>
              )}
              <h2 className="section-title">
                {highlightTitle(props.title, props.titleHighlight)}
              </h2>
              {props.description && <p className="section-desc">{props.description}</p>}
            </div>
            <div className="services-grid">
              {props.items?.map((item: any, i: number) => (
                <div key={i} className="service-card">
                  {item.icon && <div className="service-icon"><i className={item.icon}></i></div>}
                  <h3 className="service-title">{item.title}</h3>
                  {item.description && <p className="service-text">{item.description}</p>}
                  {item.linkText && (
                    <a href={item.linkUrl || '#'} className="service-link">
                      {item.linkText}
                      {item.linkIcon && <i className={item.linkIcon}></i>}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )

    case 'about':
      return (
        <section className="section about" id="about" key={index}>
          <div className="container">
            <div className="about-image">
              <div className="about-img-main">
                <i className="fas fa-building"></i>
              </div>
              {props.experienceNumber && (
                <div className="experience-badge">
                  <div className="number">{props.experienceNumber}</div>
                  <div className="text">{props.experienceLabel}</div>
                </div>
              )}
            </div>
            <div className="about-content">
              {props.badgeIcon && props.badgeText && (
                <div className="section-badge">
                  <i className={props.badgeIcon}></i> {props.badgeText}
                </div>
              )}
              <h2 className="section-title">
                {props.title}
                {highlightTitle(props.title, props.titleHighlight)}
              </h2>
              {props.description && <p className="about-desc">{props.description}</p>}
              {props.features && props.features.length > 0 && (
                <div className="about-features">
                  {props.features.map((f: any, i: number) => (
                    <div key={i} className="about-feature">
                      <div className={`about-feature-icon`}><i className={f.icon || 'fas fa-check'}></i></div>
                      <div className="about-feature-text">{f.text}</div>
                    </div>
                  ))}
                </div>
              )}
              {props.buttonText && (
                <a href={props.buttonUrl || '#contact'} className="btn btn-primary">
                  {props.buttonText}
                  {props.buttonIcon && <i className={props.buttonIcon}></i>}
                </a>
              )}
            </div>
          </div>
        </section>
      )

    case 'whyUs':
      return (
        <section className="section why-us" id="why-us" key={index}>
          <div className="container">
            <div className="why-us-content">
              {props.badgeIcon && props.badgeText && (
                <div className="section-badge">
                  <i className={props.badgeIcon}></i> {props.badgeText}
                </div>
              )}
              <h2 className="section-title">
                {props.title}
                {highlightTitle(props.title, props.titleHighlight)}
              </h2>
              {props.items && props.items.length > 0 && (
                <div className="why-list">
                  {props.items.map((item: any, i: number) => (
                    <div key={i} className="why-item">
                      {item.icon && <div className="why-icon"><i className={item.icon}></i></div>}
                      <div className="why-text">
                        <h4>{item.label}</h4>
                        {item.description && <p>{item.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {props.stats && props.stats.length > 0 && (
              <div className="why-stats">
                {props.stats.map((stat: any, i: number) => (
                  <div key={i} className="why-stat-card">
                    {stat.icon && <div className="why-stat-icon"><i className={stat.icon}></i></div>}
                    <div className="why-stat-number">{stat.number}</div>
                    <div className="why-stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )

    case 'team':
      return (
        <section className="section" id="team" key={index}>
          <div className="container">
            <div className="section-header">
              {props.badgeIcon && props.badgeText && (
                <div className="section-badge">
                  <i className={props.badgeIcon}></i> {props.badgeText}
                </div>
              )}
              <h2 className="section-title">
                {props.title}
                {highlightTitle(props.title, props.titleHighlight)}
              </h2>
              {props.description && <p className="section-desc">{props.description}</p>}
            </div>
            <div className="team-grid">
              {props.members?.map((member: any, i: number) => (
                <div key={i} className="team-card">
                  <div className="team-img">
                    <i className={member.avatarIcon || 'fas fa-user'}></i>
                    {member.social && member.social.length > 0 && (
                      <div className="team-socials">
                        {member.social.map((s: any, j: number) => (
                          <a key={j} href={s.url || '#'} className="team-social"><i className={s.icon}></i></a>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="team-info">
                    <h3 className="team-name">{member.name}</h3>
                    <p className="team-role">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )

    case 'portfolio':
      return (
        <section className="section" id="portfolio" key={index}>
          <div className="container">
            <div className="section-header">
              {props.badgeIcon && props.badgeText && (
                <div className="section-badge">
                  <i className={props.badgeIcon}></i> {props.badgeText}
                </div>
              )}
              <h2 className="section-title">
                {props.title}
                {highlightTitle(props.title, props.titleHighlight)}
              </h2>
              {props.description && <p className="section-desc">{props.description}</p>}
            </div>
            {props.filters && props.filters.length > 0 && (
              <div className="portfolio-filter">
                {props.filters.map((f: any, i: number) => (
                  <button key={i} className={`filter-btn${i === 0 ? ' active' : ''}`}>{f.label}</button>
                ))}
              </div>
            )}
            <div className="portfolio-grid">
              {props.projects?.map((proj: any, i: number) => (
                <div key={i} className="portfolio-card">
                  {proj.icon && <i className={proj.icon}></i>}
                  <div className="portfolio-overlay">
                    {proj.category && <span className="portfolio-category">{proj.category}</span>}
                    <h3 className="portfolio-title">{proj.title}</h3>
                    {proj.linkText && (
                      <a href={proj.linkUrl || '#'} className="portfolio-link">
                        {proj.linkText}
                        {proj.linkIcon && <i className={proj.linkIcon}></i>}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )

    case 'blog':
      return (
        <section className="section blog" id="blog" key={index}>
          <div className="container">
            <div className="section-header">
              {props.badgeIcon && props.badgeText && (
                <div className="section-badge">
                  <i className={props.badgeIcon}></i> {props.badgeText}
                </div>
              )}
              <h2 className="section-title">
                {props.title}
                {highlightTitle(props.title, props.titleHighlight)}
              </h2>
              {props.description && <p className="section-desc">{props.description}</p>}
            </div>
            <div className="blog-grid">
              {props.posts?.map((post: any, i: number) => (
                <div key={i} className="blog-card">
                  <div className="blog-img">
                    {post.icon && <i className={post.icon}></i>}
                    {post.date && <span className="blog-date">{post.date}</span>}
                  </div>
                  <div className="blog-content">
                    {post.tag && <span className="blog-tag">{post.tag}</span>}
                    <h3 className="blog-title">{post.title}</h3>
                    <div className="blog-meta">
                      {post.author && <span><i className="fas fa-user"></i> {post.author}</span>}
                      {post.readTime && <span><i className="fas fa-clock"></i> {post.readTime}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )

    case 'pricing':
      return (
        <section className="section" id="pricing" key={index}>
          <div className="container">
            <div className="section-header">
              {props.badgeIcon && props.badgeText && (
                <div className="section-badge">
                  <i className={props.badgeIcon}></i> {props.badgeText}
                </div>
              )}
              <h2 className="section-title">
                {props.title}
                {highlightTitle(props.title, props.titleHighlight)}
              </h2>
              {props.description && <p className="section-desc">{props.description}</p>}
            </div>
            <div className="pricing-grid">
              {props.plans?.map((plan: any, i: number) => (
                <div key={i} className={`pricing-card${plan.featured ? ' featured' : ''}`}>
                  {plan.featured && plan.featuredBadge && <span className="pricing-badge">{plan.featuredBadge}</span>}
                  <h3 className="pricing-name">{plan.name}</h3>
                  {plan.description && <p className="pricing-desc">{plan.description}</p>}
                  <div className="pricing-price">
                    <span className="pricing-amount">{plan.price}</span>
                    {plan.period && <span className="pricing-period">{plan.period}</span>}
                  </div>
                  {plan.features && plan.features.length > 0 && (
                    <div className="pricing-features">
                      {plan.features.map((f: any, j: number) => (
                        <div key={j} className="pricing-feature">
                          <i className={f.icon || 'fas fa-check'}></i>
                          <span>{f.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {plan.buttonText && (
                    <a href={plan.buttonUrl || '#contact'} className={`btn ${plan.buttonStyle === 'primary' ? 'btn-primary' : 'btn-outline'}`}>
                      {plan.buttonText}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )

    case 'cta':
      return (
        <section className="section cta" key={index}>
          <div className="container">
            <h2 className="cta-title">{props.title}</h2>
            {props.description && <p className="cta-desc">{props.description}</p>}
            {props.buttonText && (
              <a href={props.buttonUrl || '#contact'} className="btn">
                {props.buttonText}
                {props.buttonIcon && <i className={props.buttonIcon}></i>}
              </a>
            )}
          </div>
        </section>
      )

    case 'contact':
      return (
        <section className="section contact" id="contact" key={index}>
          <div className="container">
              <div className="contact-info">
                <h2 className="section-title">
                  {props.title}
                  {highlightTitle(props.title, props.titleHighlight)}
                </h2>
                {props.description && <p className="section-desc" style={{ textAlign: 'left' }}>{props.description}</p>}
                {props.contactItems && props.contactItems.length > 0 && (
                  <div className="contact-list">
                    {props.contactItems.map((item: any, i: number) => (
                      <div key={i} className="contact-item">
                        <div className="contact-icon"><i className={item.icon}></i></div>
                        <div className="contact-text">
                          <h4>{item.label}</h4>
                          <p>{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {props.socials && props.socials.length > 0 && (
                  <div className="contact-socials">
                    {props.socials.map((s: any, i: number) => (
                      <a key={i} href={s.url || '#'} className="contact-social"><i className={s.icon}></i></a>
                    ))}
                  </div>
                )}
              </div>
              {props.formFields && props.formFields.length > 0 && (
                <div className="contact-form">
                  <form className="contact-form-inner">
                    {props.formFields.map((field: any, i: number) => (
                      <div key={i} className="form-group">
                        <label className="form-label" htmlFor={field.name}>{field.label}{field.required && <span className="required">*</span>}</label>
                        {field.type === 'textarea' ? (
                          <textarea
                            className="form-textarea"
                            id={field.name}
                            name={field.name}
                            placeholder={field.placeholder}
                            required={field.required}
                          />
                        ) : field.type === 'select' ? (
                          <select
                            className="form-input"
                            id={field.name}
                            name={field.name}
                            required={field.required}
                          >
                            {field.options?.map((opt: any, j: number) => (
                              <option key={j} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            className="form-input"
                            type={field.type}
                            id={field.name}
                            name={field.name}
                            placeholder={field.placeholder}
                            required={field.required}
                          />
                        )}
                      </div>
                    ))}
                    <button type="submit" className="btn btn-primary">
                      {props.submitButtonText || 'Send Message'}
                      {props.submitButtonIcon && <i className={props.submitButtonIcon}></i>}
                    </button>
                  </form>
                </div>
              )}
          </div>
        </section>
      )

    default:
      return null
  }
}

export default function LandingPage() {
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [pageId, setPageId] = useState<string | null>(null)
  const [pageSlug, setPageSlug] = useState('home')
  const [isEditing, setIsEditing] = useState(false)
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [toolbarHeight, setToolbarHeight] = useState(60)
  const [theme, setTheme] = useState<any>(null)

  const cmsUrl = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3000'

  useEffect(() => {
    const fetchCmsUrl = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3000'
    fetch(`${fetchCmsUrl}/api/pages?where%5Bslug%5D%5Bequals%5D=home&depth=1`)
      .then((res) => res.json())
      .then((data: any) => {
        if (data.docs?.[0]) {
          setSections(data.docs[0].sections || [])
          setPageId(data.docs[0].id)
          setPageSlug(data.docs[0].slug || 'home')
          if (data.docs[0].theme) {
            setTheme(data.docs[0].theme)
          }
        }
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  // Check auth status for edit mode
  useEffect(() => {
    fetch(`${cmsUrl}/api/users/me`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setIsEditing(true)
        }
      })
      .catch(() => {})
  }, [cmsUrl])

  const handleSectionSave = useCallback((sectionIndex: number, updatedSection: any) => {
    const newSections = [...sections]
    newSections[sectionIndex] = updatedSection
    setSections(newSections)
  }, [sections])

  const handleThemeChange = useCallback((newTheme: any) => {
    setTheme(newTheme)
  }, [])

  const handleSaveAll = useCallback(async () => {
    if (!pageId) return
    setIsSaving(true)
    try {
      await fetch(`${cmsUrl}/api/pages/${pageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sections, theme }),
      })
    } catch (err) {
      console.error('Save failed:', err)
    } finally {
      setIsSaving(false)
    }
  }, [pageId, sections, theme, cmsUrl])

  useEffect(() => {
    if (loading || sections.length === 0) return

    const handleScroll = () => {
      const header = document.getElementById('header')
      if (header) {
        if (window.scrollY > 50) {
          header.classList.add('scrolled')
        } else {
          header.classList.remove('scrolled')
        }
      }
    }

    const handleSmoothScroll = (e: Event) => {
      const target = e.target as HTMLAnchorElement
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault()
        const id = target.getAttribute('href')?.slice(1)
        const element = document.getElementById(id || '')
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
    }

    const handleHamburger = () => {
      const nav = document.getElementById('nav')
      if (nav) {
        nav.classList.toggle('active')
      }
    }

    window.addEventListener('scroll', handleScroll)
    document.addEventListener('click', handleSmoothScroll)

    const hamburger = document.getElementById('hamburger')
    if (hamburger) {
      hamburger.addEventListener('click', handleHamburger)
    }

    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('click', handleSmoothScroll)
      if (hamburger) {
        hamburger.removeEventListener('click', handleHamburger)
      }
    }
  }, [loading, sections])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600" />
      </div>
    )
  }

  return (
    <main className="digital-agency-template">
      {/* Edit Mode Toolbar */}
      {isEditing && (
        <EditToolbar
          pageId={pageId}
          pageSlug={pageSlug}
          onSave={handleSaveAll}
          isSaving={isSaving}
          onHeightChange={setToolbarHeight}
          theme={theme}
          onThemeChange={handleThemeChange}
        />
      )}

      <Header editMode={isEditing} toolbarHeight={toolbarHeight} />
      {sections.length > 0 ? (
        sections.map((section, i) => (
          <div
            key={i}
            data-section-editor
            style={{
              position: 'relative',
              cursor: isEditing ? 'pointer' : 'default',
            }}
            onClick={(e) => {
              if (!isEditing) return
              // Don't trigger if clicking on links or buttons
              const target = e.target as HTMLElement
              if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button')) {
                return
              }
              e.preventDefault()
              e.stopPropagation()
              setSelectedSectionIndex(i)
            }}
            onMouseEnter={(e) => {
              if (!isEditing) return
              const el = e.currentTarget
              const overlay = document.createElement('div')
              overlay.className = 'section-edit-overlay'
              overlay.style.position = 'absolute'
              overlay.style.inset = '0'
              overlay.style.background = 'rgba(255, 102, 0, 0.05)'
              overlay.style.border = '2px dashed rgba(255, 102, 0, 0.4)'
              overlay.style.borderRadius = '8px'
              overlay.style.pointerEvents = 'none'
              overlay.style.zIndex = '10'
              overlay.style.display = 'flex'
              overlay.style.alignItems = 'flex-start'
              overlay.style.justifyContent = 'center'
              overlay.style.paddingTop = '8px'

              const label = document.createElement('span')
              label.style.background = '#FF6600'
              label.style.color = 'white'
              label.style.padding = '4px 12px'
              label.style.borderRadius = '4px'
              label.style.fontSize = '11px'
              label.style.fontWeight = '600'
              label.style.fontFamily = 'DM Sans, sans-serif'
              label.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)'
              label.textContent = 'Click to Edit — ' + section.blockType

              overlay.appendChild(label)
              el.style.position = 'relative'
              el.appendChild(overlay)
            }}
            onMouseLeave={(e) => {
              const overlay = e.currentTarget.querySelector('.section-edit-overlay')
              if (overlay) overlay.remove()
            }}
          >
            {renderSection(section, i)}
          </div>
        ))
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to Perissos</h1>
            <p className="text-gray-600 dark:text-gray-400">Create your first page in the admin panel.</p>
          </div>
        </div>
      )}
      <Footer />

      {/* Section Editor Panel */}
      <SectionEditor
        section={selectedSectionIndex !== null ? sections[selectedSectionIndex] : null}
        sectionIndex={selectedSectionIndex ?? 0}
        isOpen={selectedSectionIndex !== null}
        onClose={() => setSelectedSectionIndex(null)}
        onSave={(updatedSection) => {
          if (selectedSectionIndex !== null) {
            handleSectionSave(selectedSectionIndex, updatedSection)
          }
        }}
      />
    </main>
  )
}
