'use client'

import React, { useEffect, useState, useCallback, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { RenderedHtmlPage } from './rendered-html-page'
import { EditToolbar } from '@/components/EditToolbar'
import { getTemplateConfig } from '@/lib/template-registry'

const GrapejsEditor = dynamic(() => import('@/components/GrapejsEditor').then(m => m.GrapejsEditor), {
  ssr: false,
  loading: () => (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20000, background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#FF6600', marginBottom: '16px', display: 'block' }} />
        <div style={{ fontSize: '14px' }}>Loading Page Builder...</div>
      </div>
    </div>
  ),
})

interface PageEditorWrapperProps {
  pageId: string
  pageSlug: string
  html: string
  templateName?: string
  theme?: any
}

function getTemplateRegistryKey(templateName: string): string {
  const name = templateName?.toLowerCase() || ''
  if (name.includes('nexsas') || name.includes('perissos')) return 'nexsas'
  if (name.includes('digital agency')) return 'digital-agency'
  if (name.includes('food express') || name.includes('restaurant')) return 'restaurant'
  if (name.includes('optica')) return 'optica-plus'
  return 'digital-agency'
}

function normalizeTheme(raw: any): any {
  if (!raw || typeof raw !== 'object') return raw
  const out: any = { ...raw }
  const keyMap: Record<string, string> = {
    '--primary': 'primary', '--primary-hover': 'primaryHover', '--dark': 'dark',
    '--dark-2': 'dark2', '--dark-3': 'dark3', '--light': 'light', '--white': 'white',
    '--gray': 'gray', '--border': 'border', '--font-body': 'fontBody',
    '--font-heading': 'fontHeading', '--border-radius': 'borderRadius', '--spacing': 'spacing',
  }
  for (const [dbKey, camelKey] of Object.entries(keyMap)) {
    if (out[dbKey] !== undefined) {
      out[camelKey] = out[dbKey]
      delete out[dbKey]
    }
  }
  return out
}

export function PageEditorWrapper({ pageId, pageSlug, html, templateName, theme: initialTheme }: PageEditorWrapperProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [toolbarHeight, setToolbarHeight] = useState(50)
  const [theme, setTheme] = useState<any>(initialTheme ? normalizeTheme(initialTheme) : null)
  const [showPageBuilder, setShowPageBuilder] = useState(false)
  const [renderedHtml, setRenderedHtml] = useState<string>(html)
  const [projectData, setProjectData] = useState<any>(null)
  const [templateCategory, setTemplateCategory] = useState<string>(() => {
    return getTemplateRegistryKey(templateName || 'Perissos')
  })
  const [cssVariableMapping, setCssVariableMapping] = useState<Record<string, string[]>>({})
  const [templateSections, setTemplateSections] = useState<string[]>([])
  const [templateSectionDefs, setTemplateSectionDefs] = useState<Record<string, any>>({})

  const cmsUrl = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3000'

  // Check if user is logged in
  useEffect(() => {
    fetch(`${cmsUrl}/api/users/me`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.user) setIsEditing(true)
      })
      .catch(() => {})
  }, [cmsUrl])

  // Load template config for CSS variable mapping
  useEffect(() => {
    if (!templateCategory) return
    fetch(`${cmsUrl}/api/templates?where[category][equals]=${templateCategory}&depth=1`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const template = data.docs?.[0]
        const layoutConfig = template?.layoutConfig
        if (layoutConfig?.cssVariableMapping) setCssVariableMapping(layoutConfig.cssVariableMapping)
        if (layoutConfig?.sections) setTemplateSections(layoutConfig.sections)
        if (layoutConfig?.sectionDefinitions) setTemplateSectionDefs(layoutConfig.sectionDefinitions)
      })
      .catch(() => {})
  }, [templateCategory, cmsUrl])

  // Load page projectData for GrapeJS
  useEffect(() => {
    fetch(`${cmsUrl}/api/pages/${pageId}?depth=0`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.projectData) setProjectData(data.projectData)
      })
      .catch(() => {})
  }, [pageId, cmsUrl])

  const handleSave = useCallback(async () => {
    if (!pageId) return
    setIsSaving(true)
    try {
      await fetch(`${cmsUrl}/api/pages/${pageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ theme }),
      })
    } catch (err) {
      console.error('Save failed:', err)
    } finally {
      setIsSaving(false)
    }
  }, [pageId, theme, cmsUrl])

  const handlePageBuilderSave = useCallback(async (newProjectData: any, newRenderedHtml: string) => {
    if (!pageId) return
    try {
      await fetch(`${cmsUrl}/api/pages/${pageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          projectData: newProjectData,
          renderedHtml: newRenderedHtml,
        }),
      })
      setProjectData(newProjectData)
      setRenderedHtml(newRenderedHtml)
    } catch (err) {
      console.error('Page Builder save failed:', err)
    }
  }, [pageId, cmsUrl])

  const handleThemeChange = useCallback((newTheme: any) => {
    setTheme(newTheme)
    if (typeof window !== 'undefined' && cssVariableMapping) {
      const root = document.documentElement
      const themeKeyToValue: Record<string, string> = {
        primary: newTheme.primary || '', primaryHover: newTheme.primaryHover || '',
        dark: newTheme.dark || '', light: newTheme.light || newTheme.white || '',
        white: newTheme.white || '', gray: newTheme.gray || '',
        border: newTheme.border || '', fontBody: newTheme.fontBody || '',
        fontHeading: newTheme.fontHeading || '',
      }
      for (const [themeKey, cssVars] of Object.entries(cssVariableMapping)) {
        const value = themeKeyToValue[themeKey]
        if (value) {
          for (const cssVar of cssVars) {
            root.style.setProperty(cssVar, value)
          }
        }
      }
    }
  }, [cssVariableMapping])

  return (
    <>
      {isEditing && (
        <EditToolbar
          pageId={pageId}
          pageSlug={pageSlug}
          onSave={handleSave}
          isSaving={isSaving}
          onHeightChange={setToolbarHeight}
          theme={theme}
          onThemeChange={handleThemeChange}
          onOpenPageBuilder={() => setShowPageBuilder(true)}
          templateCategory={templateCategory}
          cssVariableMapping={cssVariableMapping}
        />
      )}
      {isEditing && (
        <style dangerouslySetInnerHTML={{ __html: `header { top: ${toolbarHeight}px !important; }` }} />
      )}
      <RenderedHtmlPage html={renderedHtml} templateName={templateName} />
      {showPageBuilder && (
        <GrapejsEditor
          pageId={pageId}
          cmsUrl={cmsUrl}
          initialProjectData={projectData}
          initialRenderedHtml={renderedHtml}
          theme={theme}
          templateCategory={templateCategory}
          templateSections={templateSections}
          templateSectionDefs={templateSectionDefs}
          cssVariableMapping={cssVariableMapping}
          onSave={handlePageBuilderSave}
          onClose={() => setShowPageBuilder(false)}
        />
      )}
    </>
  )
}
