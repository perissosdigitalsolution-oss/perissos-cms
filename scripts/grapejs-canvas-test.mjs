import puppeteer from 'puppeteer';

const SCREENSHOT_DIR = '/tmp/grapejs-test';

const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222' });
const pages = await browser.pages();
const page = pages.find(p => p.url().includes('localhost:3001')) || pages[0];

// Hard reload
await page.goto('http://localhost:3001/?edit=true', { waitUntil: 'networkidle2', timeout: 30000 });
await page.reload({ waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 3000));

// Check for panels BEFORE clicking Page Builder
const preCheck = await page.evaluate(() => {
  return {
    hasEditBar: !!document.querySelector('[style*="z-index: 20000"]'),
    buttons: Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim()).filter(Boolean).slice(0, 10),
  };
});
console.log('Pre-check:', JSON.stringify(preCheck, null, 2));

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

// Wait longer for full load
await new Promise(r => setTimeout(r, 15000));

await page.screenshot({ path: `${SCREENSHOT_DIR}/18-with-panels.png`, fullPage: false });
console.log('Screenshot 18 saved');

// Check panels
const panelCheck = await page.evaluate(() => {
  const results = {};
  for (const sel of ['.gjs-panels-left', '.gjs-panels-right', '.gjs-bm-c', '.gjs-blocks-c', '.gjs-sm-c', '.gjs-layers-c', '.gjs-clm-tags', '.gjs-editor']) {
    const el = document.querySelector(sel);
    if (el) {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      results[sel] = {
        display: s.display,
        visibility: s.visibility,
        rectW: Math.round(r.width),
        rectH: Math.round(r.height),
        rectT: Math.round(r.top),
        rectL: Math.round(r.left),
        childCount: el.children.length,
      };
    } else {
      results[sel] = 'NOT FOUND';
    }
  }
  return results;
});
console.log('Panel check:', JSON.stringify(panelCheck, null, 2));

await browser.disconnect();
