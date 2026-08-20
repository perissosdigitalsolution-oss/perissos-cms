'use client'

import React, { useState } from 'react'

interface TemplateDetailModalProps {
  template: {
    id: string
    name: string
    slug?: string
    description: string
    previewImage?: { url: string } | string | null
    version: string
    category: string
    tags: { id: string; tag: string }[]
    isPremium: boolean
    requiredPlan: string
    price?: number
    author: string
    authorUrl?: string
    demoUrl?: string
    documentationUrl?: string
    rating: number
    downloads: number
    publishedAt: string
    verified: boolean
    sectionDependencies?: { id: string; sectionKey: string }[]
    versions?: { id: string; version: string; changelog?: string; publishedAt?: string }[]
  }
  onClose: () => void
  onInstall: (id: string) => void
  installing: boolean
}

export const TemplateDetailModal: React.FC<TemplateDetailModalProps> = ({
  template,
  onClose,
  onInstall,
  installing,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'versions' | 'sections'>('overview')

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const categoryLabels: Record<string, string> = {
    agency: 'Agency',
    portfolio: 'Portfolio',
    saas: 'SaaS',
    restaurant: 'Restaurant',
    blog: 'Blog',
    ecommerce: 'E-commerce',
    other: 'Other',
  }

  const planLabels: Record<string, { label: string; color: string; bg: string }> = {
    free: { label: 'Free', color: '#155724', bg: '#d4edda' },
    pro: { label: 'Pro', color: '#856404', bg: '#fff3cd' },
    enterprise: { label: 'Enterprise', color: '#721c24', bg: '#f8d7da' },
  }

  const plan = planLabels[template.requiredPlan] || planLabels.free

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>{template.name}</h2>
            <span style={{ fontSize: '13px', color: 'var(--theme-elevation-500)' }}>
              v{template.version}
            </span>
            {template.verified && (
              <span style={{ ...badgeStyle, background: 'var(--theme-success-500)' }}>
                <i className="fas fa-check" style={{ fontSize: '10px' }} /> Verified
              </span>
            )}
            {template.isPremium && (
              <span style={{ ...badgeStyle, background: plan.bg, color: plan.color }}>
                {plan.label}
              </span>
            )}
          </div>
          <button onClick={onClose} style={closeBtnStyle}>
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Content */}
        <div style={bodyStyle}>
          {/* Left: Preview */}
          <div style={{ flex: '0 0 400px' }}>
            {template.previewImage ? (
              <img
                src={typeof template.previewImage === 'string' ? template.previewImage : template.previewImage?.url || ''}
                alt={template.name}
                style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--theme-elevation-200)' }}
              />
            ) : (
              <div style={placeholderStyle}>
                <i className="fas fa-file-alt" style={{ fontSize: '64px', color: 'var(--theme-elevation-300)' }} />
                <span style={{ color: 'var(--theme-elevation-400)', marginTop: '8px' }}>No preview</span>
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Description */}
            <div>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--theme-elevation-600)', lineHeight: 1.6 }}>
                {template.description}
              </p>
            </div>

            {/* Meta Grid */}
            <div style={metaGridStyle}>
              <MetaItem icon="fa-folder" label="Category" value={categoryLabels[template.category] || template.category} />
              <MetaItem icon="fa-star" label="Rating" value={template.rating ? template.rating.toFixed(1) : '—'} />
              <MetaItem icon="fa-download" label="Downloads" value={formatNumber(template.downloads)} />
              <MetaItem icon="fa-user" label="Author" value={template.author} />
            </div>

            {/* Tags */}
            {template.tags?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {template.tags.map((tag, i) => (
                  <span key={tag.id || i} style={tagStyle}>{typeof tag === 'string' ? tag : tag.tag}</span>
                ))}
              </div>
            )}

            {/* Links */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => window.open(`/api/marketplace/preview/${template.id}?type=marketplace`, '_blank')} style={linkStyle}>
                <i className="fas fa-external-link-alt" /> Live Preview
              </button>
              {template.documentationUrl && (
                <a href={template.documentationUrl} target="_blank" rel="noopener" style={linkStyle}>
                  <i className="fas fa-book" /> Documentation
                </a>
              )}
              {template.authorUrl && (
                <a href={template.authorUrl} target="_blank" rel="noopener" style={linkStyle}>
                  <i className="fas fa-globe" /> Author
                </a>
              )}
            </div>

            {/* Tabs */}
            <div style={{ borderBottom: '1px solid var(--theme-elevation-200)', display: 'flex', gap: '0' }}>
              {(['overview', 'versions', 'sections'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    ...tabBtnStyle,
                    borderBottom: activeTab === tab ? '2px solid var(--theme-primary)' : '2px solid transparent',
                    color: activeTab === tab ? 'var(--theme-primary)' : 'var(--theme-elevation-500)',
                    fontWeight: activeTab === tab ? 600 : 400,
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ flex: 1, overflow: 'auto', minHeight: '100px' }}>
              {activeTab === 'overview' && (
                <div style={{ fontSize: '13px', color: 'var(--theme-elevation-600)' }}>
                  <p>Template includes all necessary sections and assets for a complete website. Install to start customizing.</p>
                </div>
              )}
              {activeTab === 'versions' && (
                <div>
                  {template.versions && template.versions.length > 0 ? template.versions.map((v, i) => (
                    <div key={v.id || i} style={versionItemStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong>v{v.version}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--theme-elevation-400)' }}>
                          {v.publishedAt ? new Date(v.publishedAt).toLocaleDateString() : '—'}
                        </span>
                      </div>
                      {v.changelog && <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--theme-elevation-500)' }}>{v.changelog}</p>}
                    </div>
                  )) : <p style={{ color: 'var(--theme-elevation-400)' }}>No version history.</p>}
                </div>
              )}
              {activeTab === 'sections' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {template.sectionDependencies && template.sectionDependencies.length > 0 ? template.sectionDependencies.map((s, i) => (
                    <span key={s.id || i} style={tagStyle}>{s.sectionKey}</span>
                  )) : <p style={{ color: 'var(--theme-elevation-400)' }}>No section info.</p>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {template.isPremium && (
              <span style={{ fontSize: '13px', color: 'var(--theme-elevation-500)' }}>
                Requires <strong>{plan.label}</strong> plan
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onClose} style={cancelBtnStyle}>Cancel</button>
            <button
              onClick={() => onInstall(template.id)}
              disabled={installing}
              style={{
                ...installBtnStyle,
                background: template.isPremium ? 'var(--theme-elevation-100)' : 'var(--theme-primary)',
                color: template.isPremium ? 'var(--theme-elevation-600)' : 'white',
                opacity: installing ? 0.7 : 1,
                cursor: installing ? 'not-allowed' : 'pointer',
              }}
            >
              {installing ? 'Installing...' : template.isPremium ? 'Upgrade to Install' : 'Install Template'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const MetaItem: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
    <i className={`fas ${icon}`} style={{ color: 'var(--theme-elevation-400)', width: '16px', textAlign: 'center' }} />
    <span style={{ color: 'var(--theme-elevation-500)' }}>{label}:</span>
    <strong>{value}</strong>
  </div>
)

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
}

const modalStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  width: '90vw',
  maxWidth: '900px',
  maxHeight: '85vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '16px 20px',
  borderBottom: '1px solid var(--theme-elevation-200)',
}

const closeBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '18px',
  cursor: 'pointer',
  color: 'var(--theme-elevation-500)',
  padding: '4px 8px',
}

const bodyStyle: React.CSSProperties = {
  display: 'flex',
  gap: '24px',
  padding: '20px',
  flex: 1,
  overflow: 'hidden',
}

const placeholderStyle: React.CSSProperties = {
  width: '100%',
  aspectRatio: '16/10',
  background: 'var(--theme-elevation-100)',
  borderRadius: '8px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}

const metaGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '8px',
}

const badgeStyle: React.CSSProperties = {
  padding: '2px 8px',
  borderRadius: '12px',
  fontSize: '11px',
  fontWeight: 600,
}

const tagStyle: React.CSSProperties = {
  fontSize: '11px',
  background: 'var(--theme-elevation-100)',
  color: 'var(--theme-elevation-600)',
  padding: '2px 8px',
  borderRadius: '4px',
}

const linkStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'var(--theme-primary)',
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
}

const tabBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: '8px 12px',
  fontSize: '13px',
  cursor: 'pointer',
}

const versionItemStyle: React.CSSProperties = {
  padding: '8px 0',
  borderBottom: '1px solid var(--theme-elevation-100)',
}

const footerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 20px',
  borderTop: '1px solid var(--theme-elevation-200)',
}

const cancelBtnStyle: React.CSSProperties = {
  padding: '10px 16px',
  border: '1px solid var(--theme-elevation-200)',
  borderRadius: '6px',
  background: 'white',
  cursor: 'pointer',
  fontSize: '14px',
}

const installBtnStyle: React.CSSProperties = {
  padding: '10px 20px',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: 600,
}
