import puppeteer from 'puppeteer'
const browser = await puppeteer.launch({ headless: 'new' })
const page = await browser.newPage()
await page.goto('http://localhost:3001/', { waitUntil: 'domcontentloaded', timeout: 30000 })
await new Promise(r => setTimeout(r, 3000))
const info = await page.evaluate(() => ({
  bodyClass: document.body.className,
  heroTitle: document.querySelector('.r-hero-title')?.textContent?.trim() || document.querySelector('.hero-title')?.textContent?.trim() || null,
  heroSectionClass: document.querySelector('section[id]')?.className,
  fonts: document.fonts ? 'available' : 'no',
}))
console.log(JSON.stringify(info, null, 2))
await browser.close()
