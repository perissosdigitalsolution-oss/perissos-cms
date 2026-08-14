'use client'

import React, { useState, useEffect, useCallback } from 'react'

interface Template {
  id: string
  name: string
  description: string
  previewImage?: { url: string }
  isActive: boolean
  version?: string
  category?: string
}

export const TemplateList: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await fetch('/api/templates?limit=100')
      if (!response.ok) throw new Error('Failed to fetch templates')
      const data = await response.json()
      setTemplates(data.docs || [])
    } catch (err) {
      setError('Failed to load templates')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const handleZipUpload = async (file: File) => {
    if (!file.name.endsWith('.zip')) {
      setError('Please upload a ZIP file')
      return
    }

    setImporting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('zipFile', file)

      const response = await fetch('/api/templates/import-zip', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Import failed')
      }

      const result = await response.json()
      setTemplates(prev => [...prev, result.template])
      fetchTemplates()
    } catch (err: any) {
      setError(err.message || 'Failed to import template')
      console.error(err)
    } finally {
      setImporting(false)
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleZipUpload(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleZipUpload(e.target.files[0])
    }
  }

  const handleActivate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true }),
      })

      if (!response.ok) throw new Error('Failed to activate template')

      fetchTemplates()
    } catch (err) {
      setError('Failed to activate template')
      console.error(err)
    }
  }

  const handleDelete = async (templateId: string, templateName: string) => {
    if (!confirm(`Delete template "${templateName}"? This cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete template')

      setTemplates(prev => prev.filter(t => t.id !== templateId))
    } catch (err) {
      setError('Failed to delete template')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 'var(--gutter-h)', textAlign: 'center' }}>
        <span style={{ color: 'var(--theme-elevation-400)' }}>Loading templates...</span>
      </div>
    )
  }

  return (
    <div style={{ padding: 'var(--gutter-h)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'calc(var(--base) * 1.5)' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 'calc(var(--base) * 1.5)', fontWeight: 600, color: 'var(--theme-elevation-800)' }}>
            Templates
          </h1>
          <p style={{ margin: 'calc(var(--base) * 0.3) 0 0', color: 'var(--theme-elevation-400)', fontSize: 'calc(var(--base) * 0.92)' }}>
            {templates.length} template{templates.length !== 1 ? 's' : ''} installed
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

      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragActive ? 'var(--theme-elevation-600)' : 'var(--theme-elevation-200)'}`,
          borderRadius: 'var(--style-radius-l)',
          padding: 'calc(var(--base) * 2)',
          marginBottom: 'calc(var(--base) * 1.5)',
          backgroundColor: dragActive ? 'var(--theme-elevation-50)' : 'transparent',
          transition: 'border-color 0.15s, background-color 0.15s',
        }}
      >
        {importing ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--theme-elevation-600)', fontSize: 'calc(var(--base) * 1)', fontWeight: 500, marginBottom: 'calc(var(--base) * 0.3)' }}>
              Importing template...
            </div>
            <div style={{ color: 'var(--theme-elevation-400)', fontSize: 'calc(var(--base) * 0.85)' }}>
              Extracting ZIP and setting up template
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--theme-elevation-600)', fontSize: 'calc(var(--base) * 1)', fontWeight: 500, marginBottom: 'calc(var(--base) * 0.5)' }}>
              Import Template ZIP
            </div>
            <div style={{ color: 'var(--theme-elevation-400)', fontSize: 'calc(var(--base) * 0.85)', marginBottom: 'calc(var(--base) * 0.8)' }}>
              Drag &amp; drop a ZIP file here, or click to browse
            </div>
            <label className="btn btn--style-primary btn--size-medium" style={{ cursor: 'pointer' }}>
              <span className="btn__label">Choose ZIP File</span>
              <input
                type="file"
                accept=".zip"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </label>
            <div style={{ marginTop: 'calc(var(--base) * 0.8)', fontSize: 'calc(var(--base) * 0.77)', color: 'var(--theme-elevation-400)' }}>
              ZIP should contain: index.html, preview.jpg (optional), manifest.json (optional)
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      {templates.length === 0 ? (
        <div style={{
          padding: 'calc(var(--base) * 4) calc(var(--base) * 2)',
          textAlign: 'center',
          backgroundColor: 'var(--theme-elevation-50)',
          borderRadius: 'var(--style-radius-l)',
          border: '1px solid var(--theme-elevation-150)',
        }}>
          <div style={{ color: 'var(--theme-elevation-400)', fontSize: 'calc(var(--base) * 1)', marginBottom: 'calc(var(--base) * 0.3)' }}>
            No templates installed
          </div>
          <div style={{ color: 'var(--theme-elevation-400)', fontSize: 'calc(var(--base) * 0.85)' }}>
            Upload a ZIP file above to get started
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: '24px' }}></th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Description</th>
                <th style={{ ...thStyle, width: '80px' }}>Version</th>
                <th style={{ ...thStyle, width: '100px' }}>Category</th>
                <th style={{ ...thStyle, width: '100px' }}>Status</th>
                <th style={{ ...thStyle, width: '140px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template, index) => (
                <tr
                  key={template.id}
                  style={{
                    backgroundColor: index % 2 === 0 ? 'transparent' : 'var(--theme-elevation-50)',
                    cursor: 'pointer',
                    transition: 'background-color 0.1s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--theme-elevation-100)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'transparent' : 'var(--theme-elevation-50)'
                  }}
                >
                  <td style={tdStyle}>
                    {template.previewImage?.url ? (
                      <img
                        src={template.previewImage.url}
                        alt=""
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: 'var(--style-radius-s)',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: 'var(--style-radius-s)',
                        backgroundColor: 'var(--theme-elevation-100)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        color: 'var(--theme-elevation-400)',
                      }}>
                        T
                      </div>
                    )}
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 500, color: 'var(--theme-elevation-800)' }}>
                    {template.name}
                  </td>
                  <td style={{ ...tdStyle, color: 'var(--theme-elevation-500)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {template.description || '—'}
                  </td>
                  <td style={{ ...tdStyle, color: 'var(--theme-elevation-500)', fontSize: 'calc(var(--base) * 0.85)' }}>
                    {template.version ? `v${template.version}` : '—'}
                  </td>
                  <td style={{ ...tdStyle, color: 'var(--theme-elevation-500)', fontSize: 'calc(var(--base) * 0.85)' }}>
                    {template.category || '—'}
                  </td>
                  <td style={tdStyle}>
                    {template.isActive ? (
                      <span className="pill pill--style-success pill--size-small">
                        <span className="pill__label">Active</span>
                      </span>
                    ) : (
                      <span className="pill pill--style-light-gray pill--size-small">
                        <span className="pill__label">Inactive</span>
                      </span>
                    )}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 'calc(var(--base) * 0.4)', justifyContent: 'flex-end' }}>
                      {!template.isActive && (
                        <button
                          className="btn btn--style-primary btn--size-small"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleActivate(template.id)
                          }}
                        >
                          <span className="btn__label">Activate</span>
                        </button>
                      )}
                      <button
                        className="btn btn--style-subtle btn--size-small"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(template.id, template.name)
                        }}
                        style={{ color: 'var(--color-error-500)' }}
                      >
                        <span className="btn__label">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const thStyle: React.CSSProperties = {
  fontWeight: 400,
  textAlign: 'left',
  verticalAlign: 'middle',
  padding: 'calc(var(--base) * 0.6) calc(var(--base) * 0.8)',
  borderBottom: '1px solid var(--theme-elevation-150)',
  color: 'var(--theme-elevation-400)',
  fontSize: 'calc(var(--base) * 0.85)',
}

const tdStyle: React.CSSProperties = {
  padding: 'calc(var(--base) * 0.6) calc(var(--base) * 0.8)',
  borderBottom: '1px solid var(--theme-elevation-100)',
  color: 'var(--theme-elevation-600)',
  fontSize: 'calc(var(--base) * 0.92)',
  verticalAlign: 'middle',
}
