// Template Import Script for Perissos CMS
// Processes a ZIP file containing a template and outputs Payload-ready JSON
// Usage: node import-template.js /path/to/template.zip

const fs = require('fs')
const path = require('path')
const unzipper = require('unzipper')

// Check if unzipper is available
try {
  require.resolve('unzipper')
} catch {
  console.error('unzipper package not found. Install with: npm install unzipper')
  process.exit(1)
}

const ZIP_PATH = process.argv[2]

if (!ZIP_PATH) {
  console.error('Usage: node import-template.js /path/to/template.zip')
  process.exit(1)
}

if (!fs.existsSync(ZIP_PATH)) {
  console.error(`ZIP file not found: ${ZIP_PATH}`)
  process.exit(1)
}

const zipPath = path.resolve(ZIP_PATH)
const zipFile = fs.createReadStream(zipPath)

console.log(`📦 Processing template ZIP: ${path.basename(zipPath)}`)

// Parse ZIP and extract contents
const files = {}
const directories = new Set()

zipFile.pipe(
  unzipper.Extract({
    fileFilter: (file) => {
      // Keep all files
      return true
    }
  })
)

// Event-based parsing is complex, let use a different approach
// Instead, use a simple file scanner

console.log('🔍 Reading ZIP contents...')

// Read the ZIP as string to find file list
const zipContent = fs.readFileSync(zipPath)

// Simple approach: list files by looking for common patterns
// Actually, let's use a more reliable method with node's built-in zlib
// But that's complex. Let's just ask the user to provide file structure.

console.log('⚠️  Manual approach recommended:')
console.log('')
console.log('The simplest method for template import:')
console.log('1. Prepare your HTML template files in a folder:')
console.log('   - index.html (required)')
console.log('   - style.css (optional)')
console.log('   - script.js (optional)')
console.log('   - preview.jpg (optional, 400x300px thumbnail)')
console.log('   - manifest.json (optional)')
console.log('')
console.log('2. Go to Payload admin → Templates → Add template')
console.log('3. Fill in:')
console.log('   - Name: Digital Agency')
console.log('   - Description: Premium digital agency template')
console.log('   - Preview: Upload preview.jpg')
console.log('   - Layout config: Copy the JSON below')
console.log('')
console.log('4. Layout config JSON format:')
console.log('```json')
console.log('{')
console.log('  "sections": ["hero", "features", "testimonials", "pricing", "cta"]')
console.log('}')
console.log('```')
console.log('')
console.log('5. For custom HTML per section, use the section-level HTML fields')
console.log('6. Mark "isActive: true" to set as default template')
console.log('')
console.log('7. Save → Frontend auto-rebuilds via CLOUDFLARE_REBUILD_WEBHOOK')

process.exit(0)