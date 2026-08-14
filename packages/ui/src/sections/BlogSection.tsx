'use client'

import React from 'react'

export interface BlogProps {
  badgeIcon?: string
  badgeText?: string
  title: string
  titleHighlight?: string
  description?: string
  posts?: Array<{
    icon?: string
    tag?: string
    title: string
    author?: string
    readTime?: string
    date?: string
  }>
}

export function BlogSection({
  badgeIcon = 'fas fa-pen-nib',
  badgeText = 'Blog',
  title = 'Latest Insights',
  titleHighlight = 'Insights',
  description = 'Stay updated with the latest trends and insights in digital technology.',
  posts = [
    { icon: 'fas fa-robot', tag: 'AI Technology', title: 'The Future of AI in Digital Transformation', author: 'Admin', readTime: '5 Min Read', date: 'Jan 15, 2025' },
    { icon: 'fas fa-chart-bar', tag: 'Marketing', title: '10 Digital Marketing Strategies for 2025', author: 'Admin', readTime: '7 Min Read', date: 'Jan 10, 2025' },
    { icon: 'fas fa-laptop-code', tag: 'Development', title: 'Modern Web Development Best Practices', author: 'Admin', readTime: '6 Min Read', date: 'Jan 05, 2025' },
  ],
}: BlogProps) {
  return (
    <section className="py-20 md:py-28 px-4 bg-[#1E1E1D] text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-10">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts?.map((post, i) => (
            <div key={i} className="group bg-[#181817] border border-[#3A3A38] rounded-2xl overflow-hidden transition-all duration-400 hover:border-[#FF6600]/30 hover:-translate-y-2.5">
              <div className="aspect-[16/10] bg-gradient-to-br from-[#2A2A28] to-[#1E1E1D] flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg, #2A2A28 0%, #1E1E1D 100%)' }}>
                {post.icon && <i className={`${post.icon} text-[50px] opacity-15`} />}
                {post.date && (
                  <span className="absolute top-4 left-4 px-3 py-2 bg-[#FF6600] text-white rounded-xl text-sm font-semibold" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', borderRadius: '10px' }}>
                    {post.date}
                  </span>
                )}
              </div>
              <div className="p-7">
                {post.tag && (
                  <span className="inline-block mb-3 px-3 py-1 bg-[#FF6600]/10 text-[#FF6600] rounded text-xs font-semibold" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', borderRadius: '6px' }}>
                    {post.tag}
                  </span>
                )}
                <h3 className="mb-3 line-clamp-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '18px', fontWeight: 700, lineHeight: 1.4 }}>{post.title}</h3>
                <div className="flex items-center gap-4 text-sm text-[#7A7A74]" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px' }}>
                  {post.author && <span className="flex items-center gap-2"><i className="fas fa-user" /> {post.author}</span>}
                  {post.readTime && <span className="flex items-center gap-2"><i className="fas fa-clock" /> {post.readTime}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}