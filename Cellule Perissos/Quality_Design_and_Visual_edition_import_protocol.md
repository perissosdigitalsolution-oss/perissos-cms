# Quality Design & Visual Edition Import Protocol

**Version:** 1.0
**Date:** 2026-08-23
**Location:** `Cellule Perissos/Quality_Design_and_Visual_edition_import_protocol.md`
**Authority:** Frontend_Developer + UI_Designer + Backend_Architect
**Classification:** Mandatory — All template imports and visual editor changes must follow this protocol

---

## 1. Purpose

Every template imported into Perissos CMS (via marketplace ZIP, manual upload, or GrapeJS visual builder) must render **pixel-perfect** in both normal and edit mode, without code changes. This protocol defines the data contracts, rendering pipeline, and quality gates that guarantee visual fidelity across imports.

---

## 2. Architecture Overview

### 2.1 Template Data Flow

```
ZIP Import → Templates Collection → Activate → Pages Collection
                                                     ↓
                                              renderedHtml (HTML+CSS inlined)
                                              sections[] (Payload blocks)
                                              theme (JSON — camelCase keys)
                                              projectData (GrapeJS)
                                                     ↓
                                           Frontend (marketing/page.tsx)
                                              ├─ Path A: renderedHtml → dangerouslySetInnerHTML
                                              └─ Path B: sections[] → React components via template-registry
```

### 2.2 Rendering Paths

| Path | Trigger | CSS Source | Use Case |
|------|---------|-----------|----------|
| **Path A** | `page.renderedHtml` exists | Inlined `<style>` from `renderedHtml` | Marketplace-installed templates |
| **Path B** | No `renderedHtml`, `sections[]` populated | External CSS (`/styles/*.css`) + template-registry components | CMS-managed sections |

**Rule:** Path A is the primary rendering path. Templates MUST store self-contained HTML with inlined CSS.

---

## 3. Theme Data Contract

### 3.1 DB Format vs Internal Format

The DB stores theme keys with `--` prefix. All frontend code uses camelCase.

| DB Key | Internal Key | CSS Variable |
|--------|-------------|--------------|
| `--primary` | `primary` | `--primary` |
| `--primary-hover` | `primaryHover` | `--primary-hover` |
| `--dark` | `dark` | `--dark` |
| `--dark-2` | `dark2` | `--dark-2` |
| `--dark-3` | `dark3` | `--dark-3` |
| `--light` | `light` | `--light` |
| `--white` | `white` | `--white` |
| `--gray` | `gray` | `--gray` |
| `--border` | `border` | `--border` |
| `--font-body` | `fontBody` | `--font-body` |
| `--font-heading` | `fontHeading` | `--font-heading` |
| `--border-radius` | `borderRadius` | `--border-radius` |
| `--spacing` | `spacing` | `--spacing` |

### 3.2 Normalization Function

```typescript
function normalizeTheme(raw: Record<string, string>): Record<string, string> {
  const keyMap: Record<string, string> = {
    '--primary': 'primary', '--primary-hover': 'primaryHover', '--dark': 'dark',
    '--dark-2': 'dark2', '--dark-3': 'dark3', '--light': 'light', '--white': 'white',
    '--gray': 'gray', '--border': 'border', '--font-body': 'fontBody',
    '--font-heading': 'fontHeading', '--border-radius': 'borderRadius', '--spacing': 'spacing',
  }
  const out: Record<string, string> = {}
  for (const [dbKey, camelKey] of Object.entries(keyMap)) {
    if (raw[dbKey] !== undefined) out[camelKey] = raw[dbKey]
  }
  // Pass through any additional camelCase keys
  for (const [k, v] of Object.entries(raw)) {
    if (!k.startsWith('--') && typeof v === 'string') out[k] = v
  }
  return out
}
```

**Where applied:**
- `page.tsx` `processPageData()` — normalizes on load from DB
- `ThemePanel` constructor — normalizes `initialTheme` prop

### 3.3 Rule: Never Access DB Keys Directly

