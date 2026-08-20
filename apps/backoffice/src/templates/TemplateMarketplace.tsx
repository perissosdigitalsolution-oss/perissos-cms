'use client'

import React, { useState, useEffect, useCallback } from 'react'

interface MarketplaceTemplate {
  id: string
  name: string
  description: string
  previewImage?: string
  version: string
  category: string
  tags: string[]
  downloadUrl: string
  author: string
  authorUrl?: string
  rating: number
  downloads: number
  lastUpdated: string
}

export const TemplateMarketplace: React.FC = () => {
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [installing, setInstalling] = useState<string | null>(null)

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'business', label: 'Business' },
    { value: 'portfolio', label: 'Portfolio' },
    { value: 'blog', label: 'Blog' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'landing', label: 'Landing Page' },
    { value: 'saas', label: 'SaaS' },
    { value: 'agency', label: 'Agency' },
  ]

  const fetchMarketplace = useCallback(async () => {
    try {
      const response = await fetch('/api/templates/marketplace')
      if (!response.ok) throw new Error('Failed to fetch marketplace')
      const data = await response.json()
      setTemplates(data.templates || [])
    } catch (err) {
      setError('Failed to load marketplace. Please check your connection.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMarketplace()
  }, [fetchMarketplace])

  const handleInstall = async (template: MarketplaceTemplate) => {
    setInstalling(template.id)
    setError(null)

    try {
      const response = await fetch('/api/templates/install-marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: template.id, downloadUrl: template.downloadUrl }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Install failed')
      }

      alert(`Template "${template.name}" installed successfully!`)
    } catch (err: any) {
      setError(err.message || 'Failed to install template')
      console.error(err)
    } finally {
      setInstalling(null)
    }
  }

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div style={{ padding: 'var(--gutter-h)', textAlign: 'center' }}>
        <span style={{ color: 'var(--theme-elevation-400)' }}>Loading marketplace...</span>
      </div>
    )
  }

  return (
    <div style={{ padding: 'var(--gutter-h)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'calc(var(--base) * 1.5)', flexWrap: 'wrap', gap: 'calc(var(--base) * 1)' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 'calc(var(--base) * 1.5)', fontWeight: 600, color: 'var(--theme-elevation-800)' }}>
            Template Marketplace
          </h1>
          <p style={{ margin: 'calc(var(--base) * 0.3) 0 0', color: 'var(--theme-elevation-400)', fontSize: 'calc(var(--base) * 0.92)' }}>
            Browse and install templates from the Perissos marketplace
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'calc(var(--base) * 0.8) calc(var(--base) * 1)',
          marginBottom: 'calc(var(--base) * 1)',
          backgroundColor: 'var(--color-error-50)',
          border: '1px solid var(--color-error-200)',
          borderRadius: 'var(--style-radius-m)',
          color: 'var(--color-error-600)',
          fontSize: 'calc(var(--base) * 0.92)',
        }}>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-error-600)',
              fontSize: '16px',
              padding: 0,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'calc(var(--base) * 1)', marginBottom: 'calc(var(--base) * 1.5)', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label htmlFor="marketplace-search" style={{ display: 'block', marginBottom: 'calc(var(--base) * 0.3)', fontSize: 'calc(var(--base) * 0.85)', color: 'var(--theme-elevation-500)' }}>
            Search
          </label>
          <input
            id="marketplace-search"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="text"
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ minWidth: '180px' }}>
          <label htmlFor="marketplace-category" style={{ display: 'block', marginBottom: 'calc(var(--base) * 0.3)', fontSize: 'calc(var(--base) * 0.85)', color: 'var(--theme-elevation-500)' }}>
            Category
          </label>
          <select
            id="marketplace-category"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="select"
            style={{ width: '100%' }}
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Template Grid */}
      {filteredTemplates.length === 0 ? (
        <div style={{
          padding: 'calc(var(--base) * 6) calc(var(--base) * 2)',
          textAlign: 'center',
          backgroundColor: 'var(--theme-elevation-50)',
          borderRadius: 'var(--style-radius-l)',
          border: '1px solid var(--theme-elevation-150)',
        }}>
          <div style={{ color: 'var(--theme-elevation-400)', fontSize: 'calc(var(--base) * 1)', marginBottom: 'calc(var(--base) * 0.3)' }}>
            No templates found
          </div>
          <div style={{ color: 'var(--theme-elevation-400)', fontSize: 'calc(var(--base) * 0.85)' }}>
            {search || selectedCategory !== 'all' ? 'Try adjusting your filters' : 'No templates available in marketplace'}
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 'calc(var(--base) * 1.5)',
        }}>
          {filteredTemplates.map((template, index) => (
            <div
              key={template.id}
              style={{
                border: '1px solid var(--theme-elevation-150)',
                borderRadius: 'var(--style-radius-l)',
                overflow: 'hidden',
                backgroundColor: 'var(--theme-elevation-50)',
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {/* Preview */}
              <div style={{ aspectRatio: '16/10', backgroundColor: 'var(--theme-elevation-100)', position: 'relative' }}>
                {template.previewImage ? (
                  <img
                    src={template.previewImage}
                    alt={template.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--theme-elevation-400)',
                    fontSize: 'calc(var(--base) * 1.2)',
                  }}>
                    No Preview
                  </div>
                )}
                <div style={{
                  position: 'absolute',
                  top: 'calc(var(--base) * 0.8)',
                  right: 'calc(var(--base) * 0.8)',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  padding: 'calc(var(--base) * 0.2) calc(var(--base) * 0.5)',
                  borderRadius: 'var(--style-radius-s)',
                  fontSize: 'calc(var(--base) * 0.77)',
                  fontWeight: 500,
                }}>
                  v{template.version}
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: 'calc(var(--base) * 1.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'calc(var(--base) * 0.6)' }}>
                  <h3 style={{ margin: 0, fontSize: 'calc(var(--base) * 1.1)', fontWeight: 600, color: 'var(--theme-elevation-800)' }}>
                    {template.name}
                  </h3>
                  <span style={{ fontSize: 'calc(var(--base) * 0.7)', color: 'var(--theme-elevation-400)' }}>
                    by {template.author}
                  </span>
                </div>

                <p style={{ margin: '0 0 calc(var(--base) * 0.8)', color: 'var(--theme-elevation-500)', fontSize: 'calc(var(--base) * 0.92)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {template.description}
                </p>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'calc(var(--base) * 0.4)', marginBottom: 'calc(var(--base) * 1)' }}>
                  <span className="pill pill--style-light-gray pill--size-small">
                    <span className="pill__label">{template.category}</span>
                  </span>
                  {template.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="pill pill--style-light-gray pill--size-small">
                      <span className="pill__label">{tag}</span>
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: 'calc(var(--base) * 1.5)', marginBottom: 'calc(var(--base) * 1)', fontSize: 'calc(var(--base) * 0.8)', color: 'var(--theme-elevation-400)' }}>
                  <span><i className="fas fa-star" style={{ color: '#FFB800', marginRight: 'calc(var(--base) * 0.3)' }} /> {template.rating}</span>
                  <span><i className="fas fa-download" style={{ marginRight: 'calc(var(--base) * 0.3)' }} /> {template.downloads.toLocaleString()}</span>
                </div>

                {/* Install Button */}
                <button
                  onClick={() => handleInstall(template)}
                  disabled={installing === template.id}
                  className="btn btn--style-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <span className="btn__label">
                    {installing === template.id ? (
                      <>
                        <i className="fas fa-spinner fa-spin" style={{ marginRight: 'calc(var(--base) * 0.4)' }} />
                        Installing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus" style={{ marginRight: 'calc(var(--base) * 0.4)' }} />
                        Install Template
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TemplateMarketplace