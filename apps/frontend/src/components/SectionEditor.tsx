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

type FieldType = 'text' | 'textarea' | 'image' | 'array'

interface BlockField {
  name: string
  label: string
  type: FieldType
  help?: string
  // For array fields
  itemFields?: BlockField[]
  // For image fields
  accept?: string
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
        { name: 'mainImage', label: 'Main Image (replaces laptop icon)', type: 'image', help: 'Image URL for hero illustration' },
        { 
          name: 'stats', 
          label: 'Stats', 
          type: 'array',
          help: 'Statistics displayed in hero',
          itemFields: [
            { name: 'value', label: 'Value', type: 'text', help: 'e.g. 250+' },
            { name: 'label', label: 'Label', type: 'text', help: 'e.g. Projects Completed' },
            { name: 'icon', label: 'Icon', type: 'text', help: 'Font Awesome class (optional)' },
            { name: 'image', label: 'Image', type: 'image', help: 'Image URL (optional, replaces icon)' },
          ]
        },
        { 
          name: 'floatingCards', 
          label: 'Floating Cards', 
          type: 'array',
          help: 'Floating cards on hero image',
          itemFields: [
            { name: 'icon', label: 'Icon', type: 'text', help: 'Font Awesome class' },
            { name: 'image', label: 'Image', type: 'image', help: 'Image URL (optional, replaces icon)' },
            { name: 'label', label: 'Label', type: 'text' },
            { name: 'value', label: 'Value', type: 'text' },
          ]
        },
      ]
    case 'services':
      return [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'titleHighlight', label: 'Title Highlight', type: 'text' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'badgeText', label: 'Badge Text', type: 'text' },
        { 
          name: 'items', 
          label: 'Services', 
          type: 'array',
          help: 'Individual service cards',
          itemFields: [
            { name: 'icon', label: 'Icon', type: 'text', help: 'Font Awesome class' },
            { name: 'image', label: 'Image', type: 'image', help: 'Image URL (optional, replaces icon)' },
            { name: 'title', label: 'Title', type: 'text' },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'linkText', label: 'Link Text', type: 'text' },
            { name: 'linkIcon', label: 'Link Icon', type: 'text', help: 'Font Awesome class' },
            { name: 'linkUrl', label: 'Link URL', type: 'text' },
          ]
        },
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
        { name: 'mainImage', label: 'Main Image (replaces building icon)', type: 'image', help: 'Image URL for about illustration' },
        { 
          name: 'features', 
          label: 'Features', 
          type: 'array',
          help: 'Feature list items',
          itemFields: [
            { name: 'icon', label: 'Icon', type: 'text', help: 'Font Awesome class' },
            { name: 'image', label: 'Image', type: 'image', help: 'Image URL (optional, replaces icon)' },
            { name: 'text', label: 'Text', type: 'text' },
          ]
        },
      ]
    case 'whyUs':
      return [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'titleHighlight', label: 'Title Highlight', type: 'text' },
        { name: 'badgeText', label: 'Badge Text', type: 'text' },
        { 
          name: 'items', 
          label: 'Why Us Items', 
          type: 'array',
          help: 'Reason cards',
          itemFields: [
            { name: 'icon', label: 'Icon', type: 'text', help: 'Font Awesome class' },
            { name: 'image', label: 'Image', type: 'image', help: 'Image URL (optional, replaces icon)' },
            { name: 'label', label: 'Label', type: 'text' },
            { name: 'description', label: 'Description', type: 'textarea' },
          ]
        },
        { 
          name: 'stats', 
          label: 'Stats', 
          type: 'array',
          help: 'Statistics',
          itemFields: [
            { name: 'icon', label: 'Icon', type: 'text', help: 'Font Awesome class' },
            { name: 'image', label: 'Image', type: 'image', help: 'Image URL (optional, replaces icon)' },
            { name: 'number', label: 'Number', type: 'text' },
            { name: 'label', label: 'Label', type: 'text' },
          ]
        },
      ]
    case 'team':
      return [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'titleHighlight', label: 'Title Highlight', type: 'text' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'badgeText', label: 'Badge Text', type: 'text' },
        { 
          name: 'members', 
          label: 'Team Members', 
          type: 'array',
          help: 'Team member cards',
          itemFields: [
            { name: 'name', label: 'Name', type: 'text' },
            { name: 'role', label: 'Role', type: 'text' },
            { name: 'avatarIcon', label: 'Avatar Icon', type: 'text', help: 'Font Awesome class' },
            { name: 'avatarImage', label: 'Avatar Image', type: 'image', help: 'Image URL (optional, replaces icon)' },
            { name: 'social', label: 'Social Links', type: 'array', help: 'Social links', itemFields: [
              { name: 'icon', label: 'Icon', type: 'text', help: 'Font Awesome class' },
              { name: 'url', label: 'URL', type: 'text' },
            ]},
          ]
        },
      ]
    case 'portfolio':
      return [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'titleHighlight', label: 'Title Highlight', type: 'text' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'badgeText', label: 'Badge Text', type: 'text' },
        { 
          name: 'filters', 
          label: 'Filters', 
          type: 'array',
          help: 'Filter categories',
          itemFields: [
            { name: 'label', label: 'Label', type: 'text' },
          ]
        },
        { 
          name: 'projects', 
          label: 'Projects', 
          type: 'array',
          help: 'Portfolio projects',
          itemFields: [
            { name: 'icon', label: 'Icon', type: 'text', help: 'Font Awesome class' },
            { name: 'image', label: 'Image', type: 'image', help: 'Image URL (optional, replaces icon)' },
            { name: 'category', label: 'Category', type: 'text' },
            { name: 'title', label: 'Title', type: 'text' },
            { name: 'linkText', label: 'Link Text', type: 'text' },
            { name: 'linkIcon', label: 'Link Icon', type: 'text', help: 'Font Awesome class' },
            { name: 'linkUrl', label: 'Link URL', type: 'text' },
          ]
        },
      ]
    case 'blog':
      return [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'titleHighlight', label: 'Title Highlight', type: 'text' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'badgeText', label: 'Badge Text', type: 'text' },
        { 
          name: 'posts', 
          label: 'Blog Posts', 
          type: 'array',
          help: 'Blog post cards',
          itemFields: [
            { name: 'icon', label: 'Icon', type: 'text', help: 'Font Awesome class' },
            { name: 'image', label: 'Image', type: 'image', help: 'Image URL (optional, replaces icon)' },
            { name: 'date', label: 'Date', type: 'text' },
            { name: 'tag', label: 'Tag', type: 'text' },
            { name: 'title', label: 'Title', type: 'text' },
            { name: 'author', label: 'Author', type: 'text' },
            { name: 'readTime', label: 'Read Time', type: 'text' },
          ]
        },
      ]
    case 'pricing':
      return [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'titleHighlight', label: 'Title Highlight', type: 'text' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'badgeText', label: 'Badge Text', type: 'text' },
        { 
          name: 'plans', 
          label: 'Pricing Plans', 
          type: 'array',
          help: 'Pricing plan cards',
          itemFields: [
            { name: 'name', label: 'Plan Name', type: 'text' },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'price', label: 'Price', type: 'text' },
            { name: 'period', label: 'Period', type: 'text', help: 'e.g. /month' },
            { name: 'featured', label: 'Featured', type: 'text', help: 'true/false' },
            { name: 'featuredBadge', label: 'Featured Badge', type: 'text' },
            { name: 'buttonText', label: 'Button Text', type: 'text' },
            { name: 'buttonUrl', label: 'Button URL', type: 'text' },
            { name: 'buttonStyle', label: 'Button Style', type: 'text', help: 'primary/outline' },
            { name: 'image', label: 'Plan Image', type: 'image', help: 'Image URL for plan illustration' },
            { name: 'features', label: 'Features', type: 'array', help: 'Plan features', itemFields: [
              { name: 'icon', label: 'Icon', type: 'text', help: 'Font Awesome class' },
              { name: 'image', label: 'Image', type: 'image', help: 'Image URL (optional, replaces icon)' },
              { name: 'text', label: 'Text', type: 'text' },
            ]},
          ]
        },
      ]
    case 'cta':
      return [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'buttonText', label: 'Button Text', type: 'text' },
        { name: 'buttonUrl', label: 'Button URL', type: 'text' },
        { name: 'buttonIcon', label: 'Button Icon', type: 'text', help: 'Font Awesome class' },
        { name: 'image', label: 'Background Image', type: 'image', help: 'Image URL for CTA background' },
      ]
    case 'contact':
      return [
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'titleHighlight', label: 'Title Highlight', type: 'text' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { 
          name: 'contactItems', 
          label: 'Contact Items', 
          type: 'array',
          help: 'Contact info cards',
          itemFields: [
            { name: 'icon', label: 'Icon', type: 'text', help: 'Font Awesome class' },
            { name: 'label', label: 'Label', type: 'text' },
            { name: 'value', label: 'Value', type: 'text' },
          ]
        },
        { 
          name: 'socials', 
          label: 'Social Links', 
          type: 'array',
          help: 'Social media links',
          itemFields: [
            { name: 'icon', label: 'Icon', type: 'text', help: 'Font Awesome class' },
            { name: 'url', label: 'URL', type: 'text' },
          ]
        },
        { 
          name: 'formFields', 
          label: 'Form Fields', 
          type: 'array',
          help: 'Contact form fields',
          itemFields: [
            { name: 'name', label: 'Field Name', type: 'text' },
            { name: 'label', label: 'Label', type: 'text' },
            { name: 'type', label: 'Type', type: 'text', help: 'text/email/textarea/select' },
            { name: 'placeholder', label: 'Placeholder', type: 'text' },
            { name: 'required', label: 'Required', type: 'text', help: 'true/false' },
            { name: 'options', label: 'Options (for select)', type: 'array', help: 'Select options', itemFields: [
              { name: 'value', label: 'Value', type: 'text' },
              { name: 'label', label: 'Label', type: 'text' },
            ]},
          ]
        },
        { name: 'submitButtonText', label: 'Submit Button Text', type: 'text' },
        { name: 'submitButtonIcon', label: 'Submit Button Icon', type: 'text', help: 'Font Awesome class' },
      ]
    default:
      return []
  }
}

