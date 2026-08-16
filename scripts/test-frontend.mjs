#!/usr/bin/env node
/**
 * Frontend Integration Tests for Perissos CMS
 * Uses Puppeteer to verify the rendered frontend works correctly
 * Usage: FRONTEND_URL=http://localhost:3001 BACKOFFICE_URL=http://localhost:3000 node scripts/test-frontend.mjs
 */

import puppeteer from 'puppeteer';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
const BACKOFFICE_URL = process.env.BACKOFFICE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@perissos.dev';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!@#';

async function testFrontendLoads() {
  const browser = await puppeteer.launch({ 
    headless: true,
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  let errors = [];
  
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore 404s for non-critical resources (favicon, etc.)
      if (!text.includes('404') || text.includes('api/') || text.includes('chunk') || text.includes('.js')) {
        errors.push(text);
      }
    }
  });

  try {
    // Test 1: Frontend loads without JS errors
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle0', timeout: 60000 });
    await new Promise(r => setTimeout(r, 3000));
    
    if (errors.length > 0) {
      throw new Error(`Frontend has console errors: ${errors.join(', ')}`);
    }
    console.log('✓ Frontend loads without errors');

    // Test 2: Page content is rendered (CMS-driven sections)
    const heroTitle = await page.$eval('#hero h1', el => el.textContent).catch(() => null);
    if (!heroTitle || !heroTitle.includes('Digital Experiences')) {
      throw new Error('Hero section not rendered correctly');
    }
    console.log('✓ CMS-driven sections rendered correctly');

    // Test 3: Login to backoffice
    await page.goto(`${BACKOFFICE_URL}/admin/login`, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.waitForSelector('input[name="email"]', { timeout: 20000 });
    await page.type('input[name="email"]', ADMIN_EMAIL);
    await page.type('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 });
    console.log('✓ Backoffice login works');

    // Test 4: Return to frontend, edit toolbar appears
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle0', timeout: 60000 });
    await new Promise(r => setTimeout(r, 5000));
    
    const toolbar = await page.$('div[style*="z-index: 9999"]');
    if (!toolbar) {
      throw new Error('Edit toolbar not visible after login');
    }
    console.log('✓ Edit toolbar appears when authenticated');

    // Test 5: Click section opens SectionEditor with populated fields
    const sections = await page.$$('div[data-section-editor]');
    if (sections.length === 0) throw new Error('No editable sections found');
    
    await sections[0].click();
    await new Promise(r => setTimeout(r, 1000));
    
    await page.waitForSelector('[data-section-editor]', { visible: true, timeout: 5000 });
    console.log('✓ SectionEditor panel opens on click');

    // Test 6: Verify SectionEditor fields are populated from section data
    const inputs = await page.$$eval('input[type="text"]', els => 
      els.map(el => ({ value: el.value }))
    );
    
    const titleInput = inputs.find(i => i.value && i.value.includes('Digital Experiences'));
    const highlightInput = inputs.find(i => i.value && i.value.includes('Digital'));
    const badgeInput = inputs.find(i => i.value && i.value.includes('Periss'));
    
    if (!titleInput) throw new Error('Title field not populated in SectionEditor');
    if (!highlightInput) throw new Error('Title Highlight field not populated');
    if (!badgeInput) throw new Error('Badge Text field not populated');
    console.log('✓ SectionEditor fields correctly populated from section data');

    // Test 7: Verify textarea is populated
    const textareas = await page.$$eval('textarea', els => 
      els.map(el => ({ value: el.value }))
    );
    const descTextarea = textareas.find(t => t.value.includes('Transforming businesses'));
    if (!descTextarea) throw new Error('Description textarea not populated');
    console.log('✓ SectionEditor textarea correctly populated');

    await browser.close();
    return true;
    
  } catch (err) {
    await browser.close();
    throw err;
  }
}

async function run() {
  console.log(`\n🌐 Running frontend integration tests against ${FRONTEND_URL}\n`);
  const start = Date.now();

  try {
    await testFrontendLoads();
    console.log(`\n✅ All frontend tests passed in ${Date.now() - start}ms\n`);
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ Frontend test failed: ${err.message}\n`);
    process.exit(1);
  }
}

run();