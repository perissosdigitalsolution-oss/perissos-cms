'use client'

import React from 'react'

export interface AboutProps {
  badgeIcon?: string
  badgeText?: string
  title: string
  titleHighlight?: string
  description?: string
  experienceNumber?: string
  experienceLabel?: string
  features?: Array<{ icon?: string; text: string }>
  buttonText?: string
  buttonIcon?: string
  buttonUrl?: string
}

export function AboutSection({
  badgeIcon = 'fas fa-info-circle',
  badgeText = 'About Us',
  title = "We're a Team of Digital Experts",
  titleHighlight = 'Digital',
  description = "Since 2012, we've been helping businesses of all sizes transform their digital presence. Our team combines creativity with technical expertise to deliver solutions that truly make a difference.",
  experienceNumber = '12+',
  experienceLabel = 'Years Experience',
  features = [
    { icon: 'fas fa-check', text: 'Custom Development' },
    { icon: 'fas fa-check', text: '24/7 Support' },
    { icon: 'fas fa-check', text: 'Agile Methodology' },
    { icon: 'fas fa-check', text: 'ROI Focused' },
  ],
  buttonText = 'Learn More',
  buttonIcon = 'fas fa-arrow-right',
  buttonUrl = '#contact',
}: AboutProps) {
  return (
    <section className="py-20 md:py-28 px-4 bg-[#181817] text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 md:gap-20 items-center">
          <div className="relative">
            <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-[#2A2A28] to-[#1E1E1D] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2A2A28 0%, #1E1E1D 100%)' }}>
              <i className="fas fa-building text-[80px] opacity-20" />
            </div>
            {experienceNumber && (
              <div className="absolute bottom-[-20px] right-[-20px] lg:bottom-[-20px] lg:right-[-20px] bg-[#FF6600] text-white p-8 md:p-12 rounded-2xl text-center" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '48px', fontWeight: 800, lineHeight: 1 }}>{experienceNumber}</div>
                <div className="text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>{experienceLabel}</div>
              </div>
            )}
          </div>
          <div className="pt-5 md:pt-0">
            {badgeIcon && badgeText && (
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-5 text-sm text-[#FF6600] bg-[#FF6600]/10 border border-[#FF6600]/30 rounded-full" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                <i className={badgeIcon} /> {badgeText}
              </div>
            )}
            <h2 className="mb-5 text-left leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800 }}>
              {title.split(titleHighlight).map((part, i) => (
                <React.Fragment key={i}>
                  {part}
                  {i < title.split(titleHighlight).length - 1 && <span style={{ color: '#FF6600' }}>{titleHighlight}</span>}
                </React.Fragment>
              ))}
            </h2>
            {description && <p className="text-lg text-[#7A7A74] mb-8" style={{ fontFamily: 'DM Sans, sans-serif' }}>{description}</p>}
            {features && features.length > 0 && (
              <div className="grid grid-cols-2 gap-5 mb-10">
                {features.map((f, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#FF6600]/15 rounded flex items-center justify-center text-[#FF6600] text-xs flex-shrink-0 mt-1" style={{ borderRadius: '6px', fontFamily: 'DM Sans, sans-serif' }}>
                      <i className={f.icon || 'fas fa-check'} />
                    </div>
                    <div className="text-base" style={{ fontFamily: 'DM Sans, sans-serif' }}>{f.text}</div>
                  </div>
                ))}
              </div>
            )}
            {buttonText && (
              <a href={buttonUrl} className="inline-flex items-center gap-2 px-8 py-3 text-base font-semibold text-white rounded-full bg-[#FF6600] hover:bg-[#E55B00] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#FF6600]/25" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
                {buttonText}
                {buttonIcon && <i className={buttonIcon} />}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}