#!/usr/bin/env node
/**
 * Test: Hero mainImage field - set image URL and verify
 */

import puppeteer from 'puppeteer';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
const BACKOFFICE_URL = process.env.BACKOFFICE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@perissos.dev';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!@#';

const TEST_IMAGE_URL = 'https://cdn.prod.website-files.com/6877e02f5387b6bdd6d338ec/687809ff2e58f4023f2a0ba4_Banner%20Image.png';

async function testHeroImage() {
  const browser = await puppeteer.launch({ 
    headless: true,
    defaultViewport: { width: 1400, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('[BROWSER ERROR]', msg.text());
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
    console.log('✅ SectionEditor opened');

    // Find Main Image input and set the URL
    console.log('\n🎨 Setting Main Image URL...');
    const mainImageInput = await page.$('[data-section-editor] input[placeholder="Image URL"]') || 
                           await page.$('[data-section-editor] input[placeholder="Image URL (optional, replaces icon)"]');
    
    if (!mainImageInput) {
      // Try finding by label
      const inputs = await page.$$('[data-section-editor] input[type="text"]');
      for (const input of inputs) {
        const label = await input.evaluate(el => {
          const parent = el.closest('div')
          const l = parent?.querySelector('label')
          return l?.textContent || ''
        })
        if (label.includes('Main Image')) {
          console.log('Found Main Image input')
          await input.click({ clickCount: 3 })
          await input.type(TEST_IMAGE_URL)
          break
        }
      }
    } else {
      await mainImageInput.click({ clickCount: 3 })
      await mainImageInput.type(TEST_IMAGE_URL)
    }
    
    await new Promise(r => setTimeout(r, 500))
    console.log('✅ Image URL entered')

    // Verify it's in the field
    const fieldValue = await page.evaluate(() => {
      const inputs = document.querySelectorAll('[data-section-editor] input[type="text"]')
      for (const input of inputs) {
        const parent = input.closest('div')
        const label = parent?.querySelector('label')?.textContent || ''
        if (label.includes('Main Image')) return input.value
      }
      return ''
    })
    console.log(`📋 Field value: "${fieldValue}"`)

    // Click Apply Changes
    console.log('\n💾 Clicking Apply Changes...')
    const buttons = await page.$$('[data-section-editor] button')
    for (const btn of buttons) {
      const text = await btn.evaluate(el => el.textContent)
      if (text?.includes('Apply')) {
        await btn.click()
        break
      }
    }
    await new Promise(r => setTimeout(r, 3000))
    console.log('✅ Apply Changes clicked')

    // Click Save Changes in toolbar
    console.log('\n💾 Clicking Save Changes in toolbar...')
    const toolbarButtons = await page.$$('button')
    for (const btn of toolbarButtons) {
      const text = await btn.evaluate(el => el.textContent)
      if (text?.includes('Save Changes')) {
        await btn.click()
        break
      }
    }
    await new Promise(r => setTimeout(r, 5000))
    console.log('✅ Save Changes clicked')

    // Reload and check if image persists
    console.log('\n🔄 Reloading page...')
    await page.reload({ waitUntil: 'networkidle0' })
    await new Promise(r => setTimeout(r, 3000))

    // Login again
    await page.goto(`${BACKOFFICE_URL}/admin/login`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('input[name="email"]', { timeout: 10000 });
    await page.type('input[name="email"]', ADMIN_EMAIL);
    await page.type('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 2000));

    // Check hero section for image
    console.log('\n🔍 Checking hero section for image...')
    const heroImage = await page.$('.hero-img-main img')
    if (heroImage) {
      const src = await heroImage.getAttribute('src')
      console.log(`✅ Hero image found! src: ${src}`)
    } else {
      console.log('❌ No hero image found')
      // Check what's in hero-img-main
      const heroImgMain = await page.$('.hero-img-main')
      if (heroImgMain) {
        const html = await heroImgMain.evaluate(el => el.innerHTML)
        console.log(`   hero-img-main content: ${html.substring(0, 200)}`)
      }
    }

    // Also check API
    const apiTheme = await page.evaluate(async () => {
      const res = await fetch('http://localhost:3000/api/pages?where%5Bslug%5D%5Bequals%5D=home&depth=1', {
        credentials: 'include'
      })
      return res.json()
    })
    console.log('\n📋 API sections[0].mainImage:', apiTheme.docs?.[0]?.sections?.[0]?.mainImage)

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

testHeroImage();