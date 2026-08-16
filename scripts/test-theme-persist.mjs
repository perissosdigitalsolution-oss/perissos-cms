#!/usr/bin/env node
/**
 * Test: Theme persistence - change theme, save, reload, verify
 */

import puppeteer from 'puppeteer';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
const BACKOFFICE_URL = process.env.BACKOFFICE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@perissos.dev';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!@#';

async function testThemePersistence() {
  const browser = await puppeteer.launch({ 
    headless: true,
    defaultViewport: { width: 1400, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
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

    // Open theme panel
    console.log('\n🎨 Opening theme panel...');
    const themeBtn = await page.$('button:has(i.fa-palette)')
    if (!themeBtn) throw new Error('Theme button not found')
    await themeBtn.click()
    await new Promise(r => setTimeout(r, 1000))
    console.log('✅ Theme panel opened')

    // Change primary color to blue
    console.log('\n🎨 Changing primary color to blue...')
    await page.evaluate(() => {
      const colorInput = document.querySelector('input[type="color"]')
      if (colorInput) {
        colorInput.value = '#0066FF'
        colorInput.dispatchEvent(new Event('input', { bubbles: true }))
        colorInput.dispatchEvent(new Event('change', { bubbles: true }))
      }
    })
    await new Promise(r => setTimeout(r, 500))

    // Verify CSS variable changed
    const primaryBeforeSave = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--primary'))
    console.log(`📐 CSS variable --primary before save: "${primaryBeforeSave.trim()}"`)

    // Click Save Changes in toolbar
    console.log('\n💾 Clicking Save Changes...')
    const saveBtn = await page.$('button:has(i.fa-save)')
    if (!saveBtn) throw new Error('Save button not found')
    await saveBtn.click()
    await new Promise(r => setTimeout(r, 3000))
    console.log('✅ Save clicked')

    // Reload page
    console.log('\n🔄 Reloading page...')
    await page.reload({ waitUntil: 'networkidle0' })
    await new Promise(r => setTimeout(r, 3000))

    // Login again
    console.log('\n🔐 Logging in again...')
    await page.goto(`${BACKOFFICE_URL}/admin/login`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('input[name="email"]', { timeout: 10000 });
    await page.type('input[name="email"]', ADMIN_EMAIL);
    await page.type('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    // Go back to frontend
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));

    // Check if theme persisted
    const primaryAfterReload = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--primary'))
    console.log(`📐 CSS variable --primary after reload: "${primaryAfterReload.trim()}"`)

    if (primaryAfterReload.trim() === '#0066ff' || primaryAfterReload.trim() === 'rgb(0, 102, 255)') {
      console.log('\n✅ THEME PERSISTED SUCCESSFULLY!')
    } else {
      console.log('\n❌ Theme NOT persisted - reverted to default')
      console.log('   Expected: #0066ff or rgb(0, 102, 255)')
    }

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

testThemePersistence();