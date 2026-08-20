'use client'

import React from 'react'
import * as DigitalAgencySections from '@/components/sections/digital-agency'
import * as RestaurantSections from '@/components/sections/restaurant'

export interface SectionRendererProps {
  section: any
  index: number
  templateCategory: string
}

export type SectionRenderer = React.FC<{ section: any }>

export interface TemplateThemeTokens {
  primary: string
  primaryHover: string
  dark: string
  darkBg: string
  darkerBg: string
  light: string
  gray: string
  grayDark: string
  textLight: string
  textMuted: string
  border: string
  fontBody: string
  fontHeading: string
  fontDisplay?: string
  spacing: string
  borderRadius: string
}

export interface TemplateConfig {
  id: string
  name: string
  category: string
  cssPath: string
  sections: Record<string, SectionRenderer>
  theme: TemplateThemeTokens
}

export const templateRegistry: Record<string, TemplateConfig> = {
  'digital-agency': {
    id: 'digital-agency',
    name: 'Digital Agency',
    category: 'agency',
    cssPath: '/styles/digital-agency.css',
    sections: {
      hero: DigitalAgencySections.DigitalAgencyHero,
      services: DigitalAgencySections.DigitalAgencyServices,
      about: DigitalAgencySections.DigitalAgencyAbout,
      whyUs: DigitalAgencySections.DigitalAgencyWhyUs,
      team: DigitalAgencySections.DigitalAgencyTeam,
      portfolio: DigitalAgencySections.DigitalAgencyPortfolio,
      blog: DigitalAgencySections.DigitalAgencyBlog,
      testimonials: DigitalAgencySections.DigitalAgencyTestimonials,
      cta: DigitalAgencySections.DigitalAgencyCTA,
      contact: DigitalAgencySections.DigitalAgencyContact,
      pricing: DigitalAgencySections.DigitalAgencyPricing,
    },
    theme: {
      primary: '#00ff9d',
      primaryHover: '#00ff59',
      dark: '#181817',
      darkBg: '#0a0a0a',
      darkerBg: '#0f0f0f',
      light: '#F6F4F1',
      gray: '#7A7A74',
      grayDark: '#3A3A38',
      textLight: '#FFFFFF',
      textMuted: '#999999',
      border: '#3A3A38',
      fontBody: 'DM Sans, sans-serif',
      fontHeading: 'Plus Jakarta Sans, sans-serif',
      spacing: '16px',
      borderRadius: '8px',
    },
  },
  'restaurant': {
    id: 'restaurant',
    name: 'Food Express',
    category: 'restaurant',
    cssPath: '/styles/restaurant.css',
    sections: {
      hero: RestaurantSections.RestaurantHero,
      menuHighlights: RestaurantSections.RestaurantMenuHighlights,
      reservation: RestaurantSections.RestaurantReservation,
      gallery: RestaurantSections.RestaurantGallery,
      testimonials: RestaurantSections.RestaurantTestimonials,
      contact: RestaurantSections.RestaurantContact,
      specials: RestaurantSections.RestaurantSpecials,
      menu: RestaurantSections.RestaurantMenu,
      about: RestaurantSections.RestaurantAbout,
    },
    theme: {
      primary: '#c8a97e',
      primaryHover: '#b8956a',
      dark: '#1a1a1a',
      darkBg: '#111111',
      darkerBg: '#0f0f0f',
      light: '#F5F5F5',
      gray: '#666666',
      grayDark: '#333333',
      textLight: '#CCCCCC',
      textMuted: '#999999',
      border: '#E0E0E0',
      fontBody: 'Open Sans, sans-serif',
      fontHeading: 'Roboto Slab, serif',
      fontDisplay: 'Marcellus, serif',
      spacing: '16px',
      borderRadius: '8px',
    },
  },
}

export function getTemplateConfig(category: string): TemplateConfig {
  return templateRegistry[category] || templateRegistry['digital-agency']
}

export function getTemplateTheme(category: string): TemplateThemeTokens {
  return getTemplateConfig(category).theme
}

export function registerTemplate(config: TemplateConfig): void {
  templateRegistry[config.id] = config
}

export interface TemplateThemeTokens {
  primary: string
  primaryHover: string
  dark: string
  darkBg: string
  darkerBg: string
  light: string
  gray: string
  grayDark: string
  textLight: string
  textMuted: string
  border: string
  fontBody: string
  fontHeading: string
  fontDisplay?: string
  spacing: string
  borderRadius: string
}

export interface TemplateConfig {
  id: string
  name: string
  category: string
  cssPath: string
  sections: Record<string, React.FC<{ section: any }>>
  theme: TemplateThemeTokens
}