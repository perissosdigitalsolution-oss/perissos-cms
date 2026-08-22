'use client'

import React, { useEffect, useCallback, useRef, useState } from 'react'

interface ThemePanelProps {
  isOpen: boolean
  onClose: () => void
  theme: any
  onThemeChange: (theme: any) => void
  onSave: () => void
  cssVariableMapping?: Record<string, string[]>
}

// Logo Upload Component
function LogoUpload({ value, onChange, preview }: { value: string; onChange: (url: string) => void; preview: string }) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const cmsUrl = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3000'

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file)
    onChange(localPreview)
    setError(null)
    setIsUploading(true)

    try {
      // Upload to Payload CMS media endpoint
      const formData = new FormData()
      formData.append('file', file)

      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('payload-token='))
        ?.split('=')[1]

      const res = await fetch(`${cmsUrl}/api/media`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `JWT ${token}` } : {}),
        },
        body: formData,
        credentials: 'include',
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Upload failed')
      }

      const data = await res.json()
      
      // Use the uploaded media URL
      const mediaUrl = data.doc?.url || data.doc?.sizes?.thumbnail?.url || data.url
      if (mediaUrl) {
        onChange(mediaUrl)
      } else {
        throw new Error('No URL returned from upload')
      }
    } catch (err) {
      console.error('Logo upload failed:', err)
      setError(err instanceof Error ? err.message : 'Upload failed')
      // Keep local preview as fallback
    } finally {
      setIsUploading(false)
    }
  }, [cmsUrl, onChange])

  const handleRemove = useCallback(() => {
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onChange])

  const handleUrlInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    onChange(url)
  }, [onChange])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Preview */}
      <div style={{ position: 'relative', display: 'inline-block', width: '100%', maxWidth: '200px' }}>
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            style={{
              width: '100%',
              maxHeight: '80px',
              borderRadius: '6px',
              border: '1px solid #444',
              objectFit: 'contain',
              background: '#1a1a1a',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '80px',
              border: '2px dashed #444',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666',
              fontSize: '12px',
            }}
          >
            No logo
          </div>
        )}
        {preview && (
          <button
            type="button"
            onClick={handleRemove}
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
            }}
          >
            <i className="fas fa-times" />
          </button>
        )}
      </div>

      {/* Upload / URL inputs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          style={{
            padding: '8px 14px',
            background: isUploading ? '#444' : '#FF6600',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            cursor: isUploading ? 'not-allowed' : 'pointer',
            width: 'fit-content',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {isUploading ? (
            <>
              <i className="fas fa-spinner fa-spin" />
              Uploading...
            </>
          ) : (
            <>
              <i className="fas fa-upload" />
              Upload Logo
            </>
          )}
        </button>

        {/* Or use URL */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#666', fontSize: '11px' }}>or</span>
          <input
            type="url"
            value={value || ''}
            onChange={handleUrlInput}
            placeholder="https://example.com/logo.png"
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #444',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#fff',
              backgroundColor: '#252525',
            }}
          />
        </div>
      </div>

      {error && (
        <div style={{ color: '#ef4444', fontSize: '11px' }}>
          {error}
        </div>
      )}
    </div>
  )
}

const DEFAULT_THEME = {
  primary: '#c8a97e',
  primaryHover: '#b8956a',
  dark: '#1a1a1a',
  dark2: '#1E1E1D',
  dark3: '#2A2A28',
  light: '#fafafa',
  white: '#FFFFFF',
  gray: '#666666',
  border: '#e0e0e0',
  fontBody: 'Open Sans, sans-serif',
  fontHeading: 'Roboto Slab, serif',
  borderRadius: '4px',
  spacing: '16px',
  logoLight: '',
  logoDark: '',
}

