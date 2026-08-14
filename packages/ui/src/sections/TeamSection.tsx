'use client'

import React from 'react'

export interface TeamProps {
  badgeIcon?: string
  badgeText?: string
  title: string
  titleHighlight?: string
  description?: string
  members?: Array<{
    name: string
    role: string
    avatarIcon?: string
    social?: Array<{ icon: string; url?: string }>
  }>
}

export function TeamSection({
  badgeIcon = 'fas fa-users',
  badgeText = 'Our Team',
  title = 'Meet the Experts',
  titleHighlight = 'Experts',
  description = 'Our talented team of professionals is dedicated to delivering exceptional results for every project.',
  members = [
    { name: 'Alex Johnson', role: 'CEO & Founder', avatarIcon: 'fas fa-user', social: [{ icon: 'fab fa-linkedin-in' }, { icon: 'fab fa-twitter' }, { icon: 'fab fa-dribbble' }] },
    { name: 'Sarah Williams', role: 'Creative Director', avatarIcon: 'fas fa-user', social: [{ icon: 'fab fa-linkedin-in' }, { icon: 'fab fa-twitter' }, { icon: 'fab fa-dribbble' }] },
    { name: 'Michael Chen', role: 'Lead Developer', avatarIcon: 'fas fa-user', social: [{ icon: 'fab fa-linkedin-in' }, { icon: 'fab fa-twitter' }, { icon: 'fab fa-dribbble' }] },
    { name: 'Emily Brown', role: 'Marketing Manager', avatarIcon: 'fas fa-user', social: [{ icon: 'fab fa-linkedin-in' }, { icon: 'fab fa-twitter' }, { icon: 'fab fa-dribbble' }] },
  ],
}: TeamProps) {
  return (
    <section className="py-20 md:py-28 px-4 bg-[#181817] text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {members?.map((member, i) => (
            <div key={i} className="group bg-[#1E1E1D] border border-[#3A3A38] rounded-2xl overflow-hidden transition-all duration-400 hover:border-[#FF6600]/30 hover:-translate-y-2.5">
              <div className="aspect-square bg-gradient-to-br from-[#2A2A28] to-[#181817] flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2A2A28 0%, #181817 100%)' }}>
                <i className={`${member.avatarIcon || 'fas fa-user'} text-[60px] opacity-20`} />
                {member.social && member.social.length > 0 && (
                  <div className="absolute bottom-[-50px] left-0 right-0 flex justify-center gap-3 p-5 bg-gradient-to-t from-[#181817]/95 to-transparent transition-all duration-400 group-hover:bottom-0" style={{ background: 'linear-gradient(to top, rgba(24, 24, 23, 0.95), transparent)' }}>
                    {member.social.map((s, j) => (
                      <a key={j} href={s.url || '#'} className="w-10 h-10 bg-[#FF6600] rounded-xl flex items-center justify-center text-white text-base transition-all duration-300 hover:bg-[#E55B00] hover:-translate-y-1" style={{ borderRadius: '10px' }}>
                        <i className={s.icon} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '18px', fontWeight: 700 }}>{member.name}</h3>
                <p className="text-[#FF6600] text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}