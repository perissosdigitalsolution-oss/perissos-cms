#!/usr/bin/env node
/**
 * Test: Theme Panel
 */

import puppeteer from 'puppeteer';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
const BACKOFFICE_URL = process.env.BACKOFFICE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@perissos.dev';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!@#';

async function testThemePanel() {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1400, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (['log', 'error', 'warn'].includes(msg.type())) {
      console.log(`[BROWSER ${msg.type().toUpperCase()}]`, msg.text());
    }
  });
  
  page.on('pageerror', err => {
    console.log('[BROWSER ERROR]', err.message);
  });

  try {
    console.log('\n🌐 Opening backoffice login...');
    await page.goto(`${BACKOFFICE_URL}/admin/login`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('input[name="email"]', { timeout: 10000 });
    await page.type('input[name="email"]', ADMIN_EMAIL);
    await page.type('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log('✅ Logged in');

    console.log('\n🌐 Opening frontend...');
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));

    // Find Theme button and click
    console.log('\n🎨 Clicking Theme button...');
    const themeBtn = await page.$('button:has(i.fa-palette)');
    if (!themeBtn) {
      throw new Error('Theme button not found')
    }
    await themeBtn.click()
    await new Promise(r => setTimeout(r, 1000))
    console.log('✅ Theme panel opened')

    // Check for color pickers
    const colorInputs = await page.$$eval('input[type="color"]', els => els.length)
    console.log(`\n🎨 Found ${colorInputs} color pickers`)

    // Check for font inputs
    const fontInputs = await page.$$eval('input[type="text"][placeholder*="sans-serif"]', els => els.length)
    console.log(`🔤 Found ${fontInputs} font inputs`)

    // Check for preset buttons
    const presetBtns = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      return buttons.filter(b => b.textContent?.includes('Default') || b.textContent?.includes('Modern') || b.textContent?.includes('Classic')).length
    })
    console.log(`📋 Found ${presetBtns} preset buttons`)

    // Test changing primary color
    console.log('\n🎨 Testing color change...')
    await page.evaluate(() => {
      const colorInput = document.querySelector('input[type="color"]')
      if (colorInput) {
        colorInput.value = '#0066FF'
        colorInput.dispatchEvent(new Event('input', { bubbles: true }))
        colorInput.dispatchEvent(new Event('change', { bubbles: true }))
        console.log('Changed primary color to blue')
      }
    })
    await new Promise(r => setTimeout(r, 500))

    // Check if CSS variable was applied
    const primaryColor = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--theme-primary'))
    console.log(`📐 CSS variable --theme-primary: "${primaryColor.trim()}"`)

    // Test font preset
    console.log('\n🔤 Testing font preset (Modern)...')
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      const modernBtn = buttons.find(b => b.textContent?.includes('Modern'))
      if (modernBtn) modernBtn.click()
    })
    await new Promise(r => setTimeout(r, 500))
    const headingFont = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--theme-font-heading'))
    const bodyFont = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--theme-font-body'))
    console.log(`📐 CSS variable --theme-font-heading: "${headingFont.trim()}"`)
    console.log(`📐 CSS variable --theme-font-body: "${bodyFont.trim()}"`)

    // Test reset
    console.log('\n🔄 Testing reset...')
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      const resetBtn = buttons.find(b => b.querySelector('i.fa-undo'))
      if (resetBtn) resetBtn.click()
    })
    await new Promise(r => setTimeout(r, 500))
    const resetPrimary = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--theme-primary'))
    console.log(`📐 After reset --theme-primary: "${resetPrimary.trim()}"`)

    console.log('\n✅ Theme panel test complete!')
    console.log('⏳ Browser will stay open for 30 seconds for manual testing...')
    await new Promise(r => setTimeout(r, 30000))

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

testThemePanel();