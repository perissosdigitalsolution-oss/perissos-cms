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

// Open Page Builder
const btns = await page.$$('button');
for (const btn of btns) {
  const text = await btn.evaluate(el => el.textContent?.trim());
  if (text?.includes('Page Builder')) { await btn.click(); break; }
}
await new Promise(r => setTimeout(r, 15000));

// === STEP 1: Check what elements exist in the iframe ===
const iframe = await page.$('iframe.gjs-frame');
const iframeFrame = await iframe.contentFrame();

const elements = await iframeFrame.evaluate(() => {
  const result = [];
  const all = document.querySelectorAll('h1, h2, h3, p, a, span, div');
  for (const el of all) {
    if (el.textContent?.trim().length > 5 && el.textContent?.trim().length < 100) {
      result.push({
        tag: el.tagName,
        text: el.textContent.trim().substring(0, 80),
        classes: el.className,
        id: el.id,
      });
    }
    if (result.length > 30) break;
  }
  return result;
});
console.log('=== Elements in iframe ===');
for (const el of elements.slice(0, 20)) {
  console.log(`  <${el.tag}> class="${el.classes}" id="${el.id}" → "${el.text}"`);
}

// === STEP 2: Click directly on a text element to select it ===
console.log('\n=== Clicking on "RESTORA" heading ===');
const restoraEl = await iframeFrame.$('h1');
if (restoraEl) {
  const box = await restoraEl.boundingBox();
  console.log('h1 bounding box:', JSON.stringify(box));
  if (box) {
    // Single click to select (not double-click which enters text edit)
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: `${SCREENSHOT_DIR}/52-selected.png` });
    console.log('Screenshot 52: after single click on h1');
  }
} else {
  console.log('No h1 found in iframe');
}

// === STEP 3: Try clicking on "WHERE EVERY MEAL BECOMES A MEMORY" ===
console.log('\n=== Looking for hero subtitle ===');
const heroSubtitle = await iframeFrame.evaluate(() => {
  const all = document.querySelectorAll('p, h2, h3, span');
  for (const el of all) {
    if (el.textContent?.includes('WHERE EVERY MEAL')) {
      const rect = el.getBoundingClientRect();
      return { tag: el.tagName, text: el.textContent.trim().substring(0, 80), x: rect.x, y: rect.y, w: rect.width, h: rect.height };
    }
  }
  return null;
});
console.log('Hero subtitle:', JSON.stringify(heroSubtitle));

