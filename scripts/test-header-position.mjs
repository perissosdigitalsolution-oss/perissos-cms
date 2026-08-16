#!/usr/bin/env node
/**
 * Test: Header not covered by toolbar - debug selectors
 */

import puppeteer from 'puppeteer';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
const BACKOFFICE_URL = process.env.BACKOFFICE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@perissos.dev';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!@#';

async function testHeaderPosition() {
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

    // Debug: find header and toolbar elements
    const header = await page.$('#header')
    const headerClass = await page.$('.header')
    const toolbar = await page.$('[style*="z-index: 9999"]')
    const main = await page.$('main.digital-agency-template')
    
    console.log('\n🔍 Element search:')
    console.log(`  #header: ${header ? 'FOUND' : 'NOT FOUND'}`)
    console.log(`  .header: ${headerClass ? 'FOUND' : 'NOT FOUND'}`)
    console.log(`  toolbar [z-index:9999]: ${toolbar ? 'FOUND' : 'NOT FOUND'}`)
    console.log(`  main: ${main ? 'FOUND' : 'NOT FOUND'}`)

    // Try with header class
    if (headerClass) {
      const headerRect = await headerClass.boundingBox()
      console.log(`\n📐 Header (.header):`, headerRect)
    }
    
    if (toolbar) {
      const toolbarRect = await toolbar.boundingBox()
      console.log(`📐 Toolbar:`, toolbarRect)
    }

    // Check computed styles
    const headerStyle = await page.evaluate(() => {
      const h = document.querySelector('.header') || document.querySelector('#header')
      if (!h) return null
      const style = getComputedStyle(h)
      return {
        position: style.position,
        top: style.top,
        zIndex: style.zIndex,
      }
    })
    console.log('\n📋 Header computed style:', headerStyle)

    const toolbarStyle = await page.evaluate(() => {
      const t = document.querySelector('[style*="z-index: 9999"]')
      if (!t) return null
      const style = getComputedStyle(t)
      return {
        position: style.position,
        top: style.top,
        height: style.height,
        zIndex: style.zIndex,
      }
    })
    console.log('📋 Toolbar computed style:', toolbarStyle)

    // Open theme panel
    console.log('\n🎨 Opening theme panel...')
    const themeBtn = await page.$('button:has(i.fa-palette)')
    if (themeBtn) {
      await themeBtn.click()
      await new Promise(r => setTimeout(r, 1000))
      
      const toolbarStyle2 = await page.evaluate(() => {
        const t = document.querySelector('[style*="z-index: 9999"]')
        if (!t) return null
        const style = getComputedStyle(t)
        return { height: style.height, top: style.top }
      })
      console.log('📐 Toolbar after theme panel:', toolbarStyle2)
      
      const headerStyle2 = await page.evaluate(() => {
        const h = document.querySelector('.header') || document.querySelector('#header')
        if (!h) return null
        const style = getComputedStyle(h)
        return { top: style.top, position: style.position }
      })
      console.log('📐 Header after theme panel:', headerStyle2)
    }

    console.log('\n⏳ Browser will stay open for 30 seconds...')
    await new Promise(r => setTimeout(r, 30000))

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

testHeaderPosition();