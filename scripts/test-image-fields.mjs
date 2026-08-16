#!/usr/bin/env node
/**
 * Test: SectionEditor image fields
 */

import puppeteer from 'puppeteer';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
const BACKOFFICE_URL = process.env.BACKOFFICE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@perissos.dev';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!@#';

async function testImageFields() {
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

    const sections = await page.$$('div[data-section-editor]');
    console.log(`Found ${sections.length} editable sections`);

    // Click Hero section
    console.log('\n🖱️  Clicking Hero section...');
    await sections[0].click();
    await new Promise(r => setTimeout(r, 1000));

    await page.waitForSelector('[data-section-editor]', { visible: true, timeout: 5000 });
    console.log('✅ SectionEditor panel opened');

    // Check ALL fields including labels
    const fieldData = await page.$$eval('[data-section-editor] .section-editor-field, [data-section-editor] div[style*="margin-bottom"]', 
      els => els.map(el => {
        const label = el.querySelector('label');
        const input = el.querySelector('input[type="text"]') || el.querySelector('textarea');
        return {
          label: label ? label.textContent : 'NO_LABEL',
          value: input ? input.value : 'NO_INPUT',
          type: input ? input.tagName : 'NO_INPUT'
        };
      })
    );
    
    console.log('\n📋 ALL SectionEditor Fields (Hero):');
    fieldData.forEach((field, i) => {
      console.log(`  ${i + 1}. Label: "${field.label}" | Type: ${field.type} | Value: "${field.value}"`);
    });

    // Now click Services section
    console.log('\n🖱️  Clicking Services section...');
    const closeBtn = await page.$('[data-section-editor] button:has(i.fa-times)');
    if (closeBtn) await closeBtn.click();
    await new Promise(r => setTimeout(r, 500));

    await sections[1].click();
    await new Promise(r => setTimeout(r, 1000));
    await page.waitForSelector('[data-section-editor]', { visible: true, timeout: 5000 });

    const servicesFields = await page.$$eval('[data-section-editor] .section-editor-field, [data-section-editor] div[style*="margin-bottom"]', 
      els => els.map(el => {
        const label = el.querySelector('label');
        const input = el.querySelector('input[type="text"]') || el.querySelector('textarea');
        return {
          label: label ? label.textContent : 'NO_LABEL',
          value: input ? input.value : 'NO_INPUT',
          type: input ? input.tagName : 'NO_INPUT'
        };
      })
    );
    
    console.log('\n📋 Services Fields (first 20):');
    servicesFields.slice(0, 20).forEach((field, i) => {
      console.log(`  ${i + 1}. Label: "${field.label}" | Type: ${field.type} | Value: "${field.value}"`);
    });

    // Now click Team section
    console.log('\n🖱️  Clicking Team section...');
    const closeBtn2 = await page.$('[data-section-editor] button:has(i.fa-times)');
    if (closeBtn2) await closeBtn2.click();
    await new Promise(r => setTimeout(r, 500));

    await sections[4].click(); // Team is index 4
    await new Promise(r => setTimeout(r, 1000));
    await page.waitForSelector('[data-section-editor]', { visible: true, timeout: 5000 });

    const teamFields = await page.$$eval('[data-section-editor] .section-editor-field, [data-section-editor] div[style*="margin-bottom"]', 
      els => els.map(el => {
        const label = el.querySelector('label');
        const input = el.querySelector('input[type="text"]') || el.querySelector('textarea');
        return {
          label: label ? label.textContent : 'NO_LABEL',
          value: input ? input.value : 'NO_INPUT',
          type: input ? input.tagName : 'NO_INPUT'
        };
      })
    );
    
    console.log('\n📋 Team Fields:');
    teamFields.forEach((field, i) => {
      console.log(`  ${i + 1}. Label: "${field.label}" | Type: ${field.type} | Value: "${field.value}"`);
    });

    console.log('\n⏳ Browser will stay open for 30 seconds...');
    await new Promise(r => setTimeout(r, 30000));

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

testImageFields();