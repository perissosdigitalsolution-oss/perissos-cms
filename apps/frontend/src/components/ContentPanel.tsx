'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { SectionEditor } from './SectionEditor'

interface ContentPanelProps {
  isOpen: boolean
  onClose: () => void
  sections: any[]
  pageId: string | null
  cmsUrl: string
  onSectionsChange: (sections: any[]) => void
  templateCategory?: string
}

interface SectionDefinition {
  label: string
  icon: string
  fields: Array<{
    name: string
    label: string
    type: string
    help?: string
    itemFields?: Array<{ name: string; label: string; type: string; help?: string }>
  }>
}

export function ContentPanel({ isOpen, onClose, sections, pageId, cmsUrl, onSectionsChange, templateCategory }: ContentPanelProps) {
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [sectionDefs, setSectionDefs] = useState<Record<string, SectionDefinition>>({})

  // Load section definitions from template layoutConfig
  useEffect(() => {
    if (!templateCategory) return
    fetch(`${cmsUrl}/api/templates?where[category][equals]=${templateCategory}&depth=1`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const template = data.docs?.[0]
        const layoutConfig = template?.layoutConfig
        if (layoutConfig?.sectionDefinitions) {
          setSectionDefs(layoutConfig.sectionDefinitions)
        }
      })
      .catch(() => {})
  }, [templateCategory, cmsUrl])

  const handleSaveSection = useCallback(async (updatedSection: any) => {
    if (selectedSectionIndex === null || !pageId) return

    const newSections = [...sections]
    newSections[selectedSectionIndex] = updatedSection
    onSectionsChange(newSections)
    setSelectedSectionIndex(null)

    setIsSaving(true)
    try {
      await fetch(`${cmsUrl}/api/pages/${pageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sections: newSections }),
      })
    } catch (err) {
      console.error('Save section failed:', err)
    } finally {
      setIsSaving(false)
    }
  }, [selectedSectionIndex, sections, pageId, cmsUrl, onSectionsChange])

  if (!isOpen) return null

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '380px',
          zIndex: 10000,
          background: '#1a1a1a',
          borderLeft: '2px solid #FF6600',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'DM Sans, sans-serif',
          animation: 'slideInRight 0.2s ease-out',
        }}
      >
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>

        <div style={{
          padding: '16px',
          borderBottom: '1px solid #333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-edit" style={{ color: '#FF6600', fontSize: '18px' }} />
            <span style={{ color: '#fff', fontSize: '16px', fontWeight: 600 }}>Edit Content</span>
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

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {sections.length === 0 ? (
            <div style={{ color: '#666', fontSize: '13px', textAlign: 'center', padding: '40px 20px' }}>
              <i className="fas fa-inbox" style={{ fontSize: '32px', marginBottom: '12px', display: 'block' }} />
              No sections found. Add sections in the backoffice Pages editor.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sections.map((section, i) => {
                const def = sectionDefs[section.blockType]
                const label = def?.label || section.blockType
                const icon = def?.icon || 'fas fa-puzzle-piece'
                const preview = section.title || section.badgeText || `Section ${i + 1}`

                return (
                  <button
                    key={`${section.blockType}-${i}`}
                    onClick={() => setSelectedSectionIndex(i)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      background: '#252525',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      width: '100%',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#FF6600'
                      e.currentTarget.style.background = '#2a2a2a'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#333'
                      e.currentTarget.style.background = '#252525'
                    }}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: 'rgba(255, 102, 0, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <i className={icon} style={{ color: '#FF6600', fontSize: '14px' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>
                        {label}
                      </div>
                      <div style={{ color: '#666', fontSize: '11px', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {preview}
                      </div>
                    </div>
                    <i className="fas fa-chevron-right" style={{ color: '#555', fontSize: '12px' }} />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div style={{
          padding: '16px',
          borderTop: '1px solid #333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ color: '#666', fontSize: '11px' }}>
            {sections.length} section{sections.length !== 1 ? 's' : ''}
          </span>
          {isSaving && (
            <span style={{ color: '#FF6600', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fas fa-spinner fa-spin" />
              Saving...
            </span>
          )}
        </div>
      </div>

      <div
        onClick={selectedSectionIndex === null ? onClose : undefined}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: '380px',
          bottom: 0,
          background: 'rgba(0,0,0,0.3)',
          zIndex: 9999,
          pointerEvents: selectedSectionIndex === null ? 'auto' : 'none',
        }}
      />

      <SectionEditor
        section={selectedSectionIndex !== null ? sections[selectedSectionIndex] : null}
        sectionIndex={selectedSectionIndex ?? 0}
        isOpen={selectedSectionIndex !== null}
        onClose={() => setSelectedSectionIndex(null)}
        onSave={handleSaveSection}
        sectionDefs={sectionDefs}
      />
    </>
  )
}

export default ContentPanel
