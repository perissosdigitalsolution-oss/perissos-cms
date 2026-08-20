'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { MarketplaceCard } from './MarketplaceCard'
import { TemplateDetailModal } from './TemplateDetailModal'
import { InstallConfirmModal } from './InstallConfirmModal'

interface MarketplaceTemplate {
  id: string
  name: string
  slug: string
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

export const MarketplaceView: React.FC = () => {
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [installing, setInstalling] = useState<string | null>(null)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalDocs: 0 })

  const [detailTemplate, setDetailTemplate] = useState<MarketplaceTemplate | null>(null)
  const [confirmTemplate, setConfirmTemplate] = useState<MarketplaceTemplate | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'agency', label: 'Agency' },
    { value: 'portfolio', label: 'Portfolio' },
    { value: 'saas', label: 'SaaS' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'blog', label: 'Blog' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'other', label: 'Other' },
  ]

  const fetchMarketplace = useCallback(async (page = 1) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '12' })
      if (selectedCategory !== 'all') params.set('category', selectedCategory)
      if (search) params.set('search', search)

      const response = await fetch(`/api/marketplace/templates?${params}`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setTemplates(data.docs || [])
      setPagination({ page: data.page, totalPages: data.totalPages, totalDocs: data.totalDocs })
    } catch (err: any) {
      setError(err.message || 'Failed to load marketplace')
    } finally {
      setLoading(false)
    }
  }, [search, selectedCategory])

  useEffect(() => { fetchMarketplace(1) }, [fetchMarketplace])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const handleCardClick = (template: MarketplaceTemplate) => {
    setDetailTemplate(template)
  }

  const handlePreview = (templateId: string) => {
    window.open(`/api/marketplace/preview/${templateId}?type=marketplace`, '_blank')
  }

  const handleInstallRequest = (template: MarketplaceTemplate) => {
    setDetailTemplate(null)
    setConfirmTemplate(template)
  }

  const handleConfirmInstall = async (templateId: string) => {
    const template = confirmTemplate
    if (!template) return

    setInstalling(templateId)
    setConfirmTemplate(null)

    try {
      const response = await fetch(`/api/marketplace/templates/${template.slug}/install`, {
        method: 'POST',
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Install failed')
      setToast({ type: 'success', text: `"${template.name}" installed successfully!` })
      fetchMarketplace(pagination.page)
    } catch (err: any) {
      setToast({ type: 'error', text: err.message || 'Install failed' })
    } finally {
      setInstalling(null)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto', width: '32px', height: '32px' }} />
        <p style={{ marginTop: '16px', color: 'var(--theme-elevation-500)' }}>Loading marketplace...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-error)' }}>
        <p>Error: {error}</p>
        <button onClick={() => fetchMarketplace(1)} style={{ marginTop: '16px', padding: '8px 16px', background: 'var(--theme-primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px' }}>
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 10001,
          padding: '12px 20px', borderRadius: '8px',
          background: toast.type === 'success' ? '#d4edda' : '#f8d7da',
          color: toast.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${toast.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontSize: '14px', fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`} />
          {toast.text}
        </div>
      )}

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Template Marketplace</h1>
        <p style={{ color: 'var(--theme-elevation-500)' }}>Discover and install pre-built templates for your site</p>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--theme-elevation-200)', borderRadius: '6px', background: 'var(--theme-elevation-0)', color: 'var(--theme-elevation-1000)', fontSize: '14px' }}
          />
        </div>
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          style={{ padding: '10px 14px', border: '1px solid var(--theme-elevation-200)', borderRadius: '6px', background: 'var(--theme-elevation-0)', color: 'var(--theme-elevation-1000)', fontSize: '14px', minWidth: '180px' }}
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {templates.length > 0 ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {templates.map(template => (
              <div key={template.id} onClick={() => handleCardClick(template)} style={{ cursor: 'pointer' }}>
                <MarketplaceCard
                  template={template}
                  onInstall={(id) => {
                    const t = templates.find(tmp => tmp.id === id)
                    if (t) handleInstallRequest(t)
                  }}
                  onPreview={handlePreview}
                  installing={installing === template.id}
                />
              </div>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
              <button
                onClick={() => fetchMarketplace(pagination.page - 1)}
                disabled={pagination.page <= 1}
                style={{ padding: '8px 16px', border: '1px solid var(--theme-elevation-200)', borderRadius: '6px', background: 'var(--theme-elevation-0)', cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer', opacity: pagination.page <= 1 ? 0.5 : 1 }}
              >
                Previous
              </button>
              <span style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', color: 'var(--theme-elevation-700)' }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchMarketplace(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                style={{ padding: '8px 16px', border: '1px solid var(--theme-elevation-200)', borderRadius: '6px', background: 'var(--theme-elevation-0)', cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer', opacity: pagination.page >= pagination.totalPages ? 0.5 : 1 }}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--theme-elevation-500)' }}>
          <i className="fas fa-search" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
          <h3 style={{ marginBottom: '8px' }}>No templates found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )}

      {detailTemplate && (
        <TemplateDetailModal
          template={detailTemplate}
          onClose={() => setDetailTemplate(null)}
          onInstall={(id) => {
            const t = templates.find(tmp => tmp.id === id)
            if (t) handleInstallRequest(t)
          }}
          installing={installing === detailTemplate.id}
        />
      )}

      {confirmTemplate && (
        <InstallConfirmModal
          template={confirmTemplate}
          onClose={() => setConfirmTemplate(null)}
          onConfirm={handleConfirmInstall}
          installing={installing === confirmTemplate.id}
        />
      )}
    </div>
  )
}

export default MarketplaceView
