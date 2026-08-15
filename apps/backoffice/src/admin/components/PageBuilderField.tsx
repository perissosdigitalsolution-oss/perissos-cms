'use client'

import React, { useCallback } from 'react'
import { useField, useForm } from '@payloadcms/ui'
import { PageBuilderEditor } from '@/admin/components/PageBuilderEditor'

interface PageBuilderFieldProps {
  path: string
  field: any
  label?: string
  [key: string]: any
}

export const PageBuilderField: React.FC<PageBuilderFieldProps> = ({ path, field, label }) => {
  const { value, setValue } = useField<any>({ path })
  const { setModified } = useForm()

  const sections = Array.isArray(value) ? value : []

  const handleSectionsChange = useCallback((newSections: any[]) => {
    setValue(newSections)
    setModified(true)
  }, [setValue, setModified])

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{
        marginBottom: '12px',
        padding: '12px 16px',
        background: '#fafafa',
        borderRadius: '8px',
        border: '1px solid #e5e5e5',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#1a1a1a', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {label || field?.label || 'Page Sections'}
          </h3>
          <div style={{ fontSize: '12px', color: '#7A7A74' }}>
            {sections.length} section{sections.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
      <PageBuilderEditor
        value={sections}
        onChange={handleSectionsChange}
      />
    </div>
  )
}

export default PageBuilderField
