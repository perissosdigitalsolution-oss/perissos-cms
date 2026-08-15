'use client'

import React, { useState, useCallback, useEffect } from 'react'

interface PageBuilderSidebarProps {
  blocks: any[]
  onBlocksChange: (blocks: any[]) => void
  selectedBlockIndex: number | null
  onSelectBlock: (index: number | null) => void
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

const blockTypeIcons: Record<string, string> = {
  hero: 'fas fa-image',
  services: 'fas fa-cogs',
  about: 'fas fa-info-circle',
  whyUs: 'fas fa-star',
  team: 'fas fa-users',
  portfolio: 'fas fa-briefcase',
  blog: 'fas fa-newspaper',
  pricing: 'fas fa-tag',
  cta: 'fas fa-bullhorn',
  contact: 'fas fa-envelope',
}

export function PageBuilderSidebar({ blocks, onBlocksChange, selectedBlockIndex, onSelectBlock }: PageBuilderSidebarProps) {
  const [editingField, setEditingField] = useState<string | null>(null)

  const selectedBlock = selectedBlockIndex !== null ? blocks[selectedBlockIndex] : null

  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    if (selectedBlockIndex === null) return
    const newBlocks = [...blocks]
    newBlocks[selectedBlockIndex] = { ...newBlocks[selectedBlockIndex], [fieldName]: value }
    onBlocksChange(newBlocks)
  }, [blocks, onBlocksChange, selectedBlockIndex])

  const handleMoveBlock = useCallback((fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
    if (toIndex < 0 || toIndex >= blocks.length) return
    const newBlocks = [...blocks]
    const [removed] = newBlocks.splice(fromIndex, 1)
    newBlocks.splice(toIndex, 0, removed)
    onBlocksChange(newBlocks)
    onSelectBlock(toIndex)
  }, [blocks, onBlocksChange, onSelectBlock])

  const handleDuplicateBlock = useCallback((index: number) => {
    const newBlocks = [...blocks]
    newBlocks.splice(index + 1, 0, { ...blocks[index] })
    onBlocksChange(newBlocks)
    onSelectBlock(index + 1)
  }, [blocks, onBlocksChange, onSelectBlock])

  const handleDeleteBlock = useCallback((index: number) => {
    const newBlocks = blocks.filter((_, i) => i !== index)
    onBlocksChange(newBlocks)
    onSelectBlock(null)
  }, [blocks, onBlocksChange, onSelectBlock])

  if (!selectedBlock) {
    return (
      <div style={{
        width: '320px',
        background: '#fafafa',
        borderLeft: '1px solid #e5e5e5',
        fontFamily: 'DM Sans, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e5e5' }}>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#1a1a1a', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Section Settings
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#7A7A74' }}>
            Click a section to edit its properties
          </p>
        </div>
        <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
          <div style={{ marginBottom: '12px', fontSize: '12px', fontWeight: 500, color: '#7A7A74', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Page Sections ({blocks.length})
          </div>
          {blocks.map((block, index) => (
            <div
              key={index}
              onClick={() => onSelectBlock(index)}
              style={{
                padding: '12px',
                marginBottom: '8px',
                background: '#fff',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#FF6600'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 102, 0, 0.1)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#e5e5e5'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: 'rgba(255, 102, 0, 0.1)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FF6600',
                  fontSize: '14px',
                }}>
                  <i className={blockTypeIcons[block.blockType] || 'fas fa-cube'} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#1a1a1a' }}>
                    {blockTypeLabels[block.blockType] || block.blockType}
                  </div>
                  <div style={{ fontSize: '11px', color: '#7A7A74' }}>
                    {block.blockName || 'Untitled'}
                  </div>
                </div>
                <i className="fas fa-chevron-right" style={{ fontSize: '10px', color: '#7A7A74' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const blockFields = getBlockFields(selectedBlock.blockType)

  return (
    <div style={{
      width: '320px',
      background: '#fafafa',
      borderLeft: '1px solid #e5e5e5',
      fontFamily: 'DM Sans, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid #e5e5e5', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => onSelectBlock(null)}
              style={{
                padding: '4px 8px',
                background: 'none',
                border: 'none',
                color: '#7A7A74',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              <i className="fas fa-arrow-left" /> Back
            </button>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => handleMoveBlock(selectedBlockIndex!, 'up')}
              disabled={selectedBlockIndex === 0}
              style={{
                padding: '4px 8px',
                background: selectedBlockIndex === 0 ? '#f5f5f5' : '#fff',
                border: '1px solid #e5e5e5',
                borderRadius: '4px',
                cursor: selectedBlockIndex === 0 ? 'not-allowed' : 'pointer',
                color: selectedBlockIndex === 0 ? '#ccc' : '#666',
                fontSize: '12px',
              }}
            >
              <i className="fas fa-arrow-up" />
            </button>
            <button
              onClick={() => handleMoveBlock(selectedBlockIndex!, 'down')}
              disabled={selectedBlockIndex === blocks.length - 1}
              style={{
                padding: '4px 8px',
                background: selectedBlockIndex === blocks.length - 1 ? '#f5f5f5' : '#fff',
                border: '1px solid #e5e5e5',
                borderRadius: '4px',
                cursor: selectedBlockIndex === blocks.length - 1 ? 'not-allowed' : 'pointer',
                color: selectedBlockIndex === blocks.length - 1 ? '#ccc' : '#666',
                fontSize: '12px',
              }}
            >
              <i className="fas fa-arrow-down" />
            </button>
            <button
              onClick={() => handleDuplicateBlock(selectedBlockIndex!)}
              style={{
                padding: '4px 8px',
                background: '#fff',
                border: '1px solid #e5e5e5',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#666',
                fontSize: '12px',
              }}
            >
              <i className="fas fa-copy" />
            </button>
            <button
              onClick={() => handleDeleteBlock(selectedBlockIndex!)}
              style={{
                padding: '4px 8px',
                background: '#fff',
                border: '1px solid #fee2e2',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#dc2626',
                fontSize: '12px',
              }}
            >
              <i className="fas fa-trash" />
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            background: 'rgba(255, 102, 0, 0.1)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FF6600',
            fontSize: '12px',
          }}>
            <i className={blockTypeIcons[selectedBlock.blockType] || 'fas fa-cube'} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>
              {blockTypeLabels[selectedBlock.blockType] || selectedBlock.blockType}
            </div>
            <div style={{ fontSize: '11px', color: '#7A7A74' }}>
              Section {selectedBlockIndex! + 1} of {blocks.length}
            </div>
          </div>
        </div>
      </div>

      {/* Fields */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {blockFields.map(field => (
          <div key={field.name} style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '4px',
            }}>
              {field.label}
              {field.required && <span style={{ color: '#dc2626', marginLeft: '2px' }}>*</span>}
            </label>
            {field.type === 'text' && (
              <input
                type="text"
                value={selectedBlock[field.name] || ''}
                onChange={e => handleFieldChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontFamily: 'DM Sans, sans-serif',
                  outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = '#FF6600'}
                onBlur={e => e.target.style.borderColor = '#e5e5e5'}
              />
            )}
            {field.type === 'textarea' && (
              <textarea
                value={selectedBlock[field.name] || ''}
                onChange={e => handleFieldChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontFamily: 'DM Sans, sans-serif',
                  outline: 'none',
                  resize: 'vertical',
                }}
                onFocus={e => e.target.style.borderColor = '#FF6600'}
                onBlur={e => e.target.style.borderColor = '#e5e5e5'}
              />
            )}
            {field.type === 'boolean' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={selectedBlock[field.name] || false}
                  onChange={e => handleFieldChange(field.name, e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#FF6600' }}
                />
                <span style={{ fontSize: '12px', color: '#6B7280' }}>{field.helpText}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

interface BlockField {
  name: string
  label: string
  type: 'text' | 'textarea' | 'boolean' | 'select'
  placeholder?: string
  helpText?: string
  required?: boolean
  options?: string[]
}

function getBlockFields(blockType: string): BlockField[] {
  const commonFields: BlockField[] = [
    { name: 'blockName', label: 'Section Name', type: 'text', placeholder: 'Enter section name' },
  ]

  switch (blockType) {
    case 'hero':
      return [
        ...commonFields,
        { name: 'title', label: 'Title', type: 'text', placeholder: 'Enter hero title', required: true },
        { name: 'subtitle', label: 'Subtitle', type: 'textarea', placeholder: 'Enter subtitle' },
        { name: 'badgeText', label: 'Badge Text', type: 'text', placeholder: 'e.g. #1 Digital Agency' },
        { name: 'primaryButtonText', label: 'Primary Button', type: 'text', placeholder: 'e.g. Get Started' },
        { name: 'secondaryButtonText', label: 'Secondary Button', type: 'text', placeholder: 'e.g. Learn More' },
        { name: 'showStats', label: 'Show Statistics', type: 'boolean', helpText: 'Display stats section' },
      ]
    case 'services':
      return [
        ...commonFields,
        { name: 'title', label: 'Title', type: 'text', placeholder: 'Enter section title', required: true },
        { name: 'subtitle', label: 'Subtitle', type: 'textarea', placeholder: 'Enter subtitle' },
      ]
    case 'about':
      return [
        ...commonFields,
        { name: 'title', label: 'Title', type: 'text', placeholder: 'Enter section title', required: true },
        { name: 'subtitle', label: 'Subtitle', type: 'textarea', placeholder: 'Enter subtitle' },
        { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Enter description' },
      ]
    case 'whyUs':
      return [
        ...commonFields,
        { name: 'title', label: 'Title', type: 'text', placeholder: 'Enter section title', required: true },
        { name: 'subtitle', label: 'Subtitle', type: 'textarea', placeholder: 'Enter subtitle' },
      ]
    case 'team':
      return [
        ...commonFields,
        { name: 'title', label: 'Title', type: 'text', placeholder: 'Enter section title', required: true },
        { name: 'subtitle', label: 'Subtitle', type: 'textarea', placeholder: 'Enter subtitle' },
      ]
    case 'portfolio':
      return [
        ...commonFields,
        { name: 'title', label: 'Title', type: 'text', placeholder: 'Enter section title', required: true },
        { name: 'subtitle', label: 'Subtitle', type: 'textarea', placeholder: 'Enter subtitle' },
      ]
    case 'blog':
      return [
        ...commonFields,
        { name: 'title', label: 'Title', type: 'text', placeholder: 'Enter section title', required: true },
        { name: 'subtitle', label: 'Subtitle', type: 'textarea', placeholder: 'Enter subtitle' },
      ]
    case 'pricing':
      return [
        ...commonFields,
        { name: 'title', label: 'Title', type: 'text', placeholder: 'Enter section title', required: true },
        { name: 'subtitle', label: 'Subtitle', type: 'textarea', placeholder: 'Enter subtitle' },
      ]
    case 'cta':
      return [
        ...commonFields,
        { name: 'title', label: 'Title', type: 'text', placeholder: 'Enter CTA title', required: true },
        { name: 'subtitle', label: 'Subtitle', type: 'textarea', placeholder: 'Enter subtitle' },
        { name: 'buttonText', label: 'Button Text', type: 'text', placeholder: 'e.g. Get Started' },
      ]
    case 'contact':
      return [
        ...commonFields,
        { name: 'title', label: 'Title', type: 'text', placeholder: 'Enter section title', required: true },
        { name: 'subtitle', label: 'Subtitle', type: 'textarea', placeholder: 'Enter subtitle' },
        { name: 'email', label: 'Email', type: 'text', placeholder: 'contact@example.com' },
        { name: 'phone', label: 'Phone', type: 'text', placeholder: '+1 (555) 123-4567' },
      ]
    default:
      return commonFields
  }
}

export default PageBuilderSidebar
