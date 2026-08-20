'use client'

import React from 'react'
import { formatAdminURL } from 'payload/shared'
import Link from 'next/link'

interface MarketplaceNavLinkProps {
  i18n: any
  payload: any
  user: any
}

export const MarketplaceNavLink: React.FC<MarketplaceNavLinkProps> = ({ i18n, payload }) => {
  const t = i18n?.t || ((key: string) => key)

  const adminRoute = payload?.config?.routes?.admin || '/admin'
  const marketplaceHref = formatAdminURL({
    adminRoute,
    path: '/collections/templates/marketplace',
    serverURL: payload?.config?.serverURL,
  })

  return (
    <Link
      href={marketplaceHref}
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
      <i className="fas fa-store" style={{ fontSize: '16px', width: '20px', textAlign: 'center' }} />
      <span>{t('Marketplace') || 'Marketplace'}</span>
    </Link>
  )
}

export default MarketplaceNavLink