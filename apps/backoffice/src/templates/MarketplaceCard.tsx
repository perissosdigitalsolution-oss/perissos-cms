'use client'

import React from 'react'
import { formatAdminURL } from 'payload/shared'
import Link from 'next/link'

interface MarketplaceCardProps {
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
    rating: number
    downloads: number
    publishedAt: string
    verified: boolean
  }
  onInstall: (id: string) => void
  onPreview?: (id: string) => void
  installing: boolean
}

export const MarketplaceCard: React.FC<MarketplaceCardProps> = ({
  template,
  onInstall,
  onPreview,
  installing,
}) => {
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

  const handleInstall = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onInstall(template.id)
  }

  return (
    <div
      style={{
        border: '1px solid var(--theme-elevation-200)',
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'var(--theme-elevation-0)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--theme-elevation-300)'
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--theme-elevation-200)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Preview Image */}
      <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden' }}>
        {template.previewImage ? (
          <img
            src={typeof template.previewImage === 'string' ? template.previewImage : template.previewImage?.url || ''}
            alt={template.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s',
            }}
            loading="lazy"
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, var(--theme-elevation-100) 0%, var(--theme-elevation-200) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <i className="fas fa-file-alt" style={{ fontSize: '48px', color: 'var(--theme-elevation-400)' }} />
          </div>
        )}

        {/* Premium Badge */}
        {template.isPremium && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'var(--theme-elevation-1000)',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <i className="fas fa-lock" style={{ fontSize: '10px' }} />
            {template.requiredPlan.charAt(0).toUpperCase() + template.requiredPlan.slice(1)}
          </div>
        )}

        {/* Verified Badge */}
        {template.verified && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'var(--theme-success-500)',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <i className="fas fa-check" style={{ fontSize: '10px' }} />
            Verified
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
      }}>
        {/* Category */}
        <div style={{ marginBottom: '8px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: 'var(--theme-primary)',
            background: 'rgba(255, 102, 0, 0.1)',
            padding: '2px 8px',
            borderRadius: '12px',
          }}>
            {categoryLabels[template.category] || template.category}
          </span>
        </div>

        {/* Name & Version */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 700,
            margin: 0,
            color: 'var(--theme-elevation-1000)',
          }}>
            {template.name}
          </h3>
          <span style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--theme-elevation-500)',
            background: 'var(--theme-elevation-100)',
            padding: '2px 8px',
            borderRadius: '4px',
          }}>
            v{template.version}
          </span>
        </div>

        {/* Description */}
        <p style={{
          fontSize: '14px',
          color: 'var(--theme-elevation-600)',
          lineHeight: 1.5,
          marginBottom: '12px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {template.description}
        </p>

        {/* Meta */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '12px',
          fontSize: '12px',
          color: 'var(--theme-elevation-500)',
          flexWrap: 'wrap',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <i className="fas fa-star" style={{ color: '#FFD700' }} />
            {template.rating ? template.rating.toFixed(1) : '—'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <i className="fas fa-download" />
            {formatNumber(template.downloads)}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <i className="fas fa-user" />
            {template.author}
          </span>
        </div>

        {/* Tags */}
        {template.tags.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            marginBottom: '16px',
          }}>
            {template.tags.slice(0, 4).map((tag, i) => (
              <span key={tag.id || `tag-${i}`} style={{
                fontSize: '11px',
                background: 'var(--theme-elevation-100)',
                color: 'var(--theme-elevation-600)',
                padding: '2px 8px',
                borderRadius: '4px',
              }}>
                {typeof tag === 'string' ? tag : tag.tag}
              </span>
            ))}
            {template.tags.length > 4 && (
              <span style={{
                fontSize: '11px',
                color: 'var(--theme-elevation-500)',
              }}>
                +{template.tags.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
          {onPreview && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPreview(template.id) }}
              style={{
                flex: 1,
                padding: '10px 12px',
                border: '1px solid var(--theme-elevation-200)',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                background: 'white',
                color: 'var(--theme-elevation-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <i className="fas fa-external-link-alt" style={{ fontSize: '11px' }} />
              Preview
            </button>
          )}
          <button
            onClick={handleInstall}
            disabled={installing}
            style={{
              flex: 1,
              padding: '10px 12px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: installing ? 'not-allowed' : 'pointer',
              background: template.isPremium
                ? 'var(--theme-elevation-100)'
                : 'var(--theme-primary)',
              color: template.isPremium
                ? 'var(--theme-elevation-600)'
                : 'white',
              opacity: installing ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            {installing ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} />
                Installing...
              </span>
            ) : template.isPremium ? (
              <><i className="fas fa-lock" style={{ fontSize: '11px' }} /> Upgrade to Install</>
            ) : (
              <><i className="fas fa-download" style={{ fontSize: '11px' }} /> Install</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MarketplaceCard