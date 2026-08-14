'use client'

import React from 'react'

interface WhyUsProps {
  badge?: string
  title: string
  description?: string
  items?: Array<{
    title: string
    description?: string
    icon?: string
  }>
}

export function WhyUsSection({ badge, title, description, items }: WhyUsProps) {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          {badge && (
            <span className="inline-block px-4 py-2 mb-4 text-sm font-semibold text-purple-600 bg-purple-100 rounded-full dark:bg-purple-900/30 dark:text-purple-400">
              {badge}
            </span>
          )}
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {title.split(' ').map((word, i) => {
              const lastWord = title.split(' ').pop()
              return word === lastWord ? <span key={i} className="text-purple-600">{word}</span> : <span key={i}>{word} </span>
            })}
          </h2>
          {description && (
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>
        {items && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {items.map((item, index) => (
              <div key={index} className="text-center p-6">
                {item.icon && <div className="text-5xl mb-4">{item.icon}</div>}
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                {item.description && (
                  <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
