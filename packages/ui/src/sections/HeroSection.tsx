'use client'

import React from 'react'

export interface HeroProps {
  badgeIcon?: string
  badgeText?: string
  title: string
  titleHighlight?: string
  description?: string
  primaryButtonText?: string
  primaryButtonIcon?: string
  primaryButtonUrl?: string
  secondaryButtonText?: string
  secondaryButtonIcon?: string
  secondaryButtonUrl?: string
  stats?: Array<{ value: string; label: string }>
  floatingCards?: Array<{ icon: string; label: string; value: string }>
}

export function HeroSection({
  badgeIcon = 'fas fa-bolt',
  badgeText = '#1 Digital Agency',
  title = 'We Build Digital Experiences That Matter',
  titleHighlight = 'Digital',
  description = 'Transforming businesses through innovative technology solutions. We craft cutting-edge digital products that drive growth and engagement.',
  primaryButtonText = 'Start a Project',
  primaryButtonIcon = 'fas fa-arrow-right',
  primaryButtonUrl = '#contact',
  secondaryButtonText = 'View Our Work',
  secondaryButtonIcon = 'fas fa-play',
  secondaryButtonUrl = '#portfolio',
  stats = [
    { value: '250+', label: 'Projects Completed' },
    { value: '50+', label: 'Team Members' },
    { value: '98%', label: 'Client Satisfaction' },
  ],
  floatingCards = [
    { icon: 'fas fa-chart-line', label: 'Revenue Growth', value: '+127% This Year' },
    { icon: 'fas fa-users', label: 'Happy Clients', value: '250+ Worldwide' },
  ],
}: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#181817] text-white px-4 py-20 md:py-32" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="absolute top-[-50%] right-[-20%] w-[800px] h-[800px] rounded-full bg-gradient-radial from-[#FF6600]/10 to-transparent" style={{ background: 'radial-gradient(circle, rgba(255, 102, 0, 0.1) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-30%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-radial from-[#FF6600]/05 to-transparent" style={{ background: 'radial-gradient(circle, rgba(255, 102, 0, 0.05) 0%, transparent 70%)' }} />
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-left lg:text-left">
            {badgeIcon && badgeText && (
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm text-[#FF6600] bg-[#FF6600]/10 border border-[#FF6600]/30 rounded-full" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                <i className={badgeIcon} />
                {badgeText}
              </div>
            )}
            <h1 className="mb-6 leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 800 }}>
              {title.split(titleHighlight).map((part, i) => (
                <React.Fragment key={i}>
                  {part}
                  {i < title.split(titleHighlight).length - 1 && <span style={{ color: '#FF6600' }}>{titleHighlight}</span>}
                </React.Fragment>
              ))}
            </h1>
            {description && <p className="text-lg text-[#7A7A74] max-w-xl mb-10" style={{ fontFamily: 'DM Sans, sans-serif' }}>{description}</p>}
            <div className="flex flex-wrap gap-4 mb-16">
              {primaryButtonText && (
                <a href={primaryButtonUrl} className="inline-flex items-center gap-2 px-8 py-3 text-base font-semibold text-white rounded-full bg-[#FF6600] hover:bg-[#E55B00] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#FF6600]/25" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
                  {primaryButtonText}
                  {primaryButtonIcon && <i className={primaryButtonIcon} />}
                </a>
              )}
              {secondaryButtonText && (
                <a href={secondaryButtonUrl} className="inline-flex items-center gap-2 px-8 py-3 text-base font-semibold text-white border border-[#3A3A38] rounded-full hover:border-[#FF6600] hover:text-[#FF6600] transition-all duration-300" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
                  {secondaryButtonIcon && <i className={secondaryButtonIcon} />}
                  {secondaryButtonText}
                </a>
              )}
            </div>
            {stats && stats.length > 0 && (
              <div className="grid grid-cols-3 gap-8 md:gap-10">
                {stats.map((stat, i) => (
                  <div key={i} className="text-left">
                    <div className="mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '48px', fontWeight: 800, color: '#FF6600', lineHeight: 1 }}>{stat.value}</div>
                    <div className="text-sm text-[#7A7A74]" style={{ fontFamily: 'DM Sans, sans-serif' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="relative lg:order-first">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-[#2A2A28] to-[#1E1E1D] flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2A2A28 0%, #1E1E1D 100%)' }}>
              <i className="fas fa-laptop-code text-[120px] opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF6600]/20 to-transparent" />
            </div>
            {floatingCards && floatingCards.length > 0 && (
              <>
                <div className="absolute bottom-5 left-[-30px] lg:left-[-50px] flex items-center gap-3 p-5 bg-[#1E1E1D]/95 backdrop-blur-md border border-[#3A3A38] rounded-2xl animate-float" style={{ animation: 'float 3s ease-in-out infinite' }}>
                  <div className="w-12 h-12 bg-[#FF6600]/15 rounded-xl flex items-center justify-center text-[#FF6600]"><i className={floatingCards[0]?.icon} /></div>
                  <div>
                    <h4 className="font-semibold text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>{floatingCards[0]?.label}</h4>
                    <p className="text-xs text-[#7A7A74]" style={{ fontFamily: 'DM Sans, sans-serif' }}>{floatingCards[0]?.value}</p>
                  </div>
                </div>
                <div className="absolute top-5 right-[-20px] lg:right-[-50px] flex items-center gap-3 p-5 bg-[#1E1E1D]/95 backdrop-blur-md border border-[#3A3A38] rounded-2xl animate-float" style={{ animation: 'float 3s ease-in-out infinite', animationDelay: '1.5s' }}>
                  <div className="w-12 h-12 bg-[#FF6600]/15 rounded-xl flex items-center justify-center text-[#FF6600]"><i className={floatingCards[1]?.icon} /></div>
                  <div>
                    <h4 className="font-semibold text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>{floatingCards[1]?.label}</h4>
                    <p className="text-xs text-[#7A7A74]" style={{ fontFamily: 'DM Sans, sans-serif' }}>{floatingCards[1]?.value}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
      `}</style>
    </section>
  )
}