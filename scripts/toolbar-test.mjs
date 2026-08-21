import puppeteer from 'puppeteer';

const SCREENSHOT_DIR = '/tmp/grapejs-test';
const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222' });
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });

const consoleLogs = [];
page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));

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

// Open Page Builder
const btns = await page.$$('button');
for (const btn of btns) {
  const text = await btn.evaluate(el => el.textContent?.trim());
  if (text?.includes('Page Builder')) { await btn.click(); break; }
}
await new Promise(r => setTimeout(r, 15000));

// Open AI Design
await page.evaluate(() => {
  const btns = document.querySelectorAll('button');
  for (const btn of btns) {
    if (btn.textContent?.includes('AI Design')) { btn.click(); return; }
  }
});
await new Promise(r => setTimeout(r, 1000));

// Type and send
const textarea = await page.$('textarea[placeholder*="Describe"]');
if (textarea) {
  await textarea.type('Create a pricing table', { delay: 20 });
  await new Promise(r => setTimeout(r, 500));
  
  await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    for (const btn of btns) {
      if (btn.querySelector('.fa-paper-plane')) { btn.click(); return; }
    }
  });
  console.log('Sent prompt, waiting...');
  await new Promise(r => setTimeout(r, 8000));
  
  // Print AI logs
  console.log('\n=== AI Design logs ===');
  for (const log of consoleLogs) {
    if (log.includes('[AI Design]')) console.log(log);
  }
  
  await page.screenshot({ path: `${SCREENSHOT_DIR}/85-ai-fixed.png` });
  console.log('\nScreenshot 85: AI after fix');
  
  // Scroll canvas to bottom
  const iframe = await page.$('iframe.gjs-frame');
  if (iframe) {
    const frame = await iframe.contentFrame();
    if (frame) {
      await frame.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await new Promise(r => setTimeout(r, 1000));
      await page.screenshot({ path: `${SCREENSHOT_DIR}/86-ai-canvas-bottom.png` });
      console.log('Screenshot 86: canvas bottom');
    }
  }
}

await browser.disconnect();
console.log('\nDone.');
