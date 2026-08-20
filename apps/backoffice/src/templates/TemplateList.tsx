'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { MarketplaceView } from './MarketplaceView'
import { InstalledTab } from './InstalledTab'

interface Template {
  id: string
  name: string
  description: string
  previewImage?: { url: string }
  isActive: boolean
  version?: string
  category?: string
}

type Tab = 'installed' | 'marketplace'

export const TemplateList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'installed' | 'marketplace'>('installed')
  const [templates, setTemplates] = useState<Array<{
    id: string
    name: string
    description: string
    previewImage?: { url: string }
    isActive: boolean
    version?: string
    category?: string
  }>>([])
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
    if (activeTab === 'installed') {
      fetchTemplates()
    }
  }, [fetchTemplates, activeTab])

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

  const tabs = useMemo(() => [
    { id: 'installed' as const, label: 'Installed', count: templates.length },
    { id: 'marketplace' as const, label: 'Marketplace' },
  ], [templates.length])

  return (
    <div style={{ padding: 'var(--gutter-h)' }}>
      {/* Tabs */}
      <div style={{ marginBottom: 'calc(var(--base) * 1.5)' }}>
        <div style={{ display: 'flex', gap: 'calc(var(--base) * 0.5)', borderBottom: '1px solid var(--theme-elevation-150)', paddingBottom: 'calc(var(--base) * 0.2)' }}>
          {tabs.map(tab => {
            const isActiveTab = activeTab === tab.id
            const tabBorderBottom = `2px solid ${isActiveTab ? 'var(--theme-primary)' : 'transparent'}`
            const tabBg = isActiveTab ? 'var(--theme-primary)' : 'var(--theme-elevation-200)'
            const tabColor = isActiveTab ? 'white' : 'var(--theme-elevation-500)'
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: 'calc(var(--base) * 0.5) calc(var(--base) * 1.2)',
                  border: 'none',
                  background: 'transparent',
                  color: isActiveTab ? 'var(--theme-primary)' : 'var(--theme-elevation-500)',
                  fontWeight: isActiveTab ? 600 : 400,
                  fontSize: 'calc(var(--base) * 0.92)',
                  cursor: 'pointer',
                  borderBottom: tabBorderBottom,
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'calc(var(--base) * 0.4)',
                }}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span style={{
                    background: tabBg,
                    color: tabColor,
                    borderRadius: '10px',
                    padding: '0 6px',
                    fontSize: 'calc(var(--base) * 0.77)',
                    fontWeight: 600,
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {activeTab === 'installed' ? (
        <InstalledTab
          templates={templates}
          loading={loading}
          importing={importing}
          error={error}
          dragActive={dragActive}
          handleDrag={handleDrag}
          handleDrop={handleDrop}
          handleFileChange={handleFileChange}
          handleActivate={handleActivate}
          handleDelete={handleDelete}
          setError={setError}
          setImporting={setImporting}
          setDragActive={setDragActive}
        />
      ) : (
        <MarketplaceView />
      )}
    </div>
  )
}