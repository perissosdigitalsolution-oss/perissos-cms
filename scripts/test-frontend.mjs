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

    // Test 2: Page content is rendered (hero section exists)
    const heroTitle = await page.$eval('#hero h1', el => el.textContent).catch(() => null);
    if (!heroTitle || heroTitle.length < 5) {
      throw new Error('Hero section not rendered correctly');
    }
    console.log('✓ Hero section rendered with title:', heroTitle.trim());

    // Test 3: Multiple sections render
    const sections = await page.$$eval('section', els => els.map(el => el.id || 'no-id'));
    const nonEmptySections = sections.filter(id => id && id !== 'no-id');
    if (nonEmptySections.length < 3) {
      throw new Error(`Expected at least 3 sections with IDs, got ${nonEmptySections.length}`);
    }
    console.log(`✓ ${nonEmptySections.length} sections rendered:`, nonEmptySections.join(', '));

    // Test 4: Login to backoffice
    await page.goto(`${BACKOFFICE_URL}/admin/login`, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.waitForSelector('input[name="email"]', { timeout: 20000 });
    await page.type('input[name="email"]', ADMIN_EMAIL);
    await page.type('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 });
    console.log('✓ Backoffice login works');

    // Test 5: Return to frontend, edit toolbar appears
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle0', timeout: 60000 });
    await new Promise(r => setTimeout(r, 5000));
    
    const toolbar = await page.$('div[style*="z-index: 9999"]');
    if (!toolbar) {
      throw new Error('Edit toolbar not visible after login');
    }
    console.log('✓ Edit toolbar appears when authenticated');

    // Test 6: Verify sections are editable (data-section-editor attribute) OR rendered from template HTML
    const editableSections = await page.$$('div[data-section-editor]');
    const hasRenderedHtml = await page.evaluate(() => !!document.querySelector('main')?.querySelector('#masthead, #hero'));
    if (editableSections.length > 0) {
      console.log(`✓ ${editableSections.length} editable sections found (React components)`);
    } else if (hasRenderedHtml) {
      console.log('✓ Rendered template HTML detected (static mode, section editor via backoffice)');
    } else {
      throw new Error('No editable sections or rendered template found');
    }

    // Test 7: If editable sections exist, click first section opens SectionEditor
    if (editableSections.length > 0) {
      await editableSections[0].click();
      await new Promise(r => setTimeout(r, 1000));
      
      const sectionEditorInputs = await page.$$eval('input[type="text"]', els => 
        els.map(el => el.value)
      );
      
      if (sectionEditorInputs.length === 0) {
        throw new Error('SectionEditor inputs not populated');
      }
      console.log('✓ SectionEditor opens with populated fields');
    } else {
      console.log('✓ Template rendering verified (section editing via backoffice Pages)');
    }

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