function getDefaultArrayItem(itemFields: BlockField[]): Record<string, any> {
  const item: Record<string, any> = {}
  for (const field of itemFields) {
    if (field.type === 'array' && field.itemFields) {
      item[field.name] = []
    } else {
      item[field.name] = ''
    }
  }
  return item
}

export function SectionEditor({ section, sectionIndex, isOpen, onClose, onSave }: SectionEditorProps) {
  const [edits, setEdits] = useState<Record<string, any>>({})
  const panelRef = useRef<HTMLDivElement>(null)

  // Reset edits when section changes
  useEffect(() => {
    setEdits({})
  }, [section?.id, sectionIndex])

  // Get value: use edit if present, otherwise read directly from section prop
  const getValue = useCallback((fieldName: string) => {
    if (fieldName in edits) return edits[fieldName]
    return section?.[fieldName] ?? ''
  }, [edits, section])

  // Get array value with proper default
  const getArrayValue = useCallback((fieldName: string, itemFields: BlockField[]) => {
    if (fieldName in edits) return edits[fieldName]
    const sectionValue = section?.[fieldName]
    if (Array.isArray(sectionValue)) return sectionValue
    return []
  }, [edits, section])

  const handleChange = useCallback((fieldName: string, value: any) => {
    setEdits(prev => ({ ...prev, [fieldName]: value }))
  }, [])

  const handleArrayItemChange = useCallback((arrayName: string, itemIndex: number, fieldName: string, value: any) => {
    setEdits(prev => {
      const currentArray = prev[arrayName] || getValue(arrayName) || []
      const newArray = [...currentArray]
      if (!newArray[itemIndex]) {
        newArray[itemIndex] = getDefaultArrayItem(
          getBlockFields(section?.blockType || '').find(f => f.name === arrayName)?.itemFields || []
        )
      }
      newArray[itemIndex] = { ...newArray[itemIndex], [fieldName]: value }
      return { ...prev, [arrayName]: newArray }
    })
  }, [getValue, section?.blockType])

  const handleAddArrayItem = useCallback((arrayName: string, itemFields: BlockField[]) => {
    setEdits(prev => {
      const currentArray = prev[arrayName] || getValue(arrayName) || []
      return { ...prev, [arrayName]: [...currentArray, getDefaultArrayItem(itemFields)] }
    })
  }, [getValue])

  const handleRemoveArrayItem = useCallback((arrayName: string, itemIndex: number) => {
    setEdits(prev => {
      const currentArray = prev[arrayName] || getValue(arrayName) || []
      return { ...prev, [arrayName]: currentArray.filter((_: any, i: number) => i !== itemIndex) }
    })
  }, [getValue])

  const handleSave = useCallback(() => {
    const updated = { ...section }
    for (const [key, value] of Object.entries(edits)) {
      updated[key] = value
    }
    onSave(updated)
    onClose()
  }, [section, edits, onSave, onClose])

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

  const renderField = (field: BlockField) => {
    const value = getValue(field.name)
    
    if (field.type === 'array') {
      const arrayValue = getArrayValue(field.name, field.itemFields || [])
      return (
        <div key={field.name} style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label style={{
              fontSize: '13px', fontWeight: 500, color: '#374151'
            }}>
              {field.label} ({arrayValue.length})
            </label>
            <button
              type="button"
              onClick={() => handleAddArrayItem(field.name, field.itemFields || [])}
              style={{
                padding: '4px 10px',
                background: '#FF6600',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              + Add Item
            </button>
          </div>
          {field.help && (
            <div style={{ fontSize: '11px', color: '#999', marginBottom: '8px' }}>
              {field.help}
            </div>
          )}
          {arrayValue.length === 0 && (
            <div style={{ 
              padding: '16px', 
              border: '2px dashed #e5e5e5', 
              borderRadius: '8px',
              textAlign: 'center',
              color: '#999',
              fontSize: '13px'
            }}>
              No items yet. Click "Add Item" to create one.
            </div>
          )}
          {arrayValue.map((item: any, itemIndex: number) => (
            <div 
              key={itemIndex} 
              style={{ 
                border: '1px solid #e5e5e5', 
                borderRadius: '8px', 
                padding: '12px', 
                marginBottom: '8px',
                background: '#fafafa',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#666' }}>
                  Item {itemIndex + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem(field.name, itemIndex)}
                  style={{
                    padding: '2px 8px',
                    background: '#fff',
                    color: '#FF6600',
                    border: '1px solid #FF6600',
                    borderRadius: '4px',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              </div>
              {(field.itemFields || []).map(itemField => (
                <div key={itemField.name} style={{ marginBottom: '8px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: '#666',
                    marginBottom: '4px',
                  }}>
                    {itemField.label}
                  </label>
                  {itemField.type === 'textarea' ? (
                    <textarea
                      value={item[itemField.name] ?? ''}
                      onChange={e => handleArrayItemChange(field.name, itemIndex, itemField.name, e.target.value)}
                      rows={2}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1px solid #e5e5e5',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontFamily: 'DM Sans, sans-serif',
                        outline: 'none',
                        resize: 'vertical',
                        color: '#1a1a1a',
                        backgroundColor: '#fff',
                      }}
                    />
                  ) : itemField.type === 'array' ? (
                    <div>
                      <span style={{ fontSize: '11px', color: '#999' }}>
                        Nested array - edit in admin
                      </span>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={item[itemField.name] ?? ''}
                      onChange={e => handleArrayItemChange(field.name, itemIndex, itemField.name, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1px solid #e5e5e5',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontFamily: 'DM Sans, sans-serif',
                        outline: 'none',
                        color: '#1a1a1a',
                        backgroundColor: '#fff',
                      }}
                    />
                  )}
                  {itemField.help && (
                    <div style={{ fontSize: '10px', color: '#999', marginTop: '2px' }}>
                      {itemField.help}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )
    }

    if (field.type === 'image') {
      const imageUrl = value
      return (
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
          <input
            type="text"
            value={imageUrl ?? ''}
            onChange={e => handleChange(field.name, e.target.value)}
            placeholder="Image URL"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'DM Sans, sans-serif',
              outline: 'none',
              color: '#1a1a1a',
              backgroundColor: '#fff',
            }}
          />
          {imageUrl && (
            <div style={{ marginTop: '8px' }}>
              <img 
                src={imageUrl} 
                alt="" 
                style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px', border: '1px solid #e5e5e5' }}
              />
            </div>
          )}
          {field.help && (
            <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
              {field.help}
            </div>
          )}
        </div>
      )
    }

    // Default text/textarea
    return (
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
            value={value ?? ''}
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
              color: '#1a1a1a',
              backgroundColor: '#fff',
            }}
            onFocus={e => e.target.style.borderColor = '#FF6600'}
            onBlur={e => e.target.style.borderColor = '#e5e5e5'}
          />
        )}
        {field.type === 'textarea' && (
          <textarea
            value={value ?? ''}
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
              color: '#1a1a1a',
              backgroundColor: '#fff',
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
    )
  }

  return (
    <div
      ref={panelRef}
      data-section-editor
      style={{
        position: 'fixed',
        top: '60px',
        right: 0,
        width: '380px',
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
        {fields.map(field => renderField(field))}
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