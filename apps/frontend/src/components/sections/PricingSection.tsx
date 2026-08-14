'use client'

import React from 'react'

interface PricingProps {
  badge?: string
  title: string
  description?: string
  plans?: Array<{
    name: string
    price: string
    period?: string
    description?: string
    features?: Array<{ text: string }>
    buttonText?: string
    buttonUrl?: string
    highlighted?: boolean
  }>
}

export function PricingSection({ badge, title, description, plans }: PricingProps) {
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
        {plans && plans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div key={index} className={`p-8 rounded-2xl ${plan.highlighted ? 'bg-gradient-to-br from-purple-600 to-blue-500 text-white shadow-2xl scale-105' : 'bg-gray-50 dark:bg-gray-800'}`}>
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className={`text-sm ${plan.highlighted ? 'text-purple-200' : 'text-gray-500'}`}>{plan.period}</span>}
                </div>
                {plan.description && <p className={`mb-6 ${plan.highlighted ? 'text-purple-100' : 'text-gray-600 dark:text-gray-400'}`}>{plan.description}</p>}
                {plan.features && plan.features.length > 0 && (
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <svg className={`w-5 h-5 ${plan.highlighted ? 'text-purple-200' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {plan.buttonText && (
                  <a href={plan.buttonUrl || '#'} className={`block w-full py-3 text-center rounded-xl font-semibold transition-all duration-300 ${plan.highlighted ? 'bg-white text-purple-600 hover:bg-gray-100' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>
                    {plan.buttonText}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
