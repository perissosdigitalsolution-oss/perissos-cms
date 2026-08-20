'use client'

import React from 'react'

interface Template {
  id: string
  name: string
  description: string
  previewImage?: { url: string }
  isActive: boolean
  version?: string
  category?: string
}

interface TemplateRowProps {
  template: {
    id: string
    name: string
    description: string
    previewImage?: { url: string }
    isActive: boolean
    version?: string
    category?: string
  }
  index: number
  tdStyle: React.CSSProperties
  handleActivate: (templateId: string) => Promise<void>
  handleDelete: (templateId: string, templateName: string) => Promise<void>
}

export const TemplateRow = ({ template, index, tdStyle, handleActivate, handleDelete }: TemplateRowProps) => {
  const versionDisplay = template.version ? 'v' + template.version : '\u2014'
  const isEven = index % 2 === 0
  const trBackgroundColor = isEven ? 'transparent' : 'var(--theme-elevation-50)'
  const leaveColor = isEven ? 'transparent' : 'var(--theme-elevation-50)'

  const trStyle = {
    backgroundColor: trBackgroundColor,
    cursor: 'pointer',
    transition: 'background-color 0.1s',
  }

  const fontSizeCalc = 'calc(var(--base) * 0.85)'
  const fontSizeBase = 'calc(var(--base) * 1)'
  const gapUnit = 'calc(var(--base) * 0.4)'

  const tdStyleImg = {
    width: '24px',
    height: '24px',
    borderRadius: 'var(--style-radius-s)',
    objectFit: 'cover' as const,
  }

  const tdStylePlaceholder = {
    width: '24px',
    height: '24px',
    borderRadius: 'var(--style-radius-s)',
    backgroundColor: 'var(--theme-elevation-100)',
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    fontSize: '11px',
    color: 'var(--theme-elevation-400)',
  }

  return (
    <tr
      key={template.id}
      style={{
        backgroundColor: trBackgroundColor,
        cursor: 'pointer',
        transition: 'background-color 0.1s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--theme-elevation-100)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = leaveColor
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
        {template.description || '\u2014'}
      </td>
      <td style={{ ...tdStyle, color: 'var(--theme-elevation-500)', fontSize: 'calc(var(--base) * 0.85)' }}>
        {versionDisplay}
      </td>
      <td style={{ ...tdStyle, color: 'var(--theme-elevation-500)', fontSize: 'calc(var(--base) * 0.85)' }}>
        {template.category || '\u2014'}
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
  )
}