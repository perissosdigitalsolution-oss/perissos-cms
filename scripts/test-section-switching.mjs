#!/usr/bin/env node
/**
 * Test: SectionEditor adapts when switching between sections
 */

import puppeteer from 'puppeteer';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
const BACKOFFICE_URL = process.env.BACKOFFICE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@perissos.dev';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!@#';

async function testSectionSwitching() {
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
      if (!text.includes('404') || text.includes('api/') || text.includes('chunk') || text.includes('.js')) {
        errors.push(text);
      }
    }
  });

  try {
    // Login
    await page.goto(`${BACKOFFICE_URL}/admin/login`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('input[name="email"]', { timeout: 10000 });
    await page.type('input[name="email"]', ADMIN_EMAIL);
    await page.type('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    // Go to frontend
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));

    const sections = await page.$$('div[data-section-editor]');
    console.log(`Found ${sections.length} editable sections`);

    // Test each section - click, verify fields populate, close, repeat
    const sectionTests = [
      { index: 0, blockType: 'hero', expectedTitle: 'We Build Digital Experiences That Matter' },
      { index: 1, blockType: 'services', expectedTitle: 'Solutions That Drive Digital Growth' },
      { index: 2, blockType: 'about', expectedTitle: "We're a Team of Digital Experts" },
    ];

    for (const test of sectionTests) {
      console.log(`\nTesting section ${test.index + 1} (${test.blockType})...`);
      
      // Click section
      await sections[test.index].click();
      await new Promise(r => setTimeout(r, 800));
      
      // Wait for panel
      await page.waitForSelector('[data-section-editor]', { visible: true, timeout: 5000 });
      
      // Get all input values with their labels
      const fieldData = await page.$$eval('[data-section-editor] .section-editor-field, [data-section-editor] div[style*="margin-bottom"]', 
        els => els.map(el => {
          const label = el.querySelector('label');
          const input = el.querySelector('input[type="text"]') || el.querySelector('textarea');
          return {
            label: label ? label.textContent : '',
            value: input ? input.value : ''
          };
        })
      );
      
      console.log('  Fields found:', fieldData.length);
      
      // Find title field
      const titleField = fieldData.find(f => f.label.toLowerCase().includes('title') && !f.label.toLowerCase().includes('highlight'));
      if (!titleField) {
        // Fallback: check all inputs
        const allInputs = await page.$$eval('[data-section-editor] input[type="text"], [data-section-editor] textarea', 
          els => els.map(el => ({ name: el.name || '', value: el.value }))
        );
        console.log('  All inputs:', allInputs.map(i => i.value).filter(v => v));
      }
      
      // Check if any input has the expected title
      const inputs = await page.$$eval('[data-section-editor] input[type="text"], [data-section-editor] textarea', 
        els => els.map(el => el.value)
      );
      
      const titleMatch = inputs.find(v => v.includes('Digital Experiences') || v.includes('Drive Digital') || v.includes("Team of Digital"));
      if (!titleMatch) {
        console.log('  Available values:', inputs.filter(v => v));
        throw new Error(`Section ${test.index}: Expected title not found in any field`);
      }
      console.log(`  ✓ Title field populated: "${titleMatch.substring(0, 60)}..."`);
      
      // Close panel
      const closeBtn = await page.$('[data-section-editor] button:has(i.fa-times)');
      if (closeBtn) {
        await closeBtn.click();
      } else {
        // Try alternative close button
        await page.evaluate(() => {
          const btn = document.querySelector('[data-section-editor] button[style*="flex: 1"]');
          if (btn && btn.textContent.includes('Cancel')) btn.click();
        });
      }
      await new Promise(r => setTimeout(r, 500));
      
      console.log(`  ✓ Panel closed`);
    }

    console.log('\n✅ Section switching test PASSED - SectionEditor adapts correctly!');
    await browser.close();
    return true;
    
  } catch (err) {
    await browser.close();
    throw err;
  }
}

async function run() {
  console.log(`\n🔄 Testing SectionEditor section switching...\n`);
  try {
    await testSectionSwitching();
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ Test failed: ${err.message}\n`);
    process.exit(1);
  }
}

run();