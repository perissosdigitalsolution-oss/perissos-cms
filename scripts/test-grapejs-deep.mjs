import puppeteer from 'puppeteer';

const FRONTEND_URL = 'http://localhost:3001';
const BACKEND_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = '/tmp/grapejs-test';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const fs = await import('fs');
  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
    defaultViewport: { width: 1920, height: 1080 },
  });

  const page = await browser.newPage();
  
  const errors = [];
  const networkFails = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(`PAGE_ERROR: ${err.message}`));
  page.on('requestfailed', req => networkFails.push(`${req.method()} ${req.url()} — ${req.failure()?.errorText}`));

  // Login
  console.log('1. Setting auth cookie...');
  const loginRes = await (await fetch(BACKEND_URL + '/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@perissos.dev', password: 'Admin123!@#' }),
  })).json();
  await page.setCookie({ name: 'payload-token', value: loginRes.token, domain: 'localhost', path: '/' });

  console.log('2. Opening frontend...');
  await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(3000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/10-frontend.png` });

  // Click Page Builder
  console.log('3. Opening Page Builder...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Page Builder'));
    if (btn) btn.click();
  });
  await sleep(8000); // Give GrapeJS time to fully init
  await page.screenshot({ path: `${SCREENSHOT_DIR}/11-page-builder.png` });

  // Deep iframe inspection
  console.log('4. Deep iframe inspection...');
  const iframeData = await page.evaluate(() => {
    const iframes = document.querySelectorAll('iframe');
    const results = [];
    
    for (let i = 0; i < iframes.length; i++) {
      const iframe = iframes[i];
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) {
          results.push({ index: i, error: 'cross-origin or no access', src: iframe.src?.substring(0, 100) });
          continue;
        }
        
        const bodyHTML = doc.body?.innerHTML || '';
        const headHTML = doc.head?.innerHTML || '';
        const styles = doc.querySelectorAll('style');
        const links = doc.querySelectorAll('link[rel="stylesheet"]');
        const computedBg = doc.body ? window.getComputedStyle(doc.body).backgroundColor : 'n/a';
        
        results.push({
          index: i,
          src: iframe.src?.substring(0, 100) || '(empty)',
          bodyLength: bodyHTML.length,
          bodyPreview: bodyHTML.substring(0, 500),
          headLength: headHTML.length,
          headPreview: headHTML.substring(0, 500),
          styleTagCount: styles.length,
          styleContents: Array.from(styles).map(s => ({
            id: s.id,
            length: s.textContent?.length || 0,
            preview: s.textContent?.substring(0, 200),
          })),
          linkCount: links.length,
          links: Array.from(links).map(l => l.href),
          bodyBg: computedBg,
          bodyClasses: doc.body?.className,
        });
      } catch (e) {
        results.push({ index: i, error: e.message });
      }
    }
    return results;
  });

  console.log('\n=== IFRAME ANALYSIS ===');
  for (const iframe of iframeData) {
    console.log(`\n--- Iframe #${iframe.index} ---`);
    console.log(JSON.stringify(iframe, null, 2));
  }

  // Check if DOMPurify stripped everything
  console.log('\n5. Checking DOMPurify behavior...');
  const dompurifyCheck = await page.evaluate(() => {
    // Check if there are any grapejs-specific elements
    const gjsElements = document.querySelectorAll('[class*="gjs-"]');
    const gjsClasses = new Set();
    gjsElements.forEach(el => {
      el.className.split(/\s+/).forEach(c => {
        if (c.startsWith('gjs-')) gjsClasses.add(c);
      });
    });
    return {
      gjsElementCount: gjsElements.length,
      gjsClasses: Array.from(gjsClasses).sort(),
    };
  });
  console.log('GrapeJS classes found:', JSON.stringify(dompurifyCheck, null, 2));

  // Check network failures
  console.log('\n6. Network failures:');
  if (networkFails.length === 0) {
    console.log('   ✓ No network failures');
  } else {
    networkFails.forEach(f => console.log(`   ✗ ${f}`));
  }

  // Check console errors
  console.log('\n7. Console errors:');
  if (errors.length === 0) {
    console.log('   ✓ No errors');
  } else {
    errors.forEach(e => console.log(`   ✗ ${e.substring(0, 200)}`));
  }

  await page.screenshot({ path: `${SCREENSHOT_DIR}/12-final.png` });
  console.log(`\nScreenshots: ${SCREENSHOT_DIR}/`);
  await browser.close();
}

main().catch(e => { console.error('Failed:', e.message); process.exit(1); });
