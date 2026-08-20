'use client'

import React from 'react'

interface InstallConfirmModalProps {
  template: {
    id: string
    name: string
    description: string
    version: string
    category: string
    isPremium: boolean
    requiredPlan: string
    price?: number
    author: string
  }
  onClose: () => void
  onConfirm: (id: string) => void
  installing: boolean
  userPlan?: string
}

export const InstallConfirmModal: React.FC<InstallConfirmModalProps> = ({
  template,
  onClose,
  onConfirm,
  installing,
  userPlan = 'free',
}) => {
  const planHierarchy: Record<string, number> = { free: 0, pro: 1, enterprise: 2 }
  const userLevel = planHierarchy[userPlan] ?? 0
  const requiredLevel = planHierarchy[template.requiredPlan] ?? 0
  const hasAccess = !template.isPremium || template.requiredPlan === 'free' || userLevel >= requiredLevel

  const planLabels: Record<string, { label: string; color: string; bg: string }> = {
    free: { label: 'Free', color: '#155724', bg: '#d4edda' },
    pro: { label: 'Pro', color: '#856404', bg: '#fff3cd' },
    enterprise: { label: 'Enterprise', color: '#721c24', bg: '#f8d7da' },
  }

  const plan = planLabels[template.requiredPlan] || planLabels.free

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Install Template</h3>
          <button onClick={onClose} style={closeBtnStyle}>
            <i className="fas fa-times" />
          </button>
        </div>

        <div style={bodyStyle}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              background: 'var(--theme-elevation-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <i className="fas fa-file-alt" style={{ fontSize: '20px', color: 'var(--theme-elevation-400)' }} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 600 }}>{template.name}</h4>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--theme-elevation-500)' }}>
                v{template.version} by {template.author}
              </p>
            </div>
          </div>

          {/* Plan Requirement */}
          {template.isPremium && (
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              background: hasAccess ? '#d4edda' : '#fff3cd',
              border: `1px solid ${hasAccess ? '#c3e6cb' : '#ffc107'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <i className={`fas ${hasAccess ? 'fa-check-circle' : 'fa-lock'}`} style={{ color: hasAccess ? '#155724' : '#856404' }} />
                <strong style={{ fontSize: '13px', color: hasAccess ? '#155724' : '#856404' }}>
                  {hasAccess ? 'Plan requirement met' : 'Plan upgrade required'}
                </strong>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: hasAccess ? '#155724' : '#856404' }}>
                This template requires <strong>{plan.label}</strong> plan.
                {!hasAccess && ` Your current plan is ${userPlan}.`}
                {hasAccess && ` You have access with your ${userPlan} plan.`}
              </p>
            </div>
          )}

          {/* Description */}
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--theme-elevation-600)', lineHeight: 1.5 }}>
            {template.description}
          </p>

          {/* Info */}
          <div style={{ fontSize: '12px', color: 'var(--theme-elevation-500)' }}>
            <p style={{ margin: '0 0 4px' }}>
              <i className="fas fa-info-circle" style={{ marginRight: '6px' }} />
              This will create a new template entry in your Templates collection.
            </p>
            <p style={{ margin: 0 }}>
              You can activate it from the Installed tab to apply it to your site.
            </p>
          </div>
        </div>

        <div style={footerStyle}>
          <button onClick={onClose} style={cancelBtnStyle}>Cancel</button>
          <button
            onClick={() => onConfirm(template.id)}
            disabled={installing || !hasAccess}
            style={{
              ...confirmBtnStyle,
              opacity: installing || !hasAccess ? 0.5 : 1,
              cursor: installing || !hasAccess ? 'not-allowed' : 'pointer',
            }}
          >
            {installing ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '14px', height: '14px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                Installing...
              </span>
            ) : !hasAccess ? (
              'Upgrade Required'
            ) : template.isPremium ? (
              'Install Premium Template'
            ) : (
              'Install Template'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10000,
}

const modalStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: '12px',
  width: '480px',
  maxHeight: '80vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 20px',
  borderBottom: '1px solid var(--theme-elevation-200)',
}

const closeBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '16px',
  cursor: 'pointer',
  color: 'var(--theme-elevation-500)',
}

const bodyStyle: React.CSSProperties = {
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
}

const footerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '8px',
  padding: '16px 20px',
  borderTop: '1px solid var(--theme-elevation-200)',
}

const cancelBtnStyle: React.CSSProperties = {
  padding: '8px 16px',
  border: '1px solid var(--theme-elevation-200)',
  borderRadius: '6px',
  background: 'white',
  cursor: 'pointer',
  fontSize: '13px',
}

const confirmBtnStyle: React.CSSProperties = {
  padding: '8px 20px',
  border: 'none',
  borderRadius: '6px',
  background: 'var(--theme-primary)',
  color: 'white',
  fontSize: '13px',
  fontWeight: 600,
}
