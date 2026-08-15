'use client'

import React, { useEffect, useState, useCallback } from 'react'

interface EditToolbarProps {
  pageId: string | null
  pageSlug: string
  onSave: () => void
  isSaving: boolean
}

export function EditToolbar({ pageId, pageSlug, onSave, isSaving }: EditToolbarProps) {
  const [user, setUser] = useState<any>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const cmsUrl = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3000'

  useEffect(() => {
    // Check if user is authenticated by calling the backoffice API
    fetch(`${cmsUrl}/api/users/me`, {
      credentials: 'include', // Include cookies
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
        }
      })
      .catch(() => {
        // Not authenticated - that's fine
      })
  }, [cmsUrl])

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
    } catch {
      // Ignore errors
    }
  }, [cmsUrl])

  // Don't render anything if not authenticated
  if (!user) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      fontFamily: 'DM Sans, sans-serif',
    }}>
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

      {/* Expanded Panel */}
      {isExpanded && (
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
          </div>
        </div>
      )}
    </div>
  )
}

export default EditToolbar
