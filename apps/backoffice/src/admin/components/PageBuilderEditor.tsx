'use client'

import React, { useState, useCallback } from 'react'
import {
  getSectionRegistry,
  getSectionDefaultProps,
  type SectionRegistryEntry,
  type Block,
  type SectionCategoryType,
} from '@perissos/shared'

interface PageBuilderEditorProps {
  value: Block[]
  onChange: (blocks: Block[]) => void
}

const categoryLabels: Record<string, string> = {
  layout: 'Layout',
  content: 'Content',
  marketing: 'Marketing',
  conversion: 'Conversion',
}

const categoryOrder = ['layout', 'content', 'marketing', 'conversion']

export function PageBuilderEditor({ value, onChange }: PageBuilderEditorProps) {
  const [activeCategory, setActiveCategory] = useState<string>('layout')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isPaletteOpen, setIsPaletteOpen] = useState(true)

  const registry = getSectionRegistry()
  const categories = categoryOrder.filter(cat =>
    registry.some(s => s.category === cat)
  )

  const blocksByCategory = registry.filter(s => s.category === activeCategory)

  const handleAddBlock = useCallback((blockType: SectionCategoryType) => {
    const defaultProps = getSectionDefaultProps(blockType)
    const newBlock: Block = {
      blockType,
      blockName: defaultProps.badgeText || defaultProps.title || blockType,
      ...defaultProps,
    }
    const newBlocks = [...value, newBlock]
    onChange(newBlocks)
    setSelectedIndex(newBlocks.length - 1)
  }, [value, onChange])

  const handleRemoveBlock = useCallback((index: number) => {
    const newBlocks = value.filter((_, i) => i !== index)
    onChange(newBlocks)
    if (selectedIndex === index) setSelectedIndex(null)
    else if (selectedIndex !== null && selectedIndex > index) setSelectedIndex(selectedIndex - 1)
  }, [value, onChange, selectedIndex])

  const handleDuplicateBlock = useCallback((index: number) => {
    const newBlocks = [...value]
    newBlocks.splice(index + 1, 0, { ...value[index] })
    onChange(newBlocks)
  }, [value, onChange])

  const handleMoveBlock = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    const newBlocks = [...value]
    const [removed] = newBlocks.splice(fromIndex, 1)
    newBlocks.splice(toIndex, 0, removed)
    onChange(newBlocks)
    setSelectedIndex(toIndex)
  }, [value, onChange])

  const handleBlockChange = useCallback((index: number, props: Record<string, any>) => {
    const newBlocks = [...value]
    newBlocks[index] = { ...newBlocks[index], ...props }
    onChange(newBlocks)
  }, [value, onChange])

  const renderBlockCanvas = (block: Block, index: number) => {
    const isSelected = selectedIndex === index
    const registryEntry = registry.find(s => s.key === block.blockType)

    return (
      <div
        key={index}
        className={`relative group transition-all duration-200 ${
          isSelected ? 'ring-2 ring-[#FF6600] ring-offset-2 ring-offset-[#1E1E1D]' : ''
        }`}
        style={{ background: '#1E1E1D', borderRadius: '12px', border: '1px solid #3A3A38' }}
      >
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => handleDuplicateBlock(index)}
            className="p-1.5 bg-[#2A2A28] hover:bg-[#3A3A38] rounded-lg text-white/70 hover:text-white transition-colors"
            title="Duplicate"
            aria-label="Duplicate block"
          >
            <i className="fas fa-copy text-sm" />
          </button>
          <button
            onClick={() => handleRemoveBlock(index)}
            className="p-1.5 bg-[#2A2A28] hover:bg-[#E55B00] rounded-lg text-white/70 hover:text-white transition-colors"
            title="Remove"
            aria-label="Remove block"
          >
            <i className="fas fa-trash text-sm" />
          </button>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[#7A7A74] uppercase tracking-wider">{registryEntry?.category}</span>
              <span className="px-2 py-0.5 bg-[#FF6600]/10 text-[#FF6600] text-xs rounded" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {registryEntry?.label || block.blockType}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {index > 0 && (
                <button
                  onClick={() => handleMoveBlock(index, index - 1)}
                  className="p-1 bg-[#2A2A28] hover:bg-[#3A3A38] rounded-lg text-white/50 hover:text-white transition-colors"
                  title="Move up"
                >
                  <i className="fas fa-chevron-up text-xs" />
                </button>
              )}
              {index < value.length - 1 && (
                <button
                  onClick={() => handleMoveBlock(index, index + 1)}
                  className="p-1 bg-[#2A2A28] hover:bg-[#3A3A38] rounded-lg text-white/50 hover:text-white transition-colors"
                  title="Move down"
                >
                  <i className="fas fa-chevron-down text-xs" />
                </button>
              )}
            </div>
          </div>
          <BlockSettings
            block={block}
            registryEntry={registryEntry}
            onChange={props => handleBlockChange(index, props)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-[#181817]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Sidebar - Block Palette */}
      <aside className={`flex flex-col w-72 border-r border-[#3A3A38] transition-all duration-300 ${
        isPaletteOpen ? '' : 'w-0 overflow-hidden border-0'
      }`} style={{ fontFamily: 'DM Sans, sans-serif' }}>
        <div className="p-4 border-b border-[#3A3A38]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Blocks</h3>
            <button
              onClick={() => setIsPaletteOpen(!isPaletteOpen)}
              className="p-1.5 bg-[#2A2A28] rounded-lg text-white/70 hover:text-white hover:bg-[#3A3A38] transition-colors"
              aria-label={isPaletteOpen ? 'Collapse palette' : 'Expand palette'}
            >
              <i className={`${isPaletteOpen ? 'fas fa-chevron-left' : 'fas fa-chevron-right'} text-sm`} />
            </button>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-[#FF6600] text-white'
                    : 'bg-[#2A2A28] text-white/70 hover:text-white hover:bg-[#3A3A38]'
                }`} style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                {categoryLabels[cat] || cat}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {blocksByCategory.map(entry => (
            <button
              key={entry.key}
              onClick={() => handleAddBlock(entry.key)}
              className="w-full p-4 text-left bg-[#1E1E1D] border border-[#3A3A38] rounded-xl hover:border-[#FF6600]/50 hover:bg-[#2A2A28] transition-all"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-[#FF6600]/10 rounded-lg flex items-center justify-center text-[#FF6600]">
                  <i className={`${entry.icon} text-base`} />
                </div>
                <div>
                  <div className="font-medium text-white text-sm">{entry.label}</div>
                  <div className="text-xs text-[#7A7A74]">{entry.description}</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-[#FF6600]">
                <i className="fas fa-plus text-xs" /> Add
              </span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-[#3A3A38] bg-[#181817]/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Page Builder
            </h2>
            <div className="flex items-center gap-3 text-sm text-[#7A7A74]">
              {value.length} block{value.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {value.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-[#7A7A74]">
              <i className="fas fa-puzzle-piece text-6xl mb-4 text-[#3A3A38]" />
              <h3 className="text-xl font-medium mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>No blocks yet</h3>
              <p className="mb-6 max-w-sm">Add blocks from the sidebar to start building your page</p>
              <button
                onClick={() => setIsPaletteOpen(true)}
                className="px-6 py-3 bg-[#FF6600] text-white rounded-full font-medium hover:bg-[#E55B00] transition-colors"
                style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}
              >
                Open Block Palette
              </button>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4">
              {value.map((block, index) => renderBlockCanvas(block, index))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function BlockSettings({ block, registryEntry, onChange }: {
  block: any
  registryEntry: any
  onChange: (props: Record<string, any>) => void
}) {
  if (!registryEntry) return null

  const schema = registryEntry.schema
  const shape = schema.shape as Record<string, any>

  return (
    <div className="space-y-3">
      {Object.entries(shape).slice(0, 8).map(([fieldName, fieldSchema]) => {
        const isOptional = fieldSchema.isOptional?.() ?? false
        const isArray = fieldSchema instanceof require('zod').ZodArray

        if (isArray) return null

        if (fieldSchema instanceof require('zod').ZodString) {
          return (
            <div key={fieldName} className="grid grid-cols-[140px_1fr] gap-3 items-center">
              <label className="text-sm text-white/70" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())}
                {!isOptional && <span className="text-[#FF6600] ml-1">*</span>}
              </label>
              <input
                type="text"
                value={block[fieldName] || ''}
                onChange={e => onChange({ [fieldName]: e.target.value })}
                placeholder={fieldSchema._def.defaultValue?.() || ''}
                className="px-3 py-2 bg-[#181817] border border-[#3A3A38] rounded-lg text-white placeholder-[#7A7A74] focus:outline-none focus:border-[#FF6600] transition-colors text-sm"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              />
            </div>
          )
        }

        if (fieldSchema instanceof require('zod').ZodBoolean) {
          return (
            <div key={fieldName} className="flex items-center justify-between">
              <label className="text-sm text-white/70" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())}
              </label>
              <input
                type="checkbox"
                checked={block[fieldName] || false}
                onChange={e => onChange({ [fieldName]: e.target.checked })}
                className="w-4 h-4 accent-[#FF6600] bg-[#181817] border border-[#3A3A38] rounded"
              />
            </div>
          )
        }

        return null
      })}
    </div>
  )
}

export default PageBuilderEditor