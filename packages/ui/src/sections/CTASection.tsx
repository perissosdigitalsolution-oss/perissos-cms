'use client'

import React from 'react'

export interface CTAProps {
  title: string
  description?: string
  buttonText?: string
  buttonIcon?: string
  buttonUrl?: string
}

export function CTASection({
  title = 'Ready to Start Your Next Project?',
  description = "Let's collaborate and create something amazing together. Get in touch with us today and let's bring your vision to life.",
  buttonText = 'Start a Project',
  buttonIcon = 'fas fa-arrow-right',
  buttonUrl = '#contact',
}: CTAProps) {
  return (
    <section className="relative py-20 md:py-28 px-4 overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, #FF6600 0%, #E55B00 100%)', fontFamily: 'DM Sans, sans-serif' }}>
      <div className="absolute top-[-50%] right-[-20%] w-[500px] h-[500px] rounded-full bg-white/10" />
      <div className="absolute bottom-[-30%] left-[-10%] w-[400px] h-[400px] rounded-full bg-white/05" />
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h2 className="mb-4 leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800 }}>{title}</h2>
        {description && <p className="text-lg opacity-90 mb-10 max-w-2xl mx-auto" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '18px' }}>{description}</p>}
        {buttonText && (
          <a href={buttonUrl} className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold bg-white text-[#FF6600] rounded-full hover:bg-[#181817] hover:text-white transition-all duration-300" style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, borderRadius: '50px' }}>
            {buttonText}
            {buttonIcon && <i className={buttonIcon} />}
          </a>
        )}
      </div>
    </section>
  )
}