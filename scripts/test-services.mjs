#!/usr/bin/env node
/**
 * Test: SectionEditor with arrays - click Services section
 */

import puppeteer from 'puppeteer';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
const BACKOFFICE_URL = process.env.BACKOFFICE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@perissos.dev';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!@#';

async function testServicesSection() {
  const browser = await puppeteer.launch({ 
    headless: false,  // VISIBLE BROWSER
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

    const sections = await page.$$('div[data-section-editor]');
    console.log(`Found ${sections.length} editable sections`);

    // Click Services section (index 1)
    console.log('\n🖱️  Clicking Services section (index 1)...');
    await sections[1].click();
    await new Promise(r => setTimeout(r, 1000));

    await page.waitForSelector('[data-section-editor]', { visible: true, timeout: 5000 });
    console.log('✅ SectionEditor panel opened');

    // Check fields
    const inputs = await page.$$eval('[data-section-editor] input[type="text"], [data-section-editor] textarea', 
      els => els.map(el => ({ tag: el.tagName, value: el.value, placeholder: el.placeholder }))
    );
    
    console.log('\n📋 SectionEditor Fields (Services):');
    inputs.forEach((input, i) => {
      if (input.value) {
        console.log(`  ${i + 1}. ${input.tag}: "${input.value.substring(0, 80)}"`);
      }
    });

    console.log('\n⏳ Browser will stay open for 30 seconds...');
    await new Promise(r => setTimeout(r, 30000));

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

testServicesSection();