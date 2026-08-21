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

// === TEST 1: Check current template CSS loading ===
console.log('=== TEST 1: Dynamic CSS loading ===');
await page.goto('http://localhost:3001/', { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 3000));

const cssState = await page.evaluate(() => {
  const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  const cssLinks = links.filter(l => l.href.includes('/styles/')).map(l => ({
    href: l.href,
    id: l.id,
  }));
  return {
    bodyClass: document.body.className,
    cssLinks,
    templateCssLink: document.getElementById('template-css')?.getAttribute('href'),
  };
});
console.log('Body class:', cssState.bodyClass);
console.log('Template CSS link:', cssState.templateCssLink);
console.log('CSS links:', JSON.stringify(cssState.cssLinks, null, 2));

// Screenshot current state
await page.screenshot({ path: `${SCREENSHOT_DIR}/90-current-template.png` });
console.log('Screenshot 90: current template');

// === TEST 2: Check what template is active in the DB ===
const dbState = await page.evaluate(async () => {
  const res = await fetch('http://localhost:3000/api/templates?depth=1', { credentials: 'include' });
  const data = await res.json();
  return data.docs?.map(t => ({
    id: t.id,
    name: t.name,
    category: t.category,
    isActive: t.isActive,
  }));
});
console.log('\n=== DB Templates ===');
for (const t of dbState || []) {
  console.log(`  ${t.name} (${t.category}) - active: ${t.isActive}`);
}

// === TEST 3: Check home page state ===
const homeState = await page.evaluate(async () => {
  const res = await fetch('http://localhost:3000/api/pages?where[slug][equals]=home&depth=1', { credentials: 'include' });
  const data = await res.json();
  const doc = data.docs?.[0];
  return {
    hasRenderedHtml: !!doc?.renderedHtml,
    renderedHtmlLength: doc?.renderedHtml?.length || 0,
    sectionCount: doc?.sections?.length || 0,
    templateCategory: doc?.template?.category || doc?.template,
    hasProjectData: !!doc?.projectData,
  };
});
console.log('\n=== Home Page ===');
console.log(JSON.stringify(homeState, null, 2));

await browser.disconnect();
console.log('\nDone.');