if (heroSubtitle) {
  await page.mouse.click(heroSubtitle.x + heroSubtitle.w / 2, heroSubtitle.y + heroSubtitle.h / 2);
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/53-subtitle-selected.png` });
  console.log('Screenshot 53: subtitle selected');

  // Double-click to enter edit mode
  await page.mouse.click(heroSubtitle.x + heroSubtitle.w / 2, heroSubtitle.y + heroSubtitle.h / 2, { clickCount: 2 });
  await new Promise(r => setTimeout(r, 1000));

  // Check if we're in edit mode (contenteditable)
  const isEditable = await iframeFrame.evaluate(() => {
    const active = document.activeElement;
    return active?.getAttribute('contenteditable') || active?.tagName;
  });
  console.log('Active element after double-click:', isEditable);

  if (isEditable === 'true' || isEditable === 'CONTENTEDITABLE') {
    // Select all and type
    await page.keyboard.down('Control');
    await page.keyboard.press('a');
    await page.keyboard.up('Control');
    await new Promise(r => setTimeout(r, 300));
    await page.keyboard.type('FINEST DINING EXPERIENCE');
    console.log('Typed new text');
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: `${SCREENSHOT_DIR}/54-edited.png` });
    console.log('Screenshot 54: after edit');
  } else {
    // Try triple-click to select all text
    await page.mouse.click(heroSubtitle.x + heroSubtitle.w / 2, heroSubtitle.y + heroSubtitle.h / 2, { clickCount: 3 });
    await new Promise(r => setTimeout(r, 500));
    await page.keyboard.type('FINEST DINING EXPERIENCE');
    console.log('Triple-click edit');
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: `${SCREENSHOT_DIR}/54-edited.png` });
  }
}

// === STEP 4: Intercept network and save ===
let patchCaptured = false;
page.on('request', (req) => {
  if (req.url().includes('/api/pages/') && req.method() === 'PATCH') {
    const body = JSON.parse(req.postData() || '{}');
    console.log('\n=== PATCH CAPTURED ===');
    console.log('URL:', req.url());
    console.log('renderedHtml length:', body.renderedHtml?.length || 0);
    console.log('Has <style>:', body.renderedHtml?.includes('<style>') || false);
    console.log('Has original CSS:', body.renderedHtml?.includes('r-font-primary') || body.renderedHtml?.includes('Marcellus') || false);
    console.log('Has edit text:', body.renderedHtml?.includes('FINEST DINING') || false);
    patchCaptured = true;
  }
});

// Click the GrapeJS Save button specifically (look for exact match "Save" without "Changes")
console.log('\n=== Clicking GrapeJS Save button ===');
const grapejsSaveBtn = await page.$('button[style*="font-weight: 600"]');
// More precise: find button inside the page builder toolbar
const saveClicked = await page.evaluate(() => {
  const buttons = document.querySelectorAll('button');
  for (const btn of buttons) {
    const text = btn.textContent?.trim();
    // Match "Save" exactly (not "Save Changes" or "Saving...")
    if (text === 'Save') {
      btn.click();
      return true;
    }
  }
  return false;
});
console.log('GrapeJS Save button found and clicked:', saveClicked);

await new Promise(r => setTimeout(r, 5000));

if (!patchCaptured) {
  console.log('\nNo PATCH captured. Trying direct save via handleSave...');
  // Try triggering save via React internals
  const saveTriggered = await page.evaluate(() => {
    // Find the Page Builder header's Save button by looking at the orange button
    const btns = document.querySelectorAll('button');
    for (const btn of btns) {
      const style = btn.getAttribute('style') || '';
      const text = btn.textContent?.trim();
      if (text === 'Save' && style.includes('#FF6600')) {
        btn.click();
        return 'clicked orange Save button';
      }
    }
    return 'no button found';
  });
  console.log('Save trigger result:', saveTriggered);
  await new Promise(r => setTimeout(r, 5000));
}

await page.screenshot({ path: `${SCREENSHOT_DIR}/55-after-save.png` });
console.log('Screenshot 55: after save attempt');

// === STEP 5: Close and check frontend ===
const closeClicked = await page.evaluate(() => {
  const btns = document.querySelectorAll('button');
  for (const btn of btns) {
    const text = btn.textContent?.trim();
    if (text === 'Close') { btn.click(); return true; }
  }
  return false;
});
console.log('Close clicked:', closeClicked);
await new Promise(r => setTimeout(r, 2000));

await page.goto('http://localhost:3001/', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 3000));
await page.screenshot({ path: `${SCREENSHOT_DIR}/56-frontend-after-save.png` });
console.log('\nScreenshot 56: frontend after save');

// Check DB
const dbCheck = await page.evaluate(async () => {
  const res = await fetch('http://localhost:3000/api/pages?where[slug][equals]=home&depth=0', { credentials: 'include' });
  const data = await res.json();
  const doc = data.docs?.[0];
  return {
    renderedHtmlLength: doc?.renderedHtml?.length || 0,
    hasFinestDining: doc?.renderedHtml?.includes('FINEST DINING') || false,
    hasOriginalCss: doc?.renderedHtml?.includes('Marcellus') || doc?.renderedHtml?.includes('r-font-primary') || false,
  };
});
console.log('\n=== DB state ===');
console.log(JSON.stringify(dbCheck, null, 2));

await browser.disconnect();
console.log('\nDone.');
