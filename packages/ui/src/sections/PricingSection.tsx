'use client'

import React from 'react'

export interface PricingProps {
  badgeIcon?: string
  badgeText?: string
  title: string
  titleHighlight?: string
  description?: string
  plans?: Array<{
    name: string
    description?: string
    price: string
    period?: string
    featured?: boolean
    featuredBadge?: string
    features?: Array<{ icon?: string; text: string }>
    buttonText?: string
    buttonStyle?: 'primary' | 'outline'
    buttonUrl?: string
  }>
}

export function PricingSection({
  badgeIcon = 'fas fa-tag',
  badgeText = 'Pricing',
  title = 'Flexible Pricing Plans',
  titleHighlight = 'Pricing',
  description = 'Choose the plan that best fits your business needs and budget.',
  plans = [
    { name: 'Starter', description: 'Perfect for small businesses', price: '$499', period: '/project', featured: false, features: [{ text: 'Responsive Design' }, { text: '5 Pages Website' }, { text: 'Basic SEO' }, { text: 'Contact Form' }, { text: '1 Month Support' }], buttonText: 'Get Started', buttonStyle: 'outline' },
    { name: 'Professional', description: 'Best for growing businesses', price: '$999', period: '/project', featured: true, featuredBadge: 'Most Popular', features: [{ text: 'Everything in Starter' }, { text: '15 Pages Website' }, { text: 'Advanced SEO' }, { text: 'CMS Integration' }, { text: '3 Months Support' }], buttonText: 'Get Started', buttonStyle: 'primary' },
    { name: 'Enterprise', description: 'For large-scale projects', price: '$2499', period: '/project', featured: false, features: [{ text: 'Everything in Professional' }, { text: 'Unlimited Pages' }, { text: 'Custom Features' }, { text: 'E-Commerce Ready' }, { text: '12 Months Support' }], buttonText: 'Get Started', buttonStyle: 'outline' },
  ],
}: PricingProps) {
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans?.map((plan, i) => (
            <div key={i} className={`relative p-8 md:p-10 bg-[#1E1E1D] border rounded-2xl text-center transition-all duration-400 hover:-translate-y-2.5 ${
              plan.featured ? 'border-[#FF6600] bg-gradient-to-b from-[#FF6600]/05 to-[#1E1E1D]' : 'border-[#3A3A38]'
            }`} style={{ fontFamily: 'DM Sans, sans-serif', borderRadius: '20px' }}>
              {plan.featured && plan.featuredBadge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-5 py-2 bg-[#FF6600] text-white rounded-full text-sm font-semibold" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', borderRadius: '50px' }}>
                  {plan.featuredBadge}
                </span>
              )}
              <h3 className="mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '20px', fontWeight: 700 }}>{plan.name}</h3>
              {plan.description && <p className="text-[#7A7A74] mb-6 text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>{plan.description}</p>}
              <div className="mb-8">
                <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '56px', fontWeight: 800, color: '#FF6600' }}>{plan.price}</span>
                {plan.period && <span className="text-[#7A7A74] text-base" style={{ fontFamily: 'DM Sans, sans-serif' }}>{plan.period}</span>}
              </div>
              {plan.features && plan.features.length > 0 && (
                <div className="mb-8 text-left space-y-4">
                  {plan.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-3 py-3 border-b border-[#3A3A38] last:border-0 text-base" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      <i className={`${f.icon || 'fas fa-check'} text-[#FF6600] text-base`} />
                      <span>{f.text}</span>
                    </div>
                  ))}
                </div>
              )}
              {plan.buttonText && (
                <a href={plan.buttonUrl || '#contact'} className={`inline-flex w-full justify-center items-center gap-2 px-8 py-3 text-base font-semibold rounded-full transition-all duration-300 ${
                  plan.buttonStyle === 'primary'
                    ? 'bg-white text-[#FF6600] hover:bg-[#181817] hover:text-white'
                    : 'border border-[#3A3A38] text-white hover:border-[#FF6600] hover:text-[#FF6600]'
                }`} style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, borderRadius: '50px' }}>
                  {plan.buttonText}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}