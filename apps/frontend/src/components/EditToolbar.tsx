'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'

interface EditToolbarProps {
  pageId: string | null
  pageSlug: string
  onSave: () => void
  isSaving: boolean
  onHeightChange?: (height: number) => void
}

// Default theme values matching the current design
const DEFAULT_THEME = {
  colors: {
    primary: '#FF6600',
    primaryHover: '#E55A00',
    secondary: '#1a1a1a',
    accent: '#FF6600',
    background: '#ffffff',
    surface: '#fafafa',
    text: '#1a1a1a',
    textSecondary: '#666666',
    border: '#e5e5e5',
  },
  fonts: {
    heading: 'Plus Jakarta Sans, sans-serif',
    body: 'DM Sans, sans-serif',
  },
  borderRadius: '8px',
  spacing: '16px',
}

export function EditToolbar({ pageId, pageSlug, onSave, isSaving, onHeightChange }: EditToolbarProps) {
  const [user, setUser] = useState<any>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showThemePanel, setShowThemePanel] = useState(false)
  const [toolbarHeight, setToolbarHeight] = useState(50)
  const [theme, setTheme] = useState(DEFAULT_THEME)
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

  // Measure toolbar height
  useEffect(() => {
    if (toolbarRef.current) {
      const height = toolbarRef.current.offsetHeight
      setToolbarHeight(height)
      onHeightChange?.(height)
    }
  }, [isExpanded, user, showThemePanel, onHeightChange])

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value)
    })
    root.style.setProperty('--theme-font-heading', theme.fonts.heading)
    root.style.setProperty('--theme-font-body', theme.fonts.body)
    root.style.setProperty('--theme-border-radius', theme.borderRadius)
    root.style.setProperty('--theme-spacing', theme.spacing)
  }, [theme])

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

  const handleThemeColorChange = useCallback((colorKey: string, value: string) => {
    setTheme(prev => ({
      ...prev,
      colors: { ...prev.colors, [colorKey]: value }
    }))
  }, [])

  const handleThemeFontChange = useCallback((fontKey: string, value: string) => {
    setTheme(prev => ({
      ...prev,
      fonts: { ...prev.fonts, [fontKey]: value }
    }))
  }, [])

  const handleResetTheme = useCallback(() => {
    setTheme(DEFAULT_THEME)
  }, [])

  if (!user) return null

  const colorOptions = [
    { key: 'primary', label: 'Primary (Brand)', help: 'Main brand color - buttons, links, accents' },
    { key: 'primaryHover', label: 'Primary Hover', help: 'Darker shade for hover states' },
    { key: 'secondary', label: 'Secondary (Dark)', help: 'Dark backgrounds, headers, footers' },
    { key: 'accent', label: 'Accent', help: 'Secondary accent color' },
    { key: 'background', label: 'Background', help: 'Page background color' },
    { key: 'surface', label: 'Surface', help: 'Card/panel backgrounds' },
    { key: 'text', label: 'Text Primary', help: 'Main text color' },
    { key: 'textSecondary', label: 'Text Secondary', help: 'Muted text color' },
    { key: 'border', label: 'Border', help: 'Input borders, dividers' },
  ]

  const fontOptions = [
    { key: 'heading', label: 'Heading Font', help: 'Used for titles, headings' },
    { key: 'body', label: 'Body Font', help: 'Used for paragraphs, UI text' },
  ]

  const fontPresets = [
    { name: 'Default (Plus Jakarta / DM Sans)', heading: 'Plus Jakarta Sans, sans-serif', body: 'DM Sans, sans-serif' },
    { name: 'Modern (Inter / Inter)', heading: 'Inter, sans-serif', body: 'Inter, sans-serif' },
    { name: 'Classic (Merriweather / Source Sans)', heading: 'Merriweather, serif', body: 'Source Sans Pro, sans-serif' },
    { name: 'Tech (JetBrains Mono / Space Grotesk)', heading: 'Space Grotesk, sans-serif', body: 'JetBrains Mono, monospace' },
    { name: 'Elegant (Playfair Display / Lora)', heading: 'Playfair Display, serif', body: 'Lora, serif' },
  ]

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
        {/* Main Toolbar */}
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
              onClick={() => setShowThemePanel(!showThemePanel)}
              style={{
                padding: '6px 12px',
                background: showThemePanel ? '#FF6600' : 'transparent',
                color: showThemePanel ? '#fff' : '#ccc',
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
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                padding: '6px 8px',
                background: 'transparent',
                color: '#ccc',
                border: '1px solid #555',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`} />
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

        {/* Theme Customization Panel */}
        {showThemePanel && (
          <div style={{
            background: '#1a1a1a',
            borderBottom: '1px solid #333',
            padding: '16px',
            maxHeight: '50vh',
            overflowY: 'auto',
          }}>
            {/* Colors */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-tint" style={{ color: '#FF6600' }} />
                Colors
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {colorOptions.map(opt => (
                  <div key={opt.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: '#999', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {opt.label}
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="color"
                        value={theme.colors[opt.key as keyof typeof theme.colors]}
                        onChange={e => handleThemeColorChange(opt.key, e.target.value)}
                        style={{
                          width: '36px',
                          height: '36px',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          background: 'none',
                        }}
                      />
                      <input
                        type="text"
                        value={theme.colors[opt.key as keyof typeof theme.colors]}
                        onChange={e => handleThemeColorChange(opt.key, e.target.value)}
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          background: '#2d2d2d',
                          border: '1px solid #444',
                          borderRadius: '4px',
                          color: '#fff',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '10px', color: '#666' }}>{opt.help}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fonts */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-font" style={{ color: '#FF6600' }} />
                Fonts
              </h4>
              
              {/* Font Presets */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', color: '#999', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' }}>
                  Quick Presets
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {fontPresets.map(preset => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        handleThemeFontChange('heading', preset.heading)
                        handleThemeFontChange('body', preset.body)
                      }}
                      style={{
                        padding: '6px 12px',
                        background: '#2d2d2d',
                        border: '1px solid #444',
                        borderRadius: '4px',
                        color: '#ccc',
                        fontSize: '11px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#FF6600'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#444'}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Font Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {fontOptions.map(opt => (
                  <div key={opt.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: '#999', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {opt.label}
                    </label>
                    <input
                      type="text"
                      value={theme.fonts[opt.key as keyof typeof theme.fonts]}
                      onChange={e => handleThemeFontChange(opt.key, e.target.value)}
                      placeholder="e.g. Inter, sans-serif"
                      style={{
                        padding: '8px 10px',
                        background: '#2d2d2d',
                        border: '1px solid #444',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                      }}
                    />
                    <span style={{ fontSize: '10px', color: '#666' }}>{opt.help}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-sliders-h" style={{ color: '#FF6600' }} />
                Advanced
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: '#999', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Border Radius
                  </label>
                  <input
                    type="text"
                    value={theme.borderRadius}
                    onChange={e => setTheme(prev => ({ ...prev, borderRadius: e.target.value }))}
                    style={{
                      padding: '8px 10px',
                      background: '#2d2d2d',
                      border: '1px solid #444',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: '#999', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Base Spacing
                  </label>
                  <input
                    type="text"
                    value={theme.spacing}
                    onChange={e => setTheme(prev => ({ ...prev, spacing: e.target.value }))}
                    style={{
                      padding: '8px 10px',
                      background: '#2d2d2d',
                      border: '1px solid #444',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid #333' }}>
              <button
                onClick={handleResetTheme}
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  color: '#FF6600',
                  border: '1px solid #FF6600',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                <i className="fas fa-undo" style={{ marginRight: '6px' }} />
                Reset to Default
              </button>
              <button
                onClick={() => setShowThemePanel(false)}
                style={{
                  padding: '8px 16px',
                  background: '#FF6600',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                <i className="fas fa-check" style={{ marginRight: '6px' }} />
                Done
              </button>
            </div>
          </div>
        )}

        {/* Expanded Tips Panel */}
        {isExpanded && !showThemePanel && (
          <div style={{
            background: '#1a1a1a',
            borderBottom: '1px solid #333',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div style={{ color: '#7A7A74', fontSize: '12px' }}>
              <strong style={{ color: '#fff' }}>Quick Tips:</strong>
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#999' }}>
              <span><i className="fas fa-mouse-pointer" style={{ color: '#FF6600', marginRight: '4px' }} /> Click any section to edit</span>
              <span><i className="fas fa-arrows-alt" style={{ color: '#FF6600', marginRight: '4px' }} /> Drag to reorder (coming soon)</span>
              <span><i className="fas fa-eye" style={{ color: '#FF6600', marginRight: '4px' }} /> Preview changes live</span>
              <span><i className="fas fa-palette" style={{ color: '#FF6600', marginRight: '4px' }} /> Click Theme for colors/fonts</span>
            </div>
          </div>
        )}
      </div>
      {/* Spacer to push content below toolbar */}
      <div style={{ height: toolbarHeight }} />
    </>
  )
}

export default EditToolbar