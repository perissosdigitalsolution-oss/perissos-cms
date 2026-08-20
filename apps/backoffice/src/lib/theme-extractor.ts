import * as cheerio from 'cheerio'

export interface ThemeConfig {
  colors: Record<string, string>
  fonts: {
    heading: string
    body: string
  }
  cssVariables: Record<string, string>
}

/**
 * Extract theme configuration from HTML
 */
export function extractThemeConfig(html: string): ThemeConfig {
  const $ = cheerio.load(html)
  const theme: ThemeConfig = {
    colors: {},
    fonts: {
      heading: '',
      body: '',
    },
    cssVariables: {},
  }

  // 1. Extract CSS custom properties from <style> tags
  const styleElements = $('style').get()
  for (let i = 0; i < styleElements.length; i++) {
    const el = styleElements[i]
    const css = $(el).html() || ''
    
    // Extract :root { --var: value; }
    const rootMatches = css.match(/:root\s*\{([^}]+)\}/g)
    if (rootMatches) {
      for (let j = 0; j < rootMatches.length; j++) {
        const block = rootMatches[j]
        const varMatches = block.match(/--[\w-]+\s*:\s*[^;]+/g)
        if (varMatches) {
          for (let k = 0; k < varMatches.length; k++) {
            const v = varMatches[k]
            const parts = v.split(':')
            const key = parts[0].trim()
            const value = parts.slice(1).join(':').trim()
            if (key && value) {
              theme.cssVariables[key] = value.replace(/;$/, '')
              // Map common color variables
              if (key.includes('color') || key.includes('primary') || key.includes('secondary') || 
                  key.includes('background') || key.includes('text') || key.includes('border')) {
                theme.colors[key] = value.replace(/;$/, '')
              }
            }
          }
        }
      }
    }

    // Also extract any --variable: value patterns outside :root
    const allVars = css.match(/--[\w-]+\s*:\s*[^;]+/g)
    if (allVars) {
      for (let k = 0; k < allVars.length; k++) {
        const v = allVars[k]
        const parts = v.split(':')
        const key = parts[0].trim()
        const value = parts.slice(1).join(':').trim()
        if (key && value) {
          theme.cssVariables[key] = value.replace(/;$/, '')
          if (key.includes('color') || key.includes('primary') || key.includes('secondary') || 
              key.includes('background') || key.includes('text') || key.includes('border')) {
            theme.colors[key] = value.replace(/;$/, '')
          }
        }
      }
    }
  }

  // 2. Extract from inline styles on :root, html, body
  const rootElements = $(':root, html, body').get()
  for (let i = 0; i < rootElements.length; i++) {
    const el = rootElements[i]
    const style = $(el).attr('style') || ''
    const vars = style.match(/--[\w-]+\s*:\s*[^;]+/g)
    if (vars) {
      for (let k = 0; k < vars.length; k++) {
        const v = vars[k]
        const parts = v.split(':')
        const key = parts[0].trim()
        const value = parts.slice(1).join(':').trim()
        if (key && value) {
          theme.cssVariables[key] = value.replace(/;$/, '')
          if (key.includes('color') || key.includes('primary') || key.includes('secondary') || 
              key.includes('background') || key.includes('text') || key.includes('border')) {
            theme.colors[key] = value.replace(/;$/, '')
          }
        }
      }
    }
  }

  // 3. Extract Google Fonts
  const fonts: string[] = []
  
  // From <link> tags
  const linkElements = $('link[href*="fonts.googleapis.com"]').get()
  for (let i = 0; i < linkElements.length; i++) {
    const el = linkElements[i]
    const href = $(el).attr('href') || ''
    const familyMatch = href.match(/family=([^&]+)/)
    if (familyMatch) {
      const families = familyMatch[1].split('|')
      for (let j = 0; j < families.length; j++) {
        const f = families[j]
        const clean = f.replace(/\+/g, ' ').replace(/:.*$/, '')
        if (clean && !fonts.includes(clean)) fonts.push(clean)
      }
    }
  }

  // From @import in CSS
  const importStyleElements = $('style').get()
  for (let i = 0; i < importStyleElements.length; i++) {
    const el = importStyleElements[i]
    const css = $(el).html() || ''
    const imports = css.match(/@import\s+['"][^'"]*fonts\.googleapis\.com[^'"]*['"]/g)
    if (imports) {
      for (let j = 0; j < imports.length; j++) {
        const imp = imports[j]
        const familyMatch = imp.match(/family=([^&'"]+)/)
        if (familyMatch) {
          const families = familyMatch[1].split('|')
          for (let k = 0; k < families.length; k++) {
            const f = families[k]
            const clean = f.replace(/\+/g, ' ').replace(/:.*$/, '')
            if (clean && !fonts.includes(clean)) fonts.push(clean)
          }
        }
      }
    }
  }

  // Assign fonts - first is heading, second is body (common convention)
  if (fonts.length > 0) {
    theme.fonts.heading = fonts[0]
    theme.fonts.body = fonts[1] || fonts[0]
  }

  // 4. Extract from inline styles on elements that look like they define theme
  const themeStyleElements = $('[style*="--"]').get()
  for (let i = 0; i < themeStyleElements.length; i++) {
    const el = themeStyleElements[i]
    const style = $(el).attr('style') || ''
    const vars = style.match(/--[\w-]+\s*:\s*[^;]+/g)
    if (vars) {
      for (let k = 0; k < vars.length; k++) {
        const v = vars[k]
        const parts = v.split(':')
        const key = parts[0].trim()
        const value = parts.slice(1).join(':').trim()
        if (key && value) {
          theme.cssVariables[key] = value.replace(/;$/, '')
          if (key.includes('color') || key.includes('primary') || key.includes('secondary') || 
              key.includes('background') || key.includes('text') || key.includes('border')) {
            theme.colors[key] = value.replace(/;$/, '')
          }
        }
      }
    }
  }

  return theme
}

/**
 * Generate theme config object for template layoutConfig
 */
export function generateThemeConfig(theme: ThemeConfig): Record<string, any> {
  const config: Record<string, any> = {}

  // Map common CSS variables to theme config keys
  const colorMappings: Record<string, string> = {
    '--primary': 'primary',
    '--primary-hover': 'primaryHover',
    '--secondary': 'secondary',
    '--secondary-hover': 'secondaryHover',
    '--accent': 'accent',
    '--dark': 'dark',
    '--dark-2': 'dark2',
    '--dark-3': 'dark3',
    '--light': 'light',
    '--white': 'white',
    '--gray': 'gray',
    '--border': 'border',
    '--success': 'success',
    '--error': 'error',
    '--warning': 'warning',
    '--info': 'info',
  }

  for (const [cssVar, configKey] of Object.entries(colorMappings)) {
    if (theme.cssVariables[cssVar]) {
      config[configKey] = theme.cssVariables[cssVar]
    }
  }

  // Fonts
  if (theme.fonts.heading) config.fontHeading = theme.fonts.heading
  if (theme.fonts.body) config.fontBody = theme.fonts.body

  // Font sizes, spacing, etc.
  if (theme.cssVariables['--base']) config.base = theme.cssVariables['--base']
  if (theme.cssVariables['--gutter-h']) config.gutterH = theme.cssVariables['--gutter-h']
  if (theme.cssVariables['--gutter-v']) config.gutterV = theme.cssVariables['--gutter-v']
  if (theme.cssVariables['--style-radius-s']) config.radiusS = theme.cssVariables['--style-radius-s']
  if (theme.cssVariables['--style-radius-m']) config.radiusM = theme.cssVariables['--style-radius-m']
  if (theme.cssVariables['--style-radius-l']) config.radiusL = theme.cssVariables['--style-radius-l']

  return config
}

/**
 * Extract theme from HTML string
 */
export function extractThemeFromHtml(html: string) {
  const $ = cheerio.load(html)
  const theme = extractThemeConfig(html)
  const config = generateThemeConfig(theme)
  return { theme, config }
}