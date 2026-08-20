#!/usr/bin/env node

/**
 * Marketplace E2E Test Script (ESM) — v2
 * Tests the full marketplace flow using Puppeteer
 */

import puppeteer from 'puppeteer';
import { mkdirSync } from 'fs';

const BASE_URL = 'http://localhost:3000';
const DIR = '/tmp/marketplace-test';
mkdirSync(DIR, { recursive: true });

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function runTests() {
  console.log('🧪 Marketplace E2E Tests\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const results = [];

  try {
    // ── TEST 1: Login page ──
    console.log('TEST 1: Login page loads');
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(5000); // React hydration
    const emailInput = await page.$('#field-email, input[type="email"]');
    console.log(`  Login form: ${emailInput ? '✅' : '❌'}`);
    results.push({ test: 'Login page loads', pass: !!emailInput });

    // ── TEST 2: Login ──
    console.log('\nTEST 2: Login with admin credentials');
    if (emailInput) {
      await emailInput.click({ clickCount: 3 });
      await emailInput.type('admin@perissos.dev');
      const passInput = await page.$('#field-password, input[type="password"]');
      await passInput.click({ clickCount: 3 });
      await passInput.type('Admin123!@#');
      await sleep(300);
      await page.screenshot({ path: `${DIR}/02-creds.png`, fullPage: true });
      const submitBtn = await page.$('button[type="submit"]');
      await submitBtn.click();
      await sleep(5000); // Wait for redirect
      const url = page.url();
      const ok = url.includes('/admin') && !url.includes('login');
      console.log(`  After login: ${url}`);
      console.log(`  Login: ${ok ? '✅' : '❌'}`);
      results.push({ test: 'Login', pass: ok });
    } else {
      results.push({ test: 'Login', pass: false });
    }

    // ── TEST 3: Dashboard ──
    console.log('\nTEST 3: Dashboard content');
    await sleep(2000);
    await page.screenshot({ path: `${DIR}/03-dashboard.png`, fullPage: true });
    const dashHtml = await page.content();
    const hasMarketplace = dashHtml.includes('Marketplace') && dashHtml.includes('Browse Templates');
    console.log(`  Marketplace card: ${hasMarketplace ? '✅' : '❌'}`);
    results.push({ test: 'Dashboard card', pass: hasMarketplace });

    // ── TEST 4: Marketplace view ──
    console.log('\nTEST 4: Navigate to marketplace');
    await page.goto(`${BASE_URL}/admin/collections/templates/marketplace`, {
      waitUntil: 'networkidle2', timeout: 30000,
    });
    await sleep(5000);
    await page.screenshot({ path: `${DIR}/04-marketplace.png`, fullPage: true });
    const mpUrl = page.url();
    const mpHtml = await page.content();
    const mpOk = mpUrl.includes('templates/marketplace') && !mpUrl.includes('login');
    const hasTemplates = mpHtml.includes('Digital Agency') || mpHtml.includes('Food Express') || mpHtml.includes('Optica');
    console.log(`  URL: ${mpUrl}`);
    console.log(`  Page loaded: ${mpOk ? '✅' : '❌'}`);
    console.log(`  Templates visible: ${hasTemplates ? '✅' : '❌'}`);
    results.push({ test: 'Marketplace page', pass: mpOk });
    results.push({ test: 'Templates visible', pass: hasTemplates });

    // ── TEST 5: API — templates ──
    console.log('\nTEST 5: GET /api/marketplace/templates');
    const apiPage = await browser.newPage();
    await apiPage.goto(`${BASE_URL}/api/marketplace/templates`);
    await sleep(1000);
    const apiText = await apiPage.evaluate(() => document.body.innerText);
    const apiData = JSON.parse(apiText);
    const count = apiData.docs?.length || 0;
    console.log(`  Templates: ${count}`);
    console.log(`  Names: ${apiData.docs?.map(d => d.name).join(', ')}`);
    console.log(`  API: ${count >= 3 ? '✅' : '❌'}`);
    results.push({ test: 'API templates', pass: count >= 3 });
    await apiPage.close();

    // ── TEST 6: API — categories ──
    console.log('\nTEST 6: GET /api/marketplace/categories');
    const catPage = await browser.newPage();
    await catPage.goto(`${BASE_URL}/api/marketplace/categories`);
    await sleep(1000);
    const catText = await catPage.evaluate(() => document.body.innerText);
    const catData = JSON.parse(catText);
    console.log(`  Categories: ${catData.categories?.join(', ')}`);
    console.log(`  API: ${catData.categories?.length >= 3 ? '✅' : '❌'}`);
    results.push({ test: 'API categories', pass: (catData.categories?.length || 0) >= 3 });
    await catPage.close();

    // ── TEST 7: Templates collection ──
    console.log('\nTEST 7: Templates collection');
    await page.goto(`${BASE_URL}/admin/collections/templates`, {
      waitUntil: 'networkidle2', timeout: 30000,
    });
    await sleep(3000);
    await page.screenshot({ path: `${DIR}/05-templates.png`, fullPage: true });
    const tUrl = page.url();
    const tHtml = await page.content();
    const tOk = tUrl.includes('templates') && !tUrl.includes('login');
    const hasInstalledTab = tHtml.includes('Installed') || tHtml.includes('Marketplace');
    console.log(`  URL: ${tUrl}`);
    console.log(`  Page loaded: ${tOk ? '✅' : '❌'}`);
    console.log(`  Tabs present: ${hasInstalledTab ? '✅' : '❌'}`);
    results.push({ test: 'Templates collection', pass: tOk });

    // ── TEST 8: Marketplace Templates collection ──
    console.log('\nTEST 8: Marketplace Templates collection');
    await page.goto(`${BASE_URL}/admin/collections/marketplace-templates`, {
      waitUntil: 'networkidle2', timeout: 30000,
    });
    await sleep(3000);
    await page.screenshot({ path: `${DIR}/06-marketplace-collection.png`, fullPage: true });
    const mtUrl = page.url();
    const mtHtml = await page.content();
    const mtOk = !mtUrl.includes('login');
    const hasEntries = mtHtml.includes('Digital Agency') || mtHtml.includes('Food Express');
    console.log(`  URL: ${mtUrl}`);
    console.log(`  Page loaded: ${mtOk ? '✅' : '❌'}`);
    console.log(`  Entries visible: ${hasEntries ? '✅' : '❌'}`);
    results.push({ test: 'Marketplace collection', pass: mtOk && hasEntries });

    // ── TEST 9: Sidebar ──
    console.log('\nTEST 9: Sidebar');
    const sideHtml = await page.content();
    const hasMarketplaceLink = sideHtml.includes('Marketplace Templates');
    const hasTemplatesLink = sideHtml.includes('Templates');
    console.log(`  Templates link: ${hasTemplatesLink ? '✅' : '❌'}`);
    console.log(`  Marketplace link: ${hasMarketplaceLink ? '✅' : '❌'}`);
    results.push({ test: 'Sidebar nav', pass: hasTemplatesLink && hasMarketplaceLink });

    // ── TEST 10: Health ──
    console.log('\nTEST 10: Health');
    const hPage = await browser.newPage();
    await hPage.goto(`${BASE_URL}/api/health`);
    await sleep(500);
    const hText = await hPage.evaluate(() => document.body.innerText);
    const hOk = hText.includes('ok');
    console.log(`  Health: ${hOk ? '✅' : '❌'}`);
    results.push({ test: 'Health endpoint', pass: hOk });
    await hPage.close();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }

  // ── Summary ──
  console.log('\n' + '═'.repeat(50));
  console.log('RESULTS');
  console.log('═'.repeat(50));
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  for (const r of results) console.log(`  ${r.pass ? '✅' : '❌'} ${r.test}`);
  console.log(`\n  Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log(failed === 0 ? '  🎉 ALL PASSED' : `  ⚠️  ${failed} FAILED`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
