'use client'

import React from 'react'

export interface WhyUsProps {
  badgeIcon?: string
  badgeText?: string
  title: string
  titleHighlight?: string
  items?: Array<{ icon?: string; label: string; description?: string }>
  stats?: Array<{ icon?: string; number: string; label: string }>
}

export function WhyUsSection({
  badgeIcon = 'fas fa-star',
  badgeText = 'Why Choose Us',
  title = 'Why Businesses Trust Us',
  titleHighlight = 'Trust Us',
  items = [
    { icon: 'fas fa-award', label: 'Award-Winning Team', description: 'Recognized for excellence in design and development across multiple industry awards.' },
    { icon: 'fas fa-shield-alt', label: 'Secure & Reliable', description: 'Enterprise-grade security measures to protect your data and ensure 99.9% uptime.' },
    { icon: 'fas fa-clock', label: 'On-Time Delivery', description: 'We respect deadlines and deliver projects on schedule without compromising quality.' },
  ],
  stats = [
    { icon: 'fas fa-project-diagram', number: '250+', label: 'Projects Completed' },
    { icon: 'fas fa-trophy', number: '15+', label: 'Awards Won' },
    { icon: 'fas fa-globe', number: '30+', label: 'Countries Served' },
    { icon: 'fas fa-heart', number: '98%', label: 'Happy Clients' },
  ],
}: WhyUsProps) {
  return (
    <section className="py-20 md:py-28 px-4 bg-[#1E1E1D] text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 md:gap-20 items-center">
          <div className="pt-5 md:pt-0">
            {badgeIcon && badgeText && (
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-5 text-sm text-[#FF6600] bg-[#FF6600]/10 border border-[#FF6600]/30 rounded-full" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                <i className={badgeIcon} /> {badgeText}
              </div>
            )}
            <h2 className="mb-8 text-left leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800 }}>
              {title.split(titleHighlight).map((part, i) => (
                <React.Fragment key={i}>
                  {part}
                  {i < title.split(titleHighlight).length - 1 && <span style={{ color: '#FF6600' }}>{titleHighlight}</span>}
                </React.Fragment>
              ))}
            </h2>
            {items && items.length > 0 && (
              <div className="mb-12">
                {items.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 py-5 border-b border-[#3A3A38] last:border-0">
                    {item.icon && (
                      <div className="w-12 h-12 bg-[#FF6600]/10 rounded-xl flex items-center justify-center flex-shrink-0 text-[#FF6600] text-[20px]">
                        <i className={item.icon} />
                      </div>
                    )}
                    <div>
                      <h4 className="mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '18px', fontWeight: 700 }}>{item.label}</h4>
                      {item.description && <p className="text-[#7A7A74]" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '15px' }}>{item.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {stats && stats.length > 0 && (
            <div className="grid grid-cols-2 gap-8">
              {stats.map((stat, i) => (
                <div key={i} className="p-8 md:p-10 bg-[#2A2A28] border border-[#3A3A38] rounded-2xl text-center" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  {stat.icon && (
                    <div className="w-16 h-16 bg-[#FF6600]/10 rounded-[14px] flex items-center justify-center mx-auto mb-5 text-[#FF6600] text-[24px]">
                      <i className={stat.icon} />
                    </div>
                  )}
                  <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '36px', fontWeight: 800 }}>{stat.number}</div>
                  <div className="text-[#7A7A74] text-base mt-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}