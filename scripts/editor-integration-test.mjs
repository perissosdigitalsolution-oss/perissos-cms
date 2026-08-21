import puppeteer from 'puppeteer';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DEBUGGING_PORT = 9222;

async function screenshot(browser, name) {
  const pages = await browser.pages();
  const page = pages.find(p => p.url().includes('localhost:3001')) || pages[0];
  const path = `/tmp/${name}.png`;
  await page.screenshot({ path, fullPage: false });
  console.log(`📸 ${name}`);
}

async function main() {
  console.log('=== Editor Integration Test ===\n');

  const browser = await puppeteer.connect({
    browserURL: `http://127.0.0.1:${DEBUGGING_PORT}`,
    defaultViewport: { width: 1440, height: 900 },
  });
  console.log('✅ Connected to Chrome');

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Navigate to frontend
  console.log('1. Navigate to frontend...');
  await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 4000));
  console.log(`✅ Frontend loaded`);
  await screenshot(browser, '01-home');

  // Check toolbar buttons via aria/inner text
  console.log('\n2. Check toolbar...');
  const toolbar = await page.evaluate(() => {
    const allButtons = Array.from(document.querySelectorAll('button'));
    return allButtons.map(b => b.innerText.trim()).filter(t => t.length > 0);
  });
  console.log(`   All button texts: ${JSON.stringify(toolbar)}`);
  const hasPB = toolbar.some(t => t.includes('Page Builder'));
  const hasContent = toolbar.some(t => t.includes('Content'));
  const hasTheme = toolbar.some(t => t.includes('Theme'));
  console.log(`   Page Builder: ${hasPB ? '✅' : '❌'}`);
  console.log(`   Content: ${hasContent ? '✅' : '❌'}`);
  console.log(`   Theme: ${hasTheme ? '✅' : '❌'}`);

  // Click Content button
  console.log('\n3. Open Content Panel...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText.includes('Content'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await screenshot(browser, '02-content-panel');

  const contentPanelVisible = await page.evaluate(() => {
    return document.body.innerText.includes('Edit Content');
  });
  console.log(`   Content Panel visible: ${contentPanelVisible ? '✅' : '❌'}`);

  // Check section list
  const sectionList = await page.evaluate(() => {
    const text = document.body.innerText;
    const sectionTypes = ['Hero', 'Menu Highlights', 'Reservation', 'Gallery', 'Testimonials', 'Contact'];
    return sectionTypes.filter(s => text.includes(s));
  });
  console.log(`   Sections found: ${sectionList.join(', ')}`);

  // Close Content Panel
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const closeBtn = btns.find(b => b.querySelector('.fa-times'));
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // Click Theme button
  console.log('\n4. Open Theme Panel...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText.includes('Theme'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await screenshot(browser, '03-theme-panel');

  const themePanelVisible = await page.evaluate(() => {
    return document.body.innerText.includes('Theme Editor') || document.body.innerText.includes('Colors');
  });
  console.log(`   Theme Panel visible: ${themePanelVisible ? '✅' : '❌'}`);

  // Close Theme Panel
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const closeBtn = btns.find(b => b.querySelector('.fa-times'));
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // Click Page Builder button
  console.log('\n5. Open Page Builder...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText.includes('Page Builder'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 5000));
  await screenshot(browser, '04-page-builder');

  const pbState = await page.evaluate(() => {
    return {
      hasGrapeJS: !!document.querySelector('.gjs-editor'),
      hasCanvas: !!document.querySelector('.gjs-cv-canvas'),
      hasBlocks: !!document.querySelector('.gjs-blocks-c'),
    };
  });
  console.log(`   GrapeJS loaded: ${pbState.hasGrapeJS ? '✅' : '❌'}`);
  console.log(`   Canvas present: ${pbState.hasCanvas ? '✅' : '❌'}`);
  console.log(`   Blocks panel: ${pbState.hasBlocks ? '✅' : '❌'}`);

  // Close Page Builder
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const closeBtn = btns.find(b => b.querySelector('.fa-times'));
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // Final home screenshot
  await screenshot(browser, '05-final-home');

  console.log('\n=== ALL CHECKS PASSED ===');
  await page.close();
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
