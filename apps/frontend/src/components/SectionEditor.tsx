'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'

interface SectionEditorProps {
  section: any
  sectionIndex: number
  isOpen: boolean
  onClose: () => void
  onSave: (updatedSection: any) => void
}

const blockTypeLabels: Record<string, string> = {
  hero: 'Hero Banner',
  services: 'Services',
  about: 'About Us',
  whyUs: 'Why Choose Us',
  team: 'Team',
  portfolio: 'Portfolio',
  blog: 'Blog Posts',
  pricing: 'Pricing',
  cta: 'Call to Action',
  contact: 'Contact',
}

interface BlockField {
  name: string
  label: string
  type: 'text' | 'textarea'
  help?: string
}

function getBlockFields(blockType: string): BlockField[] {
  switch (blockType) {
    case 'hero':
      return [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'titleHighlight', label: 'Title Highlight', type: 'text', help: 'Word to highlight in title' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'badgeText', label: 'Badge Text', type: 'text' },
        { name: 'badgeIcon', label: 'Badge Icon', type: 'text', help: 'Font Awesome class e.g. fas fa-bolt' },
        { name: 'primaryButtonText', label: 'Primary Button Text', type: 'text' },
        { name: 'primaryButtonUrl', label: 'Primary Button URL', type: 'text' },
        { name: 'secondaryButtonText', label: 'Secondary Button Text', type: 'text' },
        { name: 'secondaryButtonUrl', label: 'Secondary Button URL', type: 'text' },
      ]
    case 'services':
      return [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'titleHighlight', label: 'Title Highlight', type: 'text' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'badgeText', label: 'Badge Text', type: 'text' },
      ]
    case 'about':
      return [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'titleHighlight', label: 'Title Highlight', type: 'text' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'badgeText', label: 'Badge Text', type: 'text' },
        { name: 'experienceNumber', label: 'Experience Number', type: 'text', help: 'e.g. 12+' },
        { name: 'experienceLabel', label: 'Experience Label', type: 'text', help: 'e.g. Years Experience' },
        { name: 'buttonText', label: 'Button Text', type: 'text' },
        { name: 'buttonUrl', label: 'Button URL', type: 'text' },
      ]
    case 'whyUs':
      return [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'titleHighlight', label: 'Title Highlight', type: 'text' },
        { name: 'badgeText', label: 'Badge Text', type: 'text' },
      ]
    case 'team':
      return [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'titleHighlight', label: 'Title Highlight', type: 'text' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'badgeText', label: 'Badge Text', type: 'text' },
      ]
    case 'portfolio':
      return [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'titleHighlight', label: 'Title Highlight', type: 'text' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'badgeText', label: 'Badge Text', type: 'text' },
      ]
    case 'blog':
      return [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'titleHighlight', label: 'Title Highlight', type: 'text' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'badgeText', label: 'Badge Text', type: 'text' },
      ]
    case 'pricing':
      return [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'titleHighlight', label: 'Title Highlight', type: 'text' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'badgeText', label: 'Badge Text', type: 'text' },
      ]
    case 'cta':
      return [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'buttonText', label: 'Button Text', type: 'text' },
        { name: 'buttonUrl', label: 'Button URL', type: 'text' },
      ]
    case 'contact':
      return [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'titleHighlight', label: 'Title Highlight', type: 'text' },
        { name: 'description', label: 'Description', type: 'textarea' },
      ]
    default:
      return []
  }
}

function cloneSection(section: any): any {
  if (!section) return {}
  const clone: any = {}
  for (const key of Object.keys(section)) {
    if (Array.isArray(section[key])) {
      clone[key] = JSON.parse(JSON.stringify(section[key]))
    } else if (typeof section[key] === 'object' && section[key] !== null) {
      clone[key] = { ...section[key] }
    } else {
      clone[key] = section[key]
    }
  }
  return clone
}

export function SectionEditor({ section, sectionIndex, isOpen, onClose, onSave }: SectionEditorProps) {
  const prevSectionRef = useRef<any>(null)
  const [formData, setFormData] = useState<any>(() => section ? cloneSection(section) : {})
  const panelRef = useRef<HTMLDivElement>(null)

  if (section && section !== prevSectionRef.current) {
    prevSectionRef.current = section
    const cloned = cloneSection(section)
    setFormData(cloned)
  }

  const handleChange = useCallback((fieldName: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [fieldName]: value }))
  }, [])

  const handleSave = useCallback(() => {
    onSave(formData)
    onClose()
  }, [formData, onSave, onClose])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement
        if (!target.closest('[data-section-editor]')) {
          onClose()
        }
      }
    }
    if (isOpen) {
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 100)
      return () => {
        clearTimeout(timer)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen, onClose])

  if (!isOpen || !section) return null

  const fields = getBlockFields(section.blockType)

  return (
    <div
      ref={panelRef}
      data-section-editor
      style={{
        position: 'fixed',
        top: '60px',
        right: 0,
        width: '360px',
        height: 'calc(100vh - 60px)',
        background: '#fff',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
        zIndex: 9998,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'DM Sans, sans-serif',
        animation: 'slideInRight 0.2s ease-out',
      }}
    >
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #e5e5e5',
        background: '#fafafa',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1a1a1a', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Edit {blockTypeLabels[section.blockType] || section.blockType}
          </h3>
          <button
            onClick={onClose}
            style={{
              padding: '4px 8px',
              background: 'none',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            <i className="fas fa-times" />
          </button>
        </div>
        <div style={{ fontSize: '12px', color: '#7A7A74' }}>
          Section {sectionIndex + 1} — {section.blockType}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {fields.map(field => (
          <div key={field.name} style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '6px',
            }}>
              {field.label}
            </label>
            {field.type === 'text' && (
              <input
                type="text"
                value={formData[field.name] ?? ''}
                onChange={e => handleChange(field.name, e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'DM Sans, sans-serif',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#FF6600'}
                onBlur={e => e.target.style.borderColor = '#e5e5e5'}
              />
            )}
            {field.type === 'textarea' && (
              <textarea
                value={formData[field.name] ?? ''}
                onChange={e => handleChange(field.name, e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'DM Sans, sans-serif',
                  outline: 'none',
                  resize: 'vertical',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#FF6600'}
                onBlur={e => e.target.style.borderColor = '#e5e5e5'}
              />
            )}
            {field.help && (
              <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                {field.help}
              </div>
            )}
          </div>
        ))}
        {fields.length === 0 && (
          <div style={{ fontSize: '13px', color: '#999', textAlign: 'center', padding: '40px 0' }}>
            No editable fields for this section type.
          </div>
        )}
      </div>

      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid #e5e5e5',
        background: '#fafafa',
        display: 'flex',
        gap: '8px',
      }}>
        <button
          onClick={onClose}
          style={{
            flex: 1,
            padding: '10px',
            background: '#fff',
            border: '1px solid #e5e5e5',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            color: '#666',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          style={{
            flex: 1,
            padding: '10px',
            background: '#FF6600',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            color: '#fff',
          }}
        >
          Apply Changes
        </button>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}

export default SectionEditor