All frontend components MUST access theme as `theme.primary`, `theme.dark`, etc. Never as `theme['--primary']`. The `normalizeTheme` function ensures this at the data boundary.

---

## 4. CSS Variable Injection Pipeline

### 4.1 Three-Layer Injection (in order)

| Layer | Source | Target | When |
|-------|--------|--------|------|
| **1. Template CSS** | `renderedHtml` `<style>` tags | `<head>` `<style#template-rendered-css>` | On `renderedHtml` change |
| **2. :root Variables** | Regex extract from template CSS | `<html>` inline styles | After CSS injection |
| **3. Theme Variables** | `theme` object from DB | `<html>` inline styles | After `:root` extraction |

### 4.2 Critical: Theme useEffect Must NOT Override Template :root

The CSS injection useEffect (layer 1-2) runs first and extracts correct values from the template's `:root` block. The theme useEffect (layer 3) must **supplement, not replace** — it only sets values that exist in the theme object.

**Anti-pattern (causes bugs):**
```typescript
// BAD: Overwrites template :root values with undefined
Object.entries(theme).forEach(([key, value]) => {
  root.style.setProperty(`--${key}`, value) // value may be undefined
})
```

**Correct pattern:**
```typescript
// GOOD: Only set if value exists
const keyToVar = { primary: '--primary', dark: '--dark', /* ... */ }
for (const [camelKey, cssVar] of Object.entries(keyToVar)) {
  if (theme[camelKey]) root.style.setProperty(cssVar, theme[camelKey])
}
```

---

## 5. GrapeJS Visual Builder Contract

### 5.1 Canvas CSS Requirements

The GrapeJS iframe MUST receive:

1. **Template CSS files** — `/styles/digital-agency.css`, `/styles/restaurant.css`
2. **Template class on `<html>`** — e.g., `digital-agency-template` (mapped from DB category `agency`)
3. **Theme CSS variables** — injected via `injectThemeStyles()`
4. **Extracted styles** from `renderedHtml` `<style>` tags

### 5.2 Category-to-CSS-Class Mapping

DB categories do NOT match CSS class names. Use this mapping:

```typescript
const cssClassMap: Record<string, string> = {
  agency: 'digital-agency',
  restaurant: 'restaurant',
}
```

### 5.3 Override CSS Rules

The GrapeJS override CSS MUST:
- **NOT** hardcode `background: #fff` on canvas elements
- **NOT** hardcode accent colors (`#c8a97e`, `#FF6600`)
- **NOT** override body background, font, or color
- **ONLY** fix structural issues (height, overflow, padding)
- **ONLY** add GrapeJS-specific interaction styles (selection outlines)

**Forbidden patterns:**
```css
.gjs-cv-canvas { background: #fff !important; }  /* FORBIDDEN */
body { background: #fff !important; }              /* FORBIDDEN */
.hero-title span { color: #c8a97e !important; }   /* FORBIDDEN */
```

**Required pattern:**
```css
[data-gjs-type="wrapper"] { min-height: auto !important; }
body { height: 100vh !important; overflow-y: auto !important; }
[data-gjs-selectable]:hover { outline: 2px dashed rgba(255,102,0,0.4); }
```

---

## 6. Template Import Checklist

Every template import MUST satisfy these criteria before activation:

### 6.1 Data Integrity

- [ ] `renderedHtml` contains self-contained HTML with inlined `<style>` tags
- [ ] `renderedHtml` does NOT contain stub CSS (e.g., `body { font-family: Arial; }`)
- [ ] `theme` object uses `--key` format in DB, camelCase in frontend
- [ ] `layoutConfig.cssVariableMapping` is populated (empty `{}` is a bug)
- [ ] `layoutConfig.sectionDefinitions` has entries for all sections

### 6.2 Visual Fidelity (Normal Mode)

- [ ] Body background matches template design (dark/light)
- [ ] Body font-family matches template design
- [ ] All 11+ CSS variables have correct hex values (no `"undefined"`)
- [ ] No quad-dash variables (`----dark`) on `<html>`
- [ ] Accent colors (primary, hover) match template design
- [ ] Section backgrounds, text colors, borders match template

