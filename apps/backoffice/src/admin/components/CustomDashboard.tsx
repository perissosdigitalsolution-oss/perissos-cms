'use client'

import React from 'react'
import Link from 'next/link'
import { formatAdminURL } from 'payload/shared'

interface CustomDashboardProps {
  i18n: any
  payload: any
  user: any
}

export const CustomDashboard: React.FC<CustomDashboardProps> = ({ payload }) => {
  const adminRoute = payload?.config?.routes?.admin || '/admin'
  const onlookUrl = process.env.NEXT_PUBLIC_ONLOOK_URL || 'http://localhost:3002'

  const marketplaceHref = formatAdminURL({
    adminRoute,
    path: '/collections/templates/marketplace',
    serverURL: payload?.config?.serverURL,
  })

  return (
    <div style={{ padding: '0 24px 24px' }}>
      {/* Marketplace Card — positioned at top as quick action */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 600,
          marginBottom: '16px',
          color: 'var(--theme-elevation-1000)',
        }}>
          Marketplace
        </h2>
        <Link
          href={marketplaceHref}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '20px 24px',
            borderRadius: '8px',
            border: '1px solid var(--theme-elevation-150)',
            background: 'var(--theme-elevation-0)',
            textDecoration: 'none',
            color: 'var(--theme-elevation-1000)',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--theme-elevation-250)'
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--theme-elevation-150)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            background: 'var(--theme-elevation-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <i className="fas fa-store" style={{ fontSize: '22px', color: 'var(--theme-elevation-600)' }} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
              Browse Templates
            </div>
            <div style={{ fontSize: '14px', color: 'var(--theme-elevation-500)' }}>
              Discover and install pre-built templates for your site
            </div>
          </div>
          <i className="fas fa-arrow-right" style={{
            marginLeft: 'auto',
            color: 'var(--theme-elevation-400)',
            fontSize: '14px',
          }} />
        </Link>
      </div>

      {/* Onlook AI Card — Quick access to visual editor */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 600,
          marginBottom: '16px',
          color: 'var(--theme-elevation-1000)',
        }}>
          Onlook AI Visual Editor
        </h2>
        <Link
          href={onlookUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '20px 24px',
            borderRadius: '8px',
            border: '1px solid var(--theme-elevation-150)',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            textDecoration: 'none',
            color: 'var(--theme-elevation-1000)',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#667eea'
            e.currentTarget.style.boxShadow = '0 2px 12px rgba(102, 126, 234, 0.2)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--theme-elevation-150)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <i className="fas fa-robot" style={{ fontSize: '22px', color: '#fff' }} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
              Open Onlook AI Editor
            </div>
            <div style={{ fontSize: '14px', color: 'var(--theme-elevation-500)' }}>
              Visually design templates with AI — drag, drop, and generate
            </div>
          </div>
          <i className="fas fa-external-link-alt" style={{
            marginLeft: 'auto',
            color: '#667eea',
            fontSize: '14px',
          }} />
        </Link>
      </div>
    </div>
  )
}

export default CustomDashboard
