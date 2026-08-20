#!/usr/bin/env node
/**
 * Test: ImageUpload component in SectionEditor
 */

import puppeteer from 'puppeteer';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
const BACKOFFICE_URL = process.env.BACKOFFICE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@perissos.dev';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!@#';

async function testImageUpload() {
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

    // Click Hero section
    console.log('\n🖱️ Clicking Hero section...');
    const sections = await page.$$('div[data-section-editor]');
    await sections[0].click();
    await new Promise(r => setTimeout(r, 1000));

    await page.waitForSelector('[data-section-editor]', { visible: true, timeout: 5000 });
    console.log('✅ SectionEditor panel opened');

    // Look for ImageUpload components
    console.log('\n🔍 Checking for ImageUpload components...');
    
    // Check for Main Image field
    const mainImageLabel = await page.$$eval('[data-section-editor] label', els => 
      els.map(el => el.textContent).find(t => t?.includes('Main Image'))
    )
    if (mainImageLabel) {
      console.log('✅ Found "Main Image" label:', mainImageLabel)
      
      // Look for the upload button - check all buttons in the panel
      const allButtons = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('[data-section-editor] button'))
        return buttons.map(b => b.textContent?.trim())
      })
      console.log('📋 All buttons in panel:', allButtons)
      
      const uploadBtn = allButtons.find(b => b?.includes('Upload'))
      if (uploadBtn) {
        console.log('✅ Found upload button:', uploadBtn)
      } else {
        console.log('❌ Upload button not found')
      }
      
      // Look for file input
      const fileInput = await page.$('[data-section-editor] input[type="file"]')
      if (fileInput) {
        console.log('✅ Found file input (hidden)')
      } else {
        console.log('❌ File input not found')
      }
      
      // Look for URL input
      const urlInput = await page.$('[data-section-editor] input[type="url"]')
      if (urlInput) {
        console.log('✅ Found URL input')
      } else {
        console.log('❌ URL input not found')
      }
    } else {
      console.log('❌ "Main Image" label not found')
    }

    // Check all fields for "Image" in label
    const allLabels = await page.$$eval('[data-section-editor] label', els => 
      els.map(el => el.textContent).filter(t => t?.includes('Image'))
    )
    console.log('\n📋 All Image-related labels:', allLabels)

    console.log('\n⏳ Browser will stay open for 60 seconds for manual testing...')
    await new Promise(r => setTimeout(r, 60000))

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

testImageUpload();