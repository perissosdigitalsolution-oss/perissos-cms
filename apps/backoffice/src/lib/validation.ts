import * as cheerio from 'cheerio'
import { z } from 'zod'
import { sectionSchemas, type SectionCategoryType } from '@perissos/shared/registry/sections'

/**
 * Validate section props against Zod schema with fallback to defaults
 */
export function validateSectionProps<T extends z.ZodTypeAny>(
  schema: T,
  props: Record<string, any>,
  sectionType: SectionCategoryType
): z.infer<T> {
  const result = schema.safeParse(props)
  if (result.success) {
    return result.data
  } else {
    console.warn(`[${sectionType}] Validation failed, using defaults:`, result.error.flatten().fieldErrors)
    return schema.parse({})
  }
}

/**
 * Validate all section types
 */
export function validateAllSections(layoutConfig: { sections: SectionCategoryType[] }): Record<SectionCategoryType, any> {
  const result: Record<string, any> = {}

  for (const sectionType of layoutConfig.sections) {
    const schema = sectionSchemas[sectionType]
    if (schema) {
      // Empty props will use defaults
      result[sectionType] = schema.parse({})
    }
  }

  return result as Record<SectionCategoryType, any>
}

/**
 * Merge extracted props with defaults, preserving extracted values
 */
export function mergeWithDefaults<T extends z.ZodTypeAny>(
  schema: T,
  extracted: Record<string, any>,
  sectionType: SectionCategoryType
): z.infer<T> {
  const defaults = schema.parse({})
  const merged = { ...defaults, ...extracted }
  return validateSectionProps(schema, merged, sectionType)
}

/**
 * Type-safe section mapper function type
 */
export type SectionMapper<T extends z.ZodTypeAny> = (
  $: cheerio.CheerioAPI,
  $el: cheerio.Cheerio<any>
) => Record<string, any>
