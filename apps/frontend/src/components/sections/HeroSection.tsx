'use client'

import React from 'react'

interface HeroProps {
  badge?: string
  title: string
  description?: string
  primaryButtonText?: string
  primaryButtonUrl?: string
  secondaryButtonText?: string
  secondaryButtonUrl?: string
  stats?: Array<{ value: string; label: string }>
  image?: { url: string } | null
}

export function HeroSection({ badge, title, description, primaryButtonText, primaryButtonUrl, secondaryButtonText, secondaryButtonUrl, stats, image }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {badge && (
            <span className="inline-block px-4 py-2 mb-6 text-sm font-semibold text-purple-600 bg-purple-100 rounded-full dark:bg-purple-900/30 dark:text-purple-400">
              {badge}
            </span>
          )}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            {title}
          </h1>
          {description && (
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
              {description}
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {primaryButtonText && (
              <a href={primaryButtonUrl || '#'} className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-2xl shadow-lg hover:from-purple-700 hover:to-blue-600 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                {primaryButtonText}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            )}
            {secondaryButtonText && (
              <a href={secondaryButtonUrl || '#'} className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-2xl hover:border-purple-300 hover:text-purple-600 transition-all duration-300 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-700">
                {secondaryButtonText}
              </a>
            )}
          </div>
          {stats && stats.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400">{stat.value}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        {image && (
          <div className="mt-16 max-w-4xl mx-auto">
            <img src={image.url} alt={title} className="rounded-2xl shadow-2xl" />
          </div>
        )}
      </div>
    </section>
  )
}
