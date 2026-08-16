#!/usr/bin/env node
/**
 * Test: Theme applies for non-logged-in users
 */

import puppeteer from 'puppeteer';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';

async function testThemeForAnonymous() {
  const browser = await puppeteer.launch({ 
    headless: true,
    defaultViewport: { width: 1400, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('\n🌐 Opening frontend WITHOUT login (anonymous)...');
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));

    // Check if theme CSS variables are applied
    const primary = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--primary'))
    const fontHeading = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--font-heading'))
    const fontBody = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--font-body'))
    const dark = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--dark'))
    
    console.log('\n📐 CSS Variables for ANONYMOUS user:')
    console.log(`  --primary: "${primary.trim()}"`)
    console.log(`  --font-heading: "${fontHeading.trim()}"`)
    console.log(`  --font-body: "${fontBody.trim()}"`)
    console.log(`  --dark: "${dark.trim()}"`)

    // Verify they match the saved theme (blue primary)
    if (primary.trim() === '#0066ff' || primary.trim() === 'rgb(0, 102, 255)') {
      console.log('\n✅ THEME APPLIED for anonymous user!')
    } else {
      console.log('\n❌ Theme NOT applied for anonymous user')
      console.log('   Expected: #0066ff or rgb(0, 102, 255)')
      console.log(`   Got: "${primary.trim()}"`)
    }

    // Also check that sections render correctly
    const sections = await page.$$('div[data-section-editor]')
    console.log(`\n📄 Sections rendered: ${sections.length}`)

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

testThemeForAnonymous();