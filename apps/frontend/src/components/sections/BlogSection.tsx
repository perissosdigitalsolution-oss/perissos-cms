'use client'

import React from 'react'

interface BlogProps {
  badge?: string
  title: string
  description?: string
  posts?: Array<{
    title: string
    excerpt?: string
    image?: { url: string } | null
    author?: string
    date?: string
    url?: string
    category?: string
  }>
}

export function BlogSection({ badge, title, description, posts }: BlogProps) {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
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
        {posts && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <a key={index} href={post.url || '#'} className="group block bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                {post.image && (
                  <img src={post.image.url} alt={post.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                )}
                <div className="p-6">
                  {post.category && <span className="text-xs font-semibold text-purple-600 uppercase">{post.category}</span>}
                  <h3 className="text-xl font-bold mt-2 mb-2 group-hover:text-purple-600 transition-colors">{post.title}</h3>
                  {post.excerpt && <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{post.excerpt}</p>}
                  <div className="flex items-center text-sm text-gray-500">
                    {post.author && <span>{post.author}</span>}
                    {post.date && <span className="mx-2">·</span>}
                    {post.date && <span>{new Date(post.date).toLocaleDateString()}</span>}
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