export function ThemePanel({ isOpen, onClose, theme: initialTheme, onThemeChange, onSave, cssVariableMapping }: ThemePanelProps) {
  const [theme, setTheme] = React.useState<any>(initialTheme || DEFAULT_THEME)
  const [activeTab, setActiveTab] = React.useState<'colors' | 'fonts' | 'logo' | 'advanced'>('colors')

  const cmsUrl = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3000'

  useEffect(() => {
    if (initialTheme) {
      setTheme(initialTheme)
    }
  }, [initialTheme])

  useEffect(() => {
    onThemeChange?.(theme)
    const root = document.documentElement
    // Helper: read value from theme, supporting both DB keys ("--primary") and camelCase ("primary")
    const tv = (camelKey: string, dbKey: string): string | undefined =>
      theme[camelKey] ?? theme[dbKey]
    // Generic CSS variables (for React component sections)
    root.style.setProperty('--primary', tv('primary', '--primary') || '')
    root.style.setProperty('--primary-hover', tv('primaryHover', '--primary-hover') || '')
    root.style.setProperty('--dark', tv('dark', '--dark') || '')
    root.style.setProperty('--dark-2', tv('dark2', '--dark-2') || '')
    root.style.setProperty('--dark-3', tv('dark3', '--dark-3') || '')
    root.style.setProperty('--light', tv('light', '--light') || '')
    root.style.setProperty('--white', tv('white', '--white') || '')
    root.style.setProperty('--gray', tv('gray', '--gray') || '')
    root.style.setProperty('--border', tv('border', '--border') || '')
    root.style.setProperty('--font-body', tv('fontBody', '--font-body') || '')
    root.style.setProperty('--font-heading', tv('fontHeading', '--font-heading') || '')
    root.style.setProperty('--border-radius', tv('borderRadius', '--border-radius') || '')
    root.style.setProperty('--spacing', tv('spacing', '--spacing') || '')
    // Template-specific CSS variables from layoutConfig mapping
    if (cssVariableMapping) {
      const themeKeyToValue: Record<string, string> = {
        primary: tv('primary', '--primary') || '',
        primaryHover: tv('primaryHover', '--primary-hover') || '',
        dark: tv('dark', '--dark') || '',
        light: tv('light', '--light') || tv('white', '--white') || '',
        white: tv('white', '--white') || '',
        gray: tv('gray', '--gray') || '',
        border: tv('border', '--border') || '',
        fontBody: tv('fontBody', '--font-body') || '',
        fontHeading: tv('fontHeading', '--font-heading') || '',
      }
      for (const [themeKey, cssVars] of Object.entries(cssVariableMapping)) {
        const value = themeKeyToValue[themeKey]
        if (value) {
          for (const cssVar of cssVars) {
            root.style.setProperty(cssVar, value)
          }
        }
      }
    }
  }, [theme, onThemeChange, cssVariableMapping])

  const handleThemeChange = useCallback((key: string, value: string) => {
    setTheme((prev: any) => ({ ...prev, [key]: value }))
  }, [])

  const handleResetTheme = useCallback(() => {
    setTheme(DEFAULT_THEME)
  }, [])

  const colorOptions = [
    { key: 'primary', label: 'Primary (Brand)', help: 'Main brand color - buttons, links, accents' },
    { key: 'primaryHover', label: 'Primary Hover', help: 'Darker shade for hover states' },
    { key: 'dark', label: 'Dark Background', help: 'Main dark background color' },
    { key: 'dark2', label: 'Dark Variant 2', help: 'Secondary dark background' },
    { key: 'dark3', label: 'Dark Variant 3', help: 'Tertiary dark background' },
    { key: 'light', label: 'Light Background', help: 'Light section backgrounds' },
    { key: 'white', label: 'White', help: 'Pure white color' },
    { key: 'gray', label: 'Gray Text', help: 'Muted text color' },
    { key: 'border', label: 'Border', help: 'Border/divider color' },
  ]

  const fontOptions = [
    { key: 'fontHeading', label: 'Heading Font', help: 'Used for titles, headings' },
    { key: 'fontBody', label: 'Body Font', help: 'Used for paragraphs, UI text' },
  ]

  const fontPresets = [
    { name: 'Food Express (Marcellus / Roboto Slab)', heading: 'Roboto Slab, serif', body: 'Open Sans, sans-serif' },
    { name: 'Default (Plus Jakarta / DM Sans)', heading: 'Plus Jakarta Sans, sans-serif', body: 'DM Sans, sans-serif' },
    { name: 'Modern (Inter / Inter)', heading: 'Inter, sans-serif', body: 'Inter, sans-serif' },
    { name: 'Classic (Merriweather / Source Sans)', heading: 'Merriweather, serif', body: 'Source Sans Pro, sans-serif' },
    { name: 'Tech (JetBrains Mono / Space Grotesk)', heading: 'Space Grotesk, sans-serif', body: 'JetBrains Mono, monospace' },
    { name: 'Elegant (Playfair Display / Lora)', heading: 'Playfair Display, serif', body: 'Lora, serif' },
  ]

  if (!isOpen) return null

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '320px',
          zIndex: 10000,
          background: '#1a1a1a',
          borderRight: '2px solid #FF6600',
          boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'DM Sans, sans-serif',
          animation: 'slideInLeft 0.2s ease-out',
        }}
      >
        <style>{`
          @keyframes slideInLeft {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }
        `}</style>

        {/* Header */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-palette" style={{ color: '#FF6600', fontSize: '18px' }} />
            <span style={{ color: '#fff', fontSize: '16px', fontWeight: 600 }}>Theme</span>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '4px 8px',
              background: 'transparent',
              color: '#999',
              border: '1px solid #444',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #333',
          background: '#141414',
        }}>
          {(['colors', 'fonts', 'logo', 'advanced'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '12px 8px',
                background: activeTab === tab ? '#1a1a1a' : 'transparent',
                color: activeTab === tab ? '#FF6600' : '#999',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #FF6600' : '2px solid transparent',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                textTransform: 'capitalize',
              }}
            >
              {tab === 'colors' && <i className="fas fa-tint" />}
              {tab === 'fonts' && <i className="fas fa-font" />}
              {tab === 'logo' && <i className="fas fa-image" />}
              {tab === 'advanced' && <i className="fas fa-sliders-h" />}
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {activeTab === 'colors' && (
            <div>
              <h4 style={{ color: '#fff', fontSize: '13px', fontWeight: 600, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Colors
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {colorOptions.map(opt => (
                  <div key={opt.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', color: '#888', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {opt.label}
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="color"
                        value={theme[opt.key as keyof typeof theme]}
                        onChange={e => handleThemeChange(opt.key, e.target.value)}
                        style={{
                          width: '40px',
                          height: '40px',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          background: 'none',
                        }}
                      />
                      <input
                        type="text"
                        value={theme[opt.key as keyof typeof theme]}
                        onChange={e => handleThemeChange(opt.key, e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: '#252525',
                          border: '1px solid #444',
                          borderRadius: '6px',
                          color: '#fff',
                          fontSize: '13px',
                          fontFamily: 'monospace',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '10px', color: '#666' }}>{opt.help}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'fonts' && (
            <div>
              <h4 style={{ color: '#fff', fontSize: '13px', fontWeight: 600, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Font Presets
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                {fontPresets.map(preset => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      handleThemeChange('fontHeading', preset.heading)
                      handleThemeChange('fontBody', preset.body)
                    }}
                    style={{
                      padding: '10px 14px',
                      background: '#252525',
                      border: '1px solid #444',
                      borderRadius: '6px',
                      color: '#ccc',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#FF6600'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#444'}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>

              <h4 style={{ color: '#fff', fontSize: '13px', fontWeight: 600, marginBottom: '16px', marginTop: '24px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Custom Fonts
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {fontOptions.map(opt => (
                  <div key={opt.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', color: '#888', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {opt.label}
                    </label>
                    <input
                      type="text"
                      value={theme[opt.key as keyof typeof theme]}
                      onChange={e => handleThemeChange(opt.key, e.target.value)}
                      placeholder="e.g. Inter, sans-serif"
                      style={{
                        padding: '10px 12px',
                        background: '#252525',
                        border: '1px solid #444',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                      }}
                    />
                    <span style={{ fontSize: '10px', color: '#666' }}>{opt.help}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'logo' && (
            <div>
              <h4 style={{ color: '#fff', fontSize: '13px', fontWeight: 600, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Logo (Light / Dark Mode)
              </h4>
              <p style={{ color: '#888', fontSize: '11px', marginBottom: '16px', lineHeight: 1.5 }}>
                Upload separate logos for light and dark backgrounds. The logo appears in the header.
              </p>
              
              {/* Light Logo */}
              <div style={{ marginBottom: '24px', padding: '16px', background: '#252525', borderRadius: '8px', border: '1px solid #333' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', color: '#fff', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <i className="fas fa-sun" style={{ color: '#FFB800', marginRight: '8px' }} />
                    Light Mode Logo
                  </label>
                  <span style={{ fontSize: '10px', color: '#666', background: '#1a1a1a', padding: '2px 8px', borderRadius: '4px' }}>
                    Used on light backgrounds
                  </span>
                </div>
                <LogoUpload
                  value={theme.logoLight}
                  onChange={(url) => handleThemeChange('logoLight', url)}
                  preview={theme.logoLight}
                />
              </div>

              {/* Dark Logo */}
              <div style={{ marginBottom: '24px', padding: '16px', background: '#1a1a1a', borderRadius: '8px', border: '1px solid #333' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', color: '#fff', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <i className="fas fa-moon" style={{ color: '#60cd72', marginRight: '8px' }} />
                    Dark Mode Logo
                  </label>
                  <span style={{ fontSize: '10px', color: '#666', background: '#252525', padding: '2px 8px', borderRadius: '4px' }}>
                    Used on dark backgrounds
                  </span>
                </div>
                <LogoUpload
                  value={theme.logoDark}
                  onChange={(url) => handleThemeChange('logoDark', url)}
                  preview={theme.logoDark}
                />
              </div>

              {/* Preview Section */}
              <div style={{ padding: '16px', background: '#0d0d0d', borderRadius: '8px', border: '1px solid #333' }}>
                <label style={{ fontSize: '11px', color: '#888', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', display: 'block' }}>
                  Preview
                </label>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <span style={{ fontSize: '10px', color: '#666', display: 'block', marginBottom: '6px' }}>Light Background</span>
                    <div style={{ background: '#fff', padding: '16px', borderRadius: '6px', border: '1px solid #e5e5e5', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {theme.logoLight ? (
                        <img src={theme.logoLight} alt="Light logo preview" style={{ maxHeight: '40px', maxWidth: '100%' }} />
                      ) : (
                        <span style={{ color: '#999', fontSize: '12px' }}>No light logo</span>
                      )}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <span style={{ fontSize: '10px', color: '#666', display: 'block', marginBottom: '6px' }}>Dark Background</span>
                    <div style={{ background: '#181817', padding: '16px', borderRadius: '6px', border: '1px solid #333', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {theme.logoDark ? (
                        <img src={theme.logoDark} alt="Dark logo preview" style={{ maxHeight: '40px', maxWidth: '100%' }} />
                      ) : (
                        <span style={{ color: '#666', fontSize: '12px' }}>No dark logo</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div>
              <h4 style={{ color: '#fff', fontSize: '13px', fontWeight: 600, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Advanced
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#888', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Border Radius
                  </label>
                  <input
                    type="text"
                    value={theme.borderRadius}
                    onChange={e => setTheme((prev: any) => ({ ...prev, borderRadius: e.target.value }))}
                    style={{
                      padding: '10px 12px',
                      background: '#252525',
                      border: '1px solid #444',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '13px',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11px', color: '#888', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Base Spacing
                  </label>
                  <input
                    type="text"
                    value={theme.spacing}
                    onChange={e => setTheme((prev: any) => ({ ...prev, spacing: e.target.value }))}
                    style={{
                      padding: '10px 12px',
                      background: '#252525',
                      border: '1px solid #444',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '13px',
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid #333',
          display: 'flex',
          gap: '12px',
        }}>
          <button
            onClick={handleResetTheme}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: 'transparent',
              color: '#FF6600',
              border: '1px solid #FF6600',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <i className="fas fa-undo" />
            Reset to Default
          </button>
          <button
            onClick={() => {
              onSave()
              onClose()
            }}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: '#FF6600',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <i className="fas fa-check" />
            Save & Close
          </button>
        </div>
      </div>

      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: '320px',
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.3)',
          zIndex: 9999,
        }}
      />
    </>
  )
}

export default ThemePanel