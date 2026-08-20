'use client'

import React, { useState, useEffect, useCallback } from 'react'

interface VersionEntry {
  id: string
  version: string
  changelog?: string
  zipFile?: { id: number; filename: string; url: string } | number
  layoutConfig?: Record<string, any>
  publishedAt?: string
}

interface VersionHistoryPanelProps {
  templateId: string | number
  currentVersion?: string
  installedVersion?: string
  availableVersions?: VersionEntry[]
  onUpdate?: () => void
}

export const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = ({
  templateId,
  currentVersion,
  installedVersion,
  availableVersions = [],
  onUpdate,
}) => {
  const [rolling, setRolling] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleRollback = useCallback(async (version: string) => {
    if (!confirm(`Rollback to version ${version}?`)) return

    setRolling(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/templates/${templateId}/rollback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Rollback failed')
      }

      setMessage({ type: 'success', text: data.message || `Rolled back to ${version}` })
      onUpdate?.()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Rollback failed' })
    } finally {
      setRolling(false)
    }
  }, [templateId, onUpdate])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  if (!availableVersions || availableVersions.length === 0) {
    return (
      <div style={panelStyle}>
        <h3 style={titleStyle}>Version History</h3>
        <p style={emptyStyle}>No version history available.</p>
      </div>
    )
  }

  return (
    <div style={panelStyle}>
      <h3 style={titleStyle}>Version History</h3>

      <div style={metaStyle}>
        <span>Current: <strong>{currentVersion || '—'}</strong></span>
        <span>Installed: <strong>{installedVersion || '—'}</strong></span>
      </div>

      {message && (
        <div style={{
          ...messageStyle,
          background: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
        }}>
          {message.text}
        </div>
      )}

      <div style={listStyle}>
        {availableVersions.map((v, i) => {
          const isCurrent = v.version === currentVersion
          const isInstalled = v.version === installedVersion

          return (
            <div key={v.id || i} style={{
              ...versionItemStyle,
              borderColor: isCurrent ? 'var(--theme-primary)' : 'var(--theme-elevation-150)',
              background: isCurrent ? 'var(--theme-elevation-50)' : 'white',
            }}>
              <div style={versionHeaderStyle}>
                <span style={versionTagStyle}>
                  v{v.version}
                  {isCurrent && <span style={currentBadgeStyle}>Current</span>}
                  {isInstalled && !isCurrent && <span style={installedBadgeStyle}>Installed</span>}
                </span>
                <span style={dateStyle}>
                  {v.publishedAt ? new Date(v.publishedAt).toLocaleDateString() : '—'}
                </span>
              </div>

              {v.changelog && (
                <p style={changelogStyle}>{v.changelog}</p>
              )}

              {!isCurrent && (
                <button
                  onClick={() => handleRollback(v.version)}
                  disabled={rolling}
                  style={rollbackBtnStyle}
                >
                  {rolling ? 'Rolling back...' : 'Rollback to this version'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const panelStyle: React.CSSProperties = {
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: '4px',
  padding: '16px',
  marginBottom: '16px',
}

const titleStyle: React.CSSProperties = {
  margin: '0 0 12px 0',
  fontSize: '14px',
  fontWeight: 600,
  color: 'var(--theme-elevation-800)',
}

const metaStyle: React.CSSProperties = {
  display: 'flex',
  gap: '16px',
  marginBottom: '12px',
  fontSize: '12px',
  color: 'var(--theme-elevation-500)',
}

const emptyStyle: React.CSSProperties = {
  color: 'var(--theme-elevation-400)',
  fontSize: '13px',
  fontStyle: 'italic',
}

const messageStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: '4px',
  marginBottom: '12px',
  fontSize: '13px',
}

const listStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
}

const versionItemStyle: React.CSSProperties = {
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: '4px',
  padding: '10px 12px',
}

const versionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '4px',
}

const versionTagStyle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: '13px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
}

const currentBadgeStyle: React.CSSProperties = {
  background: 'var(--theme-primary)',
  color: 'white',
  fontSize: '10px',
  padding: '1px 6px',
  borderRadius: '3px',
  fontWeight: 600,
}

const installedBadgeStyle: React.CSSProperties = {
  background: 'var(--theme-elevation-200)',
  color: 'var(--theme-elevation-600)',
  fontSize: '10px',
  padding: '1px 6px',
  borderRadius: '3px',
  fontWeight: 600,
}

const dateStyle: React.CSSProperties = {
  fontSize: '11px',
  color: 'var(--theme-elevation-400)',
}

const changelogStyle: React.CSSProperties = {
  margin: '4px 0 0',
  fontSize: '12px',
  color: 'var(--theme-elevation-500)',
  lineHeight: '1.4',
}

const rollbackBtnStyle: React.CSSProperties = {
  marginTop: '8px',
  padding: '4px 10px',
  fontSize: '12px',
  background: 'var(--theme-elevation-100)',
  border: '1px solid var(--theme-elevation-200)',
  borderRadius: '3px',
  cursor: 'pointer',
  color: 'var(--theme-elevation-700)',
}
