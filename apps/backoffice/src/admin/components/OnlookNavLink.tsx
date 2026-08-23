'use client'

'use client'

import React from 'react'
import Link from 'next/link'

interface OnlookNavLinkProps {
  i18n: any
  payload: any
  user: any
}

export const OnlookNavLink: React.FC<OnlookNavLinkProps> = ({ i18n, payload }) => {
  const t = i18n?.t || ((key: string) => key)
  const onlookUrl = process.env.NEXT_PUBLIC_ONLOOK_URL || 'http://localhost:3002'

  return (
    <Link
      href={onlookUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="nav-link"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        borderRadius: '6px',
        color: 'var(--theme-elevation-600)',
        textDecoration: 'none',
        transition: 'background-color 0.15s, color 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.backgroundColor = 'var(--theme-elevation-100)'
        e.currentTarget.style.color = 'var(--theme-elevation-800)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.backgroundColor = 'transparent'
        e.currentTarget.style.color = 'var(--theme-elevation-600)'
      }}
    >
      <i className="fas fa-robot" style={{ fontSize: '16px', width: '20px', textAlign: 'center' }} />
      <span>{t('Onlook AI') || 'Onlook AI'}</span>
    </Link>
  )
}

export default OnlookNavLink