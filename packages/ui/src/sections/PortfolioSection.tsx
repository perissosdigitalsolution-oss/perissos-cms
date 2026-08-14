'use client'

import React, { useState } from 'react'

export interface PortfolioProps {
  badgeIcon?: string
  badgeText?: string
  title: string
  titleHighlight?: string
  description?: string
  filters?: Array<{ label: string }>
  projects?: Array<{
    icon?: string
    category?: string
    title: string
    linkText?: string
    linkIcon?: string
    linkUrl?: string
  }>
}

export function PortfolioSection({
  badgeIcon = 'fas fa-briefcase',
  badgeText = 'Portfolio',
  title = 'Our Recent Projects',
  titleHighlight = 'Projects',
  description = 'Explore our latest work showcasing innovative solutions across various industries.',
  filters = [
    { label: 'All' },
    { label: 'Web Design' },
    { label: 'Mobile App' },
    { label: 'Branding' },
    { label: 'Marketing' },
  ],
  projects = [
    { icon: 'fas fa-shopping-cart', category: 'Web Development', title: 'E-Commerce Platform', linkText: 'View Project', linkIcon: 'fas fa-arrow-right' },
    { icon: 'fas fa-heartbeat', category: 'Mobile App', title: 'Healthcare App', linkText: 'View Project', linkIcon: 'fas fa-arrow-right' },
    { icon: 'fas fa-university', category: 'UI/UX Design', title: 'Banking Dashboard', linkText: 'View Project', linkIcon: 'fas fa-arrow-right' },
    { icon: 'fas fa-plane', category: 'Web Application', title: 'Travel Booking', linkText: 'View Project', linkIcon: 'fas fa-arrow-right' },
    { icon: 'fas fa-utensils', category: 'Branding', title: 'Restaurant Branding', linkText: 'View Project', linkIcon: 'fas fa-arrow-right' },
    { icon: 'fas fa-graduation-cap', category: 'Education', title: 'E-Learning Platform', linkText: 'View Project', linkIcon: 'fas fa-arrow-right' },
  ],
}: PortfolioProps) {
  const [activeFilter, setActiveFilter] = useState(0)

  return (
    <section className="py-20 md:py-28 px-4 bg-[#181817] text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-10">
          {badgeIcon && badgeText && (
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-5 text-sm text-[#FF6600] bg-[#FF6600]/10 border border-[#FF6600]/30 rounded-full" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              <i className={badgeIcon} /> {badgeText}
            </div>
          )}
          <h2 className="mb-4 leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800 }}>
            {title.split(titleHighlight).map((part, i) => (
              <React.Fragment key={i}>
                {part}
                {i < title.split(titleHighlight).length - 1 && <span style={{ color: '#FF6600' }}>{titleHighlight}</span>}
              </React.Fragment>
            ))}
          </h2>
          {description && <p className="text-lg text-[#7A7A74]" style={{ fontFamily: 'DM Sans, sans-serif' }}>{description}</p>}
        </div>
        {filters && filters.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {filters.map((f, i) => (
              <button
                key={i}
                onClick={() => setActiveFilter(i)}
                className={`px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-300 ${
                  i === activeFilter
                    ? 'bg-[#FF6600] text-white border border-[#FF6600]'
                    : 'bg-transparent text-[#7A7A74] border border-[#3A3A38] hover:border-[#FF6600] hover:text-[#FF6600]'
                }`}
                style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500, borderRadius: '50px' }}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects?.map((proj, i) => (
            <div key={i} className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-[#2A2A28] to-[#1E1E1D]" style={{ background: 'linear-gradient(135deg, #2A2A28 0%, #1E1E1D 100%)' }}>
              {proj.icon && (
                <i className={`${proj.icon} absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[60px] opacity-15`} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#181817]/95 to-transparent flex flex-col justify-end p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-400" style={{ background: 'linear-gradient(to top, rgba(24, 24, 23, 0.95), transparent)' }}>
                {proj.category && <span className="mb-2 text-sm text-[#FF6600]" style={{ fontFamily: 'DM Sans, sans-serif' }}>{proj.category}</span>}
                <h3 className="mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '20px', fontWeight: 700 }}>{proj.title}</h3>
                {proj.linkText && (
                  <a href={proj.linkUrl || '#'} className="inline-flex items-center gap-2 text-[#FF6600] font-semibold text-sm hover:gap-3 transition-all duration-300" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
                    {proj.linkText}
                    {proj.linkIcon && <i className={proj.linkIcon} />}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}