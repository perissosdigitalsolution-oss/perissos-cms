'use client'

import React from 'react'

interface TeamProps {
  badge?: string
  title: string
  description?: string
  members?: Array<{
    name: string
    role: string
    bio?: string
    image?: { url: string } | null
    social?: {
      linkedin?: string
      twitter?: string
      github?: string
    }
  }>
}

export function TeamSection({ badge, title, description, members }: TeamProps) {
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
        {members && members.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {members.map((member, index) => (
              <div key={index} className="text-center p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
                {member.image && (
                  <img src={member.image.url} alt={member.name} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" />
                )}
                <h3 className="text-xl font-bold">{member.name}</h3>
                <p className="text-purple-600 dark:text-purple-400 mb-2">{member.role}</p>
                {member.bio && <p className="text-gray-600 dark:text-gray-400 text-sm">{member.bio}</p>}
                {member.social && (
                  <div className="flex justify-center gap-4 mt-4">
                    {member.social.linkedin && (
                      <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-600">LinkedIn</a>
                    )}
                    {member.social.twitter && (
                      <a href={member.social.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-600">Twitter</a>
                    )}
                    {member.social.github && (
                      <a href={member.social.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-600">GitHub</a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
