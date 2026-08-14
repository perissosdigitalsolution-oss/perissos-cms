'use client'

import React from 'react'

interface PortfolioProps {
  badge?: string
  title: string
  description?: string
  projects?: Array<{
    title: string
    category?: string
    description?: string
    image?: { url: string } | null
    url?: string
  }>
}

export function PortfolioSection({ badge, title, description, projects }: PortfolioProps) {
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
        {projects && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <a key={index} href={project.url || '#'} className="group block">
                <div className="relative overflow-hidden rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  {project.image && (
                    <img src={project.image.url} alt={project.title} className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    {project.category && <span className="text-sm text-purple-300">{project.category}</span>}
                    <h3 className="text-xl font-bold">{project.title}</h3>
                    {project.description && <p className="text-sm text-gray-300 mt-1">{project.description}</p>}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
