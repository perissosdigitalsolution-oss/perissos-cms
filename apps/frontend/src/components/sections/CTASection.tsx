'use client'

import React from 'react'

interface CTAProps {
  title: string
  description?: string
  buttonText?: string
  buttonUrl?: string
}

export function CTASection({ title, description, buttonText, buttonUrl }: CTAProps) {
  return (
    <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-500">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>
        {description && <p className="text-lg text-purple-100 max-w-2xl mx-auto mb-8">{description}</p>}
        {buttonText && (
          <a href={buttonUrl || '#'} className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-purple-600 bg-white rounded-2xl shadow-lg hover:bg-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            {buttonText}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        )}
      </div>
    </section>
  )
}
