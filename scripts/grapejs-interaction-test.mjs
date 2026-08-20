import puppeteer from 'puppeteer';

const SCREENSHOT_DIR = '/tmp/grapejs-test';

const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222' });
const pages = await browser.pages();
const page = pages.find(p => p.url().includes('localhost:3001')) || pages[0];

// Hard reload
await page.goto('http://localhost:3001/?edit=true', { waitUntil: 'networkidle2', timeout: 30000 });
await page.reload({ waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 3000));

// Click Page Builder
const btns = await page.$$('button');
for (const btn of btns) {
  const text = await btn.evaluate(el => el.textContent?.trim());
  if (text?.includes('Page Builder')) {
    console.log('Clicking Page Builder');
    await btn.click();
    break;
  }
}
await new Promise(r => setTimeout(r, 10000));

// Get the iframe
const iframe = await page.$('iframe.gjs-frame');
if (!iframe) {
  console.log('ERROR: No iframe found');
  await browser.disconnect();
  process.exit(1);
}
const iframeFrame = await iframe.contentFrame();
if (!iframeFrame) {
  console.log('ERROR: Cannot access iframe content');
  await browser.disconnect();
  process.exit(1);
}

// 1. Test scrolling the canvas
console.log('\n=== Test 1: Scroll canvas ===');
await page.evaluate(() => {
  const canvas = document.querySelector('.gjs-cv-canvas');
  if (canvas) canvas.scrollTop = 0;
});
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: `${SCREENSHOT_DIR}/19-scroll-top.png`, fullPage: false });
console.log('Screenshot 19: top of page');

// 2. Test clicking an element in the canvas
console.log('\n=== Test 2: Click header element ===');
try {
  const header = await iframeFrame.$('header#masthead, header');
  if (header) {
    await header.click();
    console.log('Clicked header');
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: `${SCREENSHOT_DIR}/20-header-selected.png`, fullPage: false });
    console.log('Screenshot 20: header selected');
  } else {
    console.log('Header not found');
  }
} catch(e) {
  console.log('Click error:', e.message);
}

// 3. Check if style manager opened
console.log('\n=== Test 3: Style manager check ===');
const smCheck = await page.evaluate(() => {
  const smC = document.querySelector('.gjs-sm-c');
  const smSector = document.querySelector('.gjs-sm-sector__general');
  return {
    smC: smC ? { w: smC.offsetWidth, h: smC.offsetHeight, display: getComputedStyle(smC).display } : 'NOT FOUND',
    smSector: smSector ? { display: getComputedStyle(smSector).display } : 'NOT FOUND',
  };
});
console.log('Style manager:', JSON.stringify(smCheck));

// 4. Scroll to bottom of canvas
console.log('\n=== Test 4: Scroll to bottom ===');
await page.evaluate(() => {
  const canvas = document.querySelector('.gjs-cv-canvas');
  if (canvas) canvas.scrollTop = canvas.scrollHeight;
});
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: `${SCREENSHOT_DIR}/21-scroll-bottom.png`, fullPage: false });
console.log('Screenshot 21: bottom of page');

// 5. Test device switching
console.log('\n=== Test 5: Editor state ===');
const editorState = await page.evaluate(() => {
  const deviceBtns = document.querySelectorAll('.gjs-pn-devices-c .gjs-pn-btn');
  const activeDevice = document.querySelector('.gjs-pn-devices-c .gjs-pn-active');
  return {
    deviceCount: deviceBtns.length,
    activeDevice: activeDevice?.title || activeDevice?.getAttribute('title'),
    editorExists: !!document.querySelector('.gjs-editor'),
  };
});
console.log('Editor state:', JSON.stringify(editorState));

await browser.disconnect();
console.log('\nDone.');
