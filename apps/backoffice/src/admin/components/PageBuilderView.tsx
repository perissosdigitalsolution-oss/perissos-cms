'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { PageBuilderSidebar } from '@/admin/components/PageBuilderSidebar'

interface PageBuilderViewProps {
  children: React.ReactNode
  data: any
  onSave: () => void
  [key: string]: any
}

export function PageBuilderView({ children, data, onSave, ...props }: PageBuilderViewProps) {
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null)
  const [blocks, setBlocks] = useState(data?.sections || [])

  useEffect(() => {
    setBlocks(data?.sections || [])
  }, [data?.sections])

  const handleBlocksChange = useCallback((newBlocks: any[]) => {
    setBlocks(newBlocks)
  }, [])

  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 'calc(100vh - 120px)' }}>
      {/* Main Content - Default Payload Editor */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </div>

      {/* Right Sidebar - Visual Page Builder */}
      <PageBuilderSidebar
        blocks={blocks}
        onBlocksChange={handleBlocksChange}
        selectedBlockIndex={selectedBlockIndex}
        onSelectBlock={setSelectedBlockIndex}
      />
    </div>
  )
}

export default PageBuilderView