### 6.3 Visual Fidelity (Edit Mode)

- [ ] All CSS variables identical to normal mode
- [ ] ThemePanel color inputs show valid hex values (no `undefined`)
- [ ] ThemePanel "Save & Close" persists to DB without error
- [ ] Color changes in ThemePanel apply live to page
- [ ] ContentPanel sections render correctly
- [ ] No React controlled/uncontrolled input warnings

### 6.4 GrapeJS Visual Builder

- [ ] Canvas body background matches template (not white)
- [ ] Canvas body font matches template
- [ ] Template accent colors visible (not hardcoded to wrong template)
- [ ] Template class on `<html>` element matches CSS file
- [ ] Content loaded from `renderedHtml` renders correctly
- [ ] AI Design assistant generates valid HTML

---

## 7. Common Failure Patterns & Fixes

### 7.1 "Undefined" CSS Variables

**Symptom:** All CSS variables on `<html>` are the string `"undefined"`
**Cause:** ThemePanel useEffect accessed `theme.primary` (camelCase) but DB had `"--primary"`
**Fix:** `normalizeTheme()` at data boundary; `tv(camelKey, dbKey)` helper for dual-format access

### 7.2 GrapeJS White Background

**Symptom:** Page Builder canvas shows white background instead of template dark
**Cause:** Override CSS hardcoded `background: #fff` OR template class not on canvas `<html>`
**Fix:** Remove hardcoded backgrounds; add `cssClassMap` mapping; inject template class on canvas `<html>`

### 7.3 Color Save Error

**Symptom:** ThemePanel shows "1 Issue" React error, colors don't persist
**Cause:** Mixed key formats in theme object (`"--primary"` + `"primary"`) sent to DB
**Fix:** Normalize to camelCase on load; save as camelCase; DB accepts either format (JSON field)

### 7.4 Template Class Mismatch

**Symptom:** CSS selectors like `.digital-agency-template body` don't match
**Cause:** DB category is `agency` but CSS expects `digital-agency`
**Fix:** Use `cssClassMap` to translate DB categories to CSS class names

---

## 8. Agent Responsibilities

| Agent | Responsibility |
|-------|---------------|
| **Frontend_Developer** | Enforce normalization at data boundary; no hardcoded colors in override CSS |
| **UI_Designer** | Verify visual fidelity screenshots (normal + edit mode) per checklist |
| **Backend_Architect** | Ensure `layoutConfig` is populated on import; `theme` field is JSON |
| **Developer_Senior** | Review CSS variable injection code for key-format bugs |
| **Quality_Design_and_Visual** | Run Puppeteer comparison tests; sign off on visual checklist |

---

## 9. Testing Protocol

### 9.1 Puppeteer Visual Test

```bash
# Normal mode
NODE_PATH=/tmp/node_modules node -e "
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3000));
  
  // Check CSS vars
  const vars = await page.evaluate(() => {
    const root = document.documentElement;
    const v = {};
    for (let i = 0; i < root.style.length; i++) {
      const prop = root.style.item(i);
      if (prop.startsWith('--')) v[prop] = root.style.getPropertyValue(prop);
    }
    return v;
  });
  
  const undefinedVars = Object.entries(vars).filter(([k, v]) => v === 'undefined');
  console.log('Undefined vars:', undefinedVars.length ? undefinedVars.map(([k]) => k) : 'NONE');
  
  await page.screenshot({ path: '/tmp/normal.png', fullPage: true });
  await browser.close();
})();
"
```

### 9.2 Edit Mode Test

```bash
# Set auth cookie, repeat checks, verify ThemePanel inputs
# See section 6.3 checklist
```

### 9.3 GrapeJS Test

```bash
# Open Page Builder, check canvas body bg/font/color
# Verify template class on iframe <html>
# See section 6.4 checklist
```

---

## 10. Changelog

| Date | Version | Change |
|------|---------|--------|
| 2026-08-23 | 1.0 | Initial protocol — theme normalization, GrapeJS canvas, import checklist |

---

**No template goes live without passing this protocol. No visual editor change ships without this checklist.**
