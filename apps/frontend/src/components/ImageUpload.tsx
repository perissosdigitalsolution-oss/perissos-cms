'use client'

import React, { useState, useCallback, useRef } from 'react'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
  accept?: string
}

export function ImageUpload({ value, onChange, label, accept = 'image/*' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const cmsUrl = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3000'

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file)
    setPreview(localPreview)
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
        setPreview(mediaUrl)
        onChange(mediaUrl)
      } else {
        throw new Error('No URL returned from upload')
      }
    } catch (err) {
      console.error('Image upload failed:', err)
      setError(err instanceof Error ? err.message : 'Upload failed')
      // Fallback to local preview
      onChange(localPreview)
    } finally {
      setIsUploading(false)
    }
  }, [cmsUrl, onChange])

  const handleRemove = useCallback(() => {
    setPreview(null)
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onChange])

  const handleUrlInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setPreview(url || null)
    onChange(url)
  }, [onChange])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {label && <label style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>{label}</label>}
      
      {/* Preview */}
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            style={{
              maxWidth: '100%',
              maxHeight: '150px',
              borderRadius: '8px',
              border: '1px solid #e5e5e5',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div
            style={{
              width: '200px',
              height: '150px',
              border: '2px dashed #e5e5e5',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
              fontSize: '13px',
            }}
          >
            No image
          </div>
        )}
        {preview && (
          <button
            type="button"
            onClick={handleRemove}
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.6)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Upload / URL inputs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          style={{
            padding: '8px 16px',
            background: isUploading ? '#ccc' : '#FF6600',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: isUploading ? 'not-allowed' : 'pointer',
            width: 'fit-content',
          }}
        >
          {isUploading ? (
            <>
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              </svg>
              Uploading...
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Upload Image
            </>
          )}
        </button>

        {/* Or use URL */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#999', fontSize: '12px' }}>
          <span>or</span>
          <input
            type="url"
            value={value || ''}
            onChange={handleUrlInput}
            placeholder="https://example.com/image.jpg"
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #e5e5e5',
              borderRadius: '6px',
              fontSize: '13px',
              color: '#1a1a1a',
              backgroundColor: '#fff',
            }}
          />
        </div>
      </div>

      {error && (
        <div style={{ color: '#ef4444', fontSize: '12px' }}>
          {error}
        </div>
      )}
    </div>
  )
}

export default ImageUpload