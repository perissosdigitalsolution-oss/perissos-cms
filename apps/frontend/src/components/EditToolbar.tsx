'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { ThemePanel } from './ThemePanel'

interface EditToolbarProps {
  pageId: string | null
  pageSlug: string
  onSave: () => void
  isSaving: boolean
  onHeightChange?: (height: number) => void
  theme?: any
  onThemeChange?: (theme: any) => void
  onOpenContent?: () => void
  onOpenPageBuilder?: () => void
  templateCategory?: string
  cssVariableMapping?: Record<string, string[]>
}

export function EditToolbar({ pageId, pageSlug, onSave, isSaving, onHeightChange, theme: initialTheme, onThemeChange, onOpenContent, onOpenPageBuilder, templateCategory, cssVariableMapping }: EditToolbarProps) {
  const [user, setUser] = useState<any>(null)
  const [showThemePanel, setShowThemePanel] = useState(false)
  const [toolbarHeight, setToolbarHeight] = useState(50)
  const toolbarRef = useRef<HTMLDivElement>(null)

  const cmsUrl = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3000'

  useEffect(() => {
    fetch(`${cmsUrl}/api/users/me`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
        }
      })
      .catch(() => {})
  }, [cmsUrl])

  useEffect(() => {
    if (toolbarRef.current) {
      const height = toolbarRef.current.offsetHeight
      setToolbarHeight(height)
      onHeightChange?.(height)
    }
  }, [user, onHeightChange])

  const handleOpenAdmin = useCallback(() => {
    if (pageId) {
      window.open(`${cmsUrl}/admin/collections/pages/${pageId}`, '_blank')
    }
  }, [cmsUrl, pageId])

  const handleLogout = useCallback(async () => {
    try {
      await fetch(`${cmsUrl}/api/users/logout`, {
        method: 'POST',
        credentials: 'include',
      })
      setUser(null)
    } catch {}
  }, [cmsUrl])

  if (!user) return null

  return (
    <>
      <div
        ref={toolbarRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          fontFamily: 'DM Sans, sans-serif',
        }}
      >
        {/* Main Toolbar - Compact single row */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          borderBottom: '2px solid #FF6600',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}>
          {/* Left - Logo & Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px',
              background: 'rgba(255, 102, 0, 0.15)',
              borderRadius: '6px',
            }}>
              <i className="fas fa-edit" style={{ color: '#FF6600', fontSize: '14px' }} />
              <span style={{ color: '#FF6600', fontSize: '13px', fontWeight: 600 }}>
                Edit Mode
              </span>
            </div>
            <div style={{ color: '#999', fontSize: '12px' }}>
              Logged in as <span style={{ color: '#fff', fontWeight: 500 }}>{user.email}</span>
            </div>
          </div>

          {/* Center - Page Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ccc', fontSize: '12px' }}>
            <i className="fas fa-file-alt" style={{ color: '#7A7A74' }} />
            <span>/{pageSlug}</span>
          </div>

          {/* Right - Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onSave}
              disabled={isSaving}
              style={{
                padding: '6px 16px',
                background: isSaving ? '#666' : '#FF6600',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background 0.2s',
              }}
            >
              {isSaving ? (
                <>
                  <i className="fas fa-spinner fa-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save" />
                  Save Changes
                </>
              )}
            </button>

            <button
              onClick={handleOpenAdmin}
              style={{
                padding: '6px 12px',
                background: 'transparent',
                color: '#ccc',
                border: '1px solid #555',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <i className="fas fa-external-link-alt" />
              Admin
            </button>

            <button
              onClick={onOpenPageBuilder}
              style={{
                padding: '6px 12px',
                background: 'transparent',
                color: '#FF6600',
                border: '1px solid #FF6600',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <i className="fas fa-pencil-ruler" />
              Page Builder
            </button>

            <button
              onClick={onOpenContent}
              style={{
                padding: '6px 12px',
                background: 'transparent',
                color: '#ccc',
                border: '1px solid #555',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <i className="fas fa-edit" />
              Content
            </button>

            <button
              onClick={() => setShowThemePanel(true)}
              style={{
                padding: '6px 12px',
                background: 'transparent',
                color: '#ccc',
                border: '1px solid #555',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <i className="fas fa-palette" />
              Theme
            </button>

            <button
              onClick={handleLogout}
              style={{
                padding: '6px 12px',
                background: 'transparent',
                color: '#999',
                border: '1px solid #444',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              <i className="fas fa-sign-out-alt" />
            </button>
          </div>
        </div>
      </div>

      {/* Theme Panel - Left Sidebar */}
<ThemePanel
          isOpen={showThemePanel}
          onClose={() => setShowThemePanel(false)}
          theme={initialTheme}
          onThemeChange={onThemeChange || (() => {})}
          onSave={onSave}
          cssVariableMapping={cssVariableMapping}
        />

      {/* Spacer to push content below toolbar */}
      <div style={{ height: toolbarHeight }} />
    </>
  )
}

export default EditToolbar