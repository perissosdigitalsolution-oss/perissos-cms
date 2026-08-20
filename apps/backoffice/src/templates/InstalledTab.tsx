'use client'

import React from 'react'
import { TemplateRow } from './TemplateRow'

interface Template {
  id: string
  name: string
  description: string
  previewImage?: { url: string }
  isActive: boolean
  version?: string
  category?: string
}

interface InstalledTabProps {
  templates: {
    id: string
    name: string
    description: string
    previewImage?: { url: string }
    isActive: boolean
    version?: string
    category?: string
  }[]
  loading: boolean
  importing: boolean
  error: string | null
  dragActive: boolean
  handleDrag: (e: React.DragEvent) => void
  handleDrop: (e: React.DragEvent) => void
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleActivate: (templateId: string) => Promise<void>
  handleDelete: (templateId: string, templateName: string) => Promise<void>
  setError: (error: string | null) => void
  setImporting: (importing: boolean) => void
  setDragActive: (dragActive: boolean) => void
}

const thStyle = {
  fontWeight: 400,
  textAlign: 'left' as const,
  verticalAlign: 'middle' as const,
  padding: 'calc(var(--base) * 0.6) calc(var(--base) * 0.8)',
  borderBottom: '1px solid var(--theme-elevation-150)',
  color: 'var(--theme-elevation-400)',
  fontSize: 'calc(var(--base) * 0.85)',
}

const tdStyle = {
  padding: 'calc(var(--base) * 0.6) calc(var(--base) * 0.8)',
  borderBottom: '1px solid var(--theme-elevation-100)',
  color: 'var(--theme-elevation-600)',
  fontSize: 'calc(var(--base) * 0.92)',
  verticalAlign: 'middle' as const,
}

export const InstalledTab = ({
  templates,
  loading,
  importing,
  error,
  dragActive,
  handleDrag,
  handleDrop,
  handleFileChange,
  handleActivate,
  handleDelete,
  setError,
  setImporting,
  setDragActive,
}: InstalledTabProps) => {
  if (loading) {
    return (
      <div style={{ padding: 'var(--gutter-h)', textAlign: 'center' }}>
        <span style={{ color: 'var(--theme-elevation-400)' }}>Loading templates...</span>
      </div>
    )
  }

  const dragBorder = '2px dashed ' + (dragActive ? 'var(--theme-elevation-600)' : 'var(--theme-elevation-200)')

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'calc(var(--base) * 1.5)' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 'calc(var(--base) * 1.5)', fontWeight: 600, color: 'var(--theme-elevation-800)' }}>
            Installed Templates
          </h1>
          <p style={{ margin: 'calc(var(--base) * 0.3) 0 0', color: 'var(--theme-elevation-400)', fontSize: 'calc(var(--base) * 0.92)' }}>
            {templates.length} template{templates.length !== 1 ? 's' : ''} installed
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'calc(var(--base) * 0.5)' }}>
          <a
            href="/admin/collections/templates/marketplace"
            className="btn btn--style-secondary"
            style={{ textDecoration: 'none' }}
          >
            <i className="fas fa-store" style={{ marginRight: 'calc(var(--base) * 0.4)' }} />
            <span className="btn__label">Browse Marketplace</span>
          </a>
        </div>
      </div>

      {error ? (
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
            \u00d7
          </button>
        </div>
      ) : null}

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{
          border: dragBorder,
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
              Drag & drop a ZIP file here, or click to browse
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
            Upload a ZIP file above to get started, or visit the <strong>Marketplace</strong> tab
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
                <TemplateRow
                  key={template.id}
                  template={template}
                  index={index}
                  tdStyle={tdStyle}
                  handleActivate={handleActivate}
                  handleDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}