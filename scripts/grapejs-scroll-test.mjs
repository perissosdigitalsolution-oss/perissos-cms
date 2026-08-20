import puppeteer from 'puppeteer';

const SCREENSHOT_DIR = '/tmp/grapejs-test';
const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222' });
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });

// Login
await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 2000));
if (page.url().includes('login')) {
  await page.type('input[type="email"], #email', 'admin@perissos.dev');
  await page.type('input[type="password"], #password', 'Admin123!@#');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 5000));
}

// Frontend
await page.goto('http://localhost:3001/?edit=true', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 4000));

// Page Builder
const btns = await page.$$('button');
for (const btn of btns) {
  const text = await btn.evaluate(el => el.textContent?.trim());
  if (text?.includes('Page Builder')) { await btn.click(); break; }
}
await new Promise(r => setTimeout(r, 15000));

// Helper: scroll iframe body to a position
async function scrollTo(y) {
  await page.evaluate((scrollY) => {
    const iframe = document.querySelector('iframe.gjs-frame');
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;
    doc.body.scrollTop = scrollY;
    doc.documentElement.scrollTop = scrollY;
  }, y);
  await new Promise(r => setTimeout(r, 500));
}

// Helper: get section positions inside the iframe
const sections = await page.evaluate(() => {
  const iframe = document.querySelector('iframe.gjs-frame');
  if (!iframe) return [];
  const doc = iframe.contentDocument;
  if (!doc) return [];
  
  const sections = doc.querySelectorAll('section, header, footer, .footer');
  return Array.from(sections).map(s => ({
    tag: s.tagName,
    class: s.className?.substring(0, 50),
    top: s.getBoundingClientRect().top + doc.body.scrollTop,
    height: s.offsetHeight,
  }));
});
console.log('Sections found:', JSON.stringify(sections, null, 2));

// Screenshot at top (0px)
await scrollTo(0);
await page.screenshot({ path: `${SCREENSHOT_DIR}/30-scroll-0.png` });
console.log('Screenshot 30: 0px (header/hero)');

// Screenshot at menu highlights (~2000px)
await scrollTo(2000);
await page.screenshot({ path: `${SCREENSHOT_DIR}/31-scroll-2000.png` });
console.log('Screenshot 31: 2000px');

// Screenshot at gallery (~5000px)
await scrollTo(5000);
await page.screenshot({ path: `${SCREENSHOT_DIR}/32-scroll-5000.png` });
console.log('Screenshot 32: 5000px');

// Screenshot at testimonials (~7000px)
await scrollTo(7000);
await page.screenshot({ path: `${SCREENSHOT_DIR}/33-scroll-7000.png` });
console.log('Screenshot 33: 7000px');

// Screenshot at footer (~9000px)
await scrollTo(9000);
await page.screenshot({ path: `${SCREENSHOT_DIR}/34-scroll-9000.png` });
console.log('Screenshot 34: 9000px (footer)');

await browser.disconnect();
console.log('\nDone.');
