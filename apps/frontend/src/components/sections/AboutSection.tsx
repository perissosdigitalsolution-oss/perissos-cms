'use client'

import React from 'react'

interface AboutProps {
  badge?: string
  title: string
  description?: string
  content?: string
  image?: { url: string } | null
  highlights?: Array<{ label: string; value: string }>
}

export function AboutSection({ badge, title, description, content, image, highlights }: AboutProps) {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            {badge && (
              <span className="inline-block px-4 py-2 mb-4 text-sm font-semibold text-purple-600 bg-purple-100 rounded-full dark:bg-purple-900/30 dark:text-purple-400">
                {badge}
              </span>
            )}
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {title.split(' ').map((word, i) => {
                const lastWord = title.split(' ').pop()
                return word === lastWord ? <span key={i} className="text-purple-600">{word}</span> : <span key={i}>{word} </span>
              })}
            </h2>
            {description && <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>}
            {content && <p className="text-gray-600 dark:text-gray-400">{content}</p>}
            {highlights && highlights.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-8">
                {highlights.map((h, i) => (
                  <div key={i}>
                    <div className="text-2xl font-bold text-purple-600">{h.value}</div>
                    <div className="text-sm text-gray-500">{h.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {image && (
            <div className="relative">
              <img src={image.url} alt={title} className="rounded-2xl shadow-xl" />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
