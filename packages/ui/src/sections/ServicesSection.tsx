'use client'

import React from 'react'

export interface ServicesProps {
  badgeIcon?: string
  badgeText?: string
  title: string
  titleHighlight?: string
  description?: string
  items?: Array<{
    icon?: string
    title: string
    description?: string
    linkText?: string
    linkIcon?: string
    linkUrl?: string
  }>
}

export function ServicesSection({
  badgeIcon = 'fas fa-cog',
  badgeText = 'Our Services',
  title = 'Solutions That Drive Digital Growth',
  titleHighlight = 'Digital',
  description = 'We offer a comprehensive suite of digital services designed to elevate your business in the digital landscape.',
  items = [
    { icon: 'fas fa-code', title: 'Web Development', description: 'Custom web solutions built with modern technologies. From responsive websites to complex web applications.', linkText: 'Learn More', linkIcon: 'fas fa-arrow-right' },
    { icon: 'fas fa-mobile-alt', title: 'Mobile Apps', description: 'Native and cross-platform mobile applications that deliver exceptional user experiences on iOS and Android.', linkText: 'Learn More', linkIcon: 'fas fa-arrow-right' },
    { icon: 'fas fa-paint-brush', title: 'UI/UX Design', description: 'User-centered design that transforms complex ideas into intuitive and beautiful digital experiences.', linkText: 'Learn More', linkIcon: 'fas fa-arrow-right' },
    { icon: 'fas fa-bullhorn', title: 'Digital Marketing', description: 'Data-driven marketing strategies that increase visibility, engagement, and conversions for your brand.', linkText: 'Learn More', linkIcon: 'fas fa-arrow-right' },
    { icon: 'fas fa-brain', title: 'AI Solutions', description: 'Intelligent automation and AI-powered solutions that revolutionize how your business operates.', linkText: 'Learn More', linkIcon: 'fas fa-arrow-right' },
    { icon: 'fas fa-cloud', title: 'Cloud Services', description: 'Scalable cloud infrastructure and migration services to optimize performance and reduce costs.', linkText: 'Learn More', linkIcon: 'fas fa-arrow-right' },
  ],
}: ServicesProps) {
  return (
    <section className="py-20 md:py-28 px-4 bg-[#181817] text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items?.map((item, i) => (
            <div key={i} className="group p-8 md:p-10 bg-[#1E1E1D] border border-[#3A3A38] rounded-2xl transition-all duration-400 hover:border-[#FF6600]/30 hover:-translate-y-2.5" style={{ position: 'relative', overflow: 'hidden', fontFamily: 'DM Sans, sans-serif' }}>
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#FF6600] scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
              {item.icon && (
                <div className="w-18 h-18 bg-[#FF6600]/10 rounded-2xl flex items-center justify-center mb-6 text-[#FF6600] text-[28px]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  <i className={item.icon} />
                </div>
              )}
              <h3 className="text-xl md:text-[22px] font-bold mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700 }}>{item.title}</h3>
              {item.description && <p className="text-[#7A7A74] mb-6" style={{ fontSize: '15px' }}>{item.description}</p>}
              {item.linkText && (
                <a href={item.linkUrl || '#'} className="inline-flex items-center gap-2 text-[#FF6600] font-semibold text-base hover:gap-3 transition-all duration-300" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
                  {item.linkText}
                  {item.linkIcon && <i className={item.linkIcon} />}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}