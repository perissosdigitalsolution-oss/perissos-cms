import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3000'

interface Section {
  blockType: string
  [key: string]: any
}

interface PageData {
  id: string
  title: string
  slug: string
  sections: Section[]
  template?: any
}

async function getPageBySlug(slug: string): Promise<PageData | null> {
  try {
    const res = await fetch(
      `${CMS_URL}/api/pages?where[slug][equals]=${slug}&depth=1`,
      { next: { revalidate: 60 } }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.docs?.[0] || null
  } catch {
    return null
  }
}

function highlightTitle(text: string, highlight?: string) {
  if (!highlight || !text) return text
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === highlight.toLowerCase() ? (
      <span key={i} className="restaurant-highlight">{part}</span>
    ) : (
      part
    )
  )
}

function renderSection(section: Section, index: number) {
  const { blockType, ...props } = section

  switch (blockType) {
    case 'hero':
      return (
        <section className="hero" id={props.slug || 'hero'} key={index}>
          <div className="container">
            <div className="hero-content">
              {props.badgeIcon && props.badgeText && (
                <div className="hero-badge"><i className={props.badgeIcon}></i> {props.badgeText}</div>
              )}
              <h1 className="hero-title">{highlightTitle(props.title, props.titleHighlight)}</h1>
              {props.description && <p className="hero-text">{props.description}</p>}
              <div className="hero-buttons">
                {props.primaryButtonText && (
                  <a href={props.primaryButtonUrl || '#'} className="btn btn-primary">
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
            </div>
          </div>
        </section>
      )

    case 'services':
      return (
        <section className="section" id="services" key={index}>
          <div className="container">
            <div className="section-header">
              {props.badgeIcon && props.badgeText && (
                <div className="section-badge"><i className={props.badgeIcon}></i> {props.badgeText}</div>
              )}
              <h2 className="section-title">{highlightTitle(props.title, props.titleHighlight)}</h2>
              {props.description && <p className="section-desc">{props.description}</p>}
            </div>
            <div className="services-grid">
              {props.items?.map((item: any, i: number) => (
                <div key={i} className="service-card">
                  {item.icon && <div className="service-icon"><i className={item.icon}></i></div>}
                  <h3 className="service-title">{item.title}</h3>
                  {item.description && <p className="service-text">{item.description}</p>}
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
            <div className="about-content">
              {props.badgeIcon && props.badgeText && (
                <div className="section-badge"><i className={props.badgeIcon}></i> {props.badgeText}</div>
              )}
              <h2 className="section-title">{highlightTitle(props.title, props.titleHighlight)}</h2>
              {props.description && <p className="about-desc">{props.description}</p>}
            </div>
          </div>
        </section>
      )

    case 'menu':
      return (
        <section className="r-section r-menu" id="menu" key={index}>
          <div className="r-container">
            {props.badgeIcon && props.badgeText && (
              <div className="r-badge"><i className={props.badgeIcon}></i> {props.badgeText}</div>
            )}
            <h2 className="r-title">{highlightTitle(props.title, props.titleHighlight)}</h2>
            {props.description && <p className="r-desc">{props.description}</p>}
            {props.categories && props.categories.length > 0 && (
              <div className="r-menu-list">
                {props.categories.map((cat: any, ci: number) => (
                  <div key={ci} style={{marginBottom: 40}}>
                    <h3 style={{fontFamily:'var(--r-font-heading)',fontSize:'1.3rem',color:'var(--r-accent)',marginBottom:16}}>{cat.name}</h3>
                    {cat.items?.map((item: any, ii: number) => (
                      <div key={ii} className="r-menu-item">
                        <div className="r-menu-item-header">
                          <span className="r-menu-item-name">{item.name}{item.isRecommended && <i className="fas fa-thumbs-up r-menu-recommended"></i>}</span>
                          <span className="r-menu-dots"></span>
                          <span className="r-menu-item-price">{item.price}</span>
                        </div>
                        {item.description && <p className="r-menu-item-desc">{item.description}</p>}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )

    case 'menuHighlights':
      return (
        <section className="r-section r-menu-highlights" id="menu-highlights" key={index}>
          <div className="r-container">
            {props.badgeIcon && props.badgeText && (
              <div className="r-badge"><i className={props.badgeIcon}></i> {props.badgeText}</div>
            )}
            <h2 className="r-title">{highlightTitle(props.title, props.titleHighlight)}</h2>
            {props.description && <p className="r-desc">{props.description}</p>}
            <div className="r-highlights-grid">
              {props.items?.map((item: any, i: number) => (
                <div key={i} className="r-highlight-card">
                  <div className="r-highlight-image">
                    {item.image ? <img src={item.image} alt={item.name} /> : <div className="r-highlight-placeholder"><i className="fas fa-utensils"></i></div>}
                  </div>
                  <div className="r-highlight-info">
                    <h6 className="r-highlight-name">{item.name}</h6>
                    <h5 className="r-highlight-price">{item.price}</h5>
                    <div className="r-highlight-divider"></div>
                    {item.description && <p className="r-highlight-desc">{item.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )

    case 'reservation':
      return (
        <section className="r-section r-reservation" id="reservation" key={index}>
          <div className="r-container r-reservation-grid">
            <div className="r-reservation-info">
              {props.badgeIcon && props.badgeText && (
                <div className="r-badge"><i className={props.badgeIcon}></i> {props.badgeText}</div>
              )}
              <h2 className="r-title">{highlightTitle(props.title, props.titleHighlight)}</h2>
              {props.description && <p className="r-desc">{props.description}</p>}
              {props.benefits && props.benefits.length > 0 && (
                <ul className="r-check-list">
                  {props.benefits.map((b: any, i: number) => (
                    <li key={i}><i className={b.icon}></i> {b.text}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="r-reservation-form-wrapper">
              <form className="r-reservation-form">
                <div className="r-form-group"><label>Your Name</label><input type="text" placeholder="ex: John Doe" required /></div>
                <div className="r-form-group"><label>Phone Number</label><input type="tel" placeholder="(555) 000-0000" required /></div>
                <div className="r-form-row">
                  <div className="r-form-group"><label>Reservation Date</label><input type="date" required /></div>
                  <div className="r-form-group"><label>Preferred Time</label><input type="time" required /></div>
                </div>
                <div className="r-form-row">
                  <div className="r-form-group"><label>Number of Guests</label><select required><option value="">Select</option><option>1 Person</option><option>2 People</option><option>3 People</option><option>4 People</option><option>5+ People</option></select></div>
                  <div className="r-form-group"><label>Seating Preference</label><select required><option value="">Select</option><option>Indoor</option><option>Outdoor</option><option>Bar Area</option></select></div>
                </div>
                <button type="submit" className="r-btn r-btn-primary r-btn-block">{props.submitButtonText || 'Confirm Reservation'}</button>
              </form>
            </div>
          </div>
        </section>
      )

    case 'gallery':
      return (
        <section className="r-section r-gallery" id="gallery" key={index}>
          <div className="r-container">
            {props.badgeIcon && props.badgeText && (
              <div className="r-badge"><i className={props.badgeIcon}></i> {props.badgeText}</div>
            )}
            <h2 className="r-title">{highlightTitle(props.title, props.titleHighlight)}</h2>
            {props.description && <p className="r-desc">{props.description}</p>}
            <div className="r-gallery-carousel">
              <div className="r-gallery-track">
                {props.images?.map((img: any, i: number) => (
                  <div key={i} className="r-gallery-item">
                    {img.url ? <img src={img.url} alt={img.alt || img.caption || ''} /> : <div className="r-gallery-placeholder"><i className="fas fa-image"></i></div>}
                    {img.caption && <div className="r-gallery-overlay"><span>{img.caption}</span></div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )

    case 'testimonials':
      return (
        <section className="r-section r-testimonials" id="testimonials" key={index}>
          <div className="r-container r-testimonials-grid">
            <div className="r-testimonials-left">
              {props.socials && props.socials.length > 0 && (
                <div className="r-social-icons">
                  {props.socials.map((s: any, i: number) => (
                    <a key={i} href={s.url || '#'}><i className={s.icon}></i></a>
                  ))}
                </div>
              )}
            </div>
            <div className="r-testimonials-right">
              {props.badgeIcon && props.badgeText && (
                <div className="r-badge"><i className={props.badgeIcon}></i> {props.badgeText}</div>
              )}
              <h2 className="r-title">{highlightTitle(props.title, props.titleHighlight)}</h2>
              {props.description && <p className="r-desc">{props.description}</p>}
              <div className="r-testimonial-cards">
                {props.testimonials?.map((t: any, i: number) => (
                  <div key={i} className="r-testimonial-card">
                    <div className="r-testimonial-avatar">
                      {t.avatar ? <img src={t.avatar} alt={t.name} /> : <div className="r-testimonial-avatar-placeholder"><i className="fas fa-user"></i></div>}
                    </div>
                    <div className="r-testimonial-stars">
                      {Array.from({length:5},(_,j) => <i key={j} className={`fas fa-star ${j < t.rating ? '' : 'r-star-empty'}`}></i>)}
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

    case 'specials':
      return (
        <section className="r-section r-specials" id="specials" key={index}>
          <div className="r-container">
            {props.badgeIcon && props.badgeText && (
              <div className="r-badge"><i className={props.badgeIcon}></i> {props.badgeText}</div>
            )}
            <h2 className="r-title">{highlightTitle(props.title, props.titleHighlight)}</h2>
            {props.description && <p className="r-desc">{props.description}</p>}
            <div className="r-offers-grid">
              {props.offers?.map((offer: any, i: number) => (
                <div key={i} className="r-offer-card">
                  <div className="r-offer-accent"></div>
                  <div className="r-offer-content">
                    <div className="r-offer-counter">
                      <span className="r-counter-number">{offer.counterTarget}</span>
                      <span className="r-counter-suffix">%</span>
                    </div>
                    <span className="r-offer-label">{offer.label || 'off'}</span>
                    <h4 className="r-offer-title">{offer.title}</h4>
                    <p className="r-offer-desc">{offer.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )

    case 'cta':
      return (
        <section className="section cta-section" id="cta" key={index}>
          <div className="container text-center">
            <h2 className="section-title">{highlightTitle(props.title, props.titleHighlight)}</h2>
            {props.description && <p className="section-desc mx-auto">{props.description}</p>}
            {props.buttonText && (
              <a href={props.buttonUrl || '#'} className="btn btn-primary">
                {props.buttonText}
                {props.buttonIcon && <i className={props.buttonIcon}></i>}
              </a>
            )}
          </div>
        </section>
      )

    case 'contact':
      return (
        <section className="section contact-section" id="contact" key={index}>
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">{highlightTitle(props.title, props.titleHighlight)}</h2>
              {props.description && <p className="section-desc">{props.description}</p>}
            </div>
          </div>
        </section>
      )

    default:
      return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  return {
    title: page?.title || 'Page',
  }
}

export async function generateStaticParams() {
  try {
    const res = await fetch(`${CMS_URL}/api/pages?depth=0`, { next: { revalidate: 60 } })
    if (!res.ok) return []
    const data = await res.json()
    return data.docs?.map((doc: any) => ({ slug: doc.slug })) || []
  } catch {
    return []
  }
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await getPageBySlug(slug)

  if (!page) {
    notFound()
  }

  return (
    <main>
      {page.sections?.map((section: Section, index: number) => (
        renderSection(section, index)
      ))}
    </main>
  )
}
