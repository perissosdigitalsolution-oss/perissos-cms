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

  // Login
  const loginRes = await (await fetch(BACKEND_URL + '/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@perissos.dev', password: 'Admin123!@#' }),
  })).json();
  await page.setCookie({ name: 'payload-token', value: loginRes.token, domain: 'localhost', path: '/' });

  await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(3000);

  // Open Page Builder
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Page Builder'));
    if (btn) btn.click();
  });
  await sleep(10000);

  // Deep analysis of the main canvas iframe (index 1)
  const analysis = await page.evaluate(() => {
    const iframes = document.querySelectorAll('iframe');
    const canvasIframe = iframes[1]; // Main GrapeJS canvas
    if (!canvasIframe) return { error: 'No canvas iframe' };
    
    const doc = canvasIframe.contentDocument;
    if (!doc) return { error: 'No document access' };
    
    const body = doc.body;
    if (!body) return { error: 'No body' };

    // 1. Check CSS custom properties on :root
    const rootStyles = doc.documentElement.style;
    const rootComputed = window.getComputedStyle(doc.documentElement);
    const cssVars = {};
    for (const sheet of doc.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.selectorText === ':root') {
            for (let i = 0; i < rule.style.length; i++) {
              const prop = rule.style[i];
              if (prop.startsWith('--')) {
                cssVars[prop] = rule.style.getPropertyValue(prop);
              }
            }
          }
        }
      } catch(e) {} // cross-origin sheets
    }

    // 2. Check first few elements and their computed styles
    const elements = [];
    const allElements = body.querySelectorAll('*');
    for (let i = 0; i < Math.min(allElements.length, 5); i++) {
      const el = allElements[i];
      const computed = window.getComputedStyle(el);
      elements.push({
        tag: el.tagName,
        id: el.id,
        classes: el.className?.substring?.(0, 100) || '',
        display: computed.display,
        backgroundColor: computed.backgroundColor,
        color: computed.color,
        padding: computed.padding,
        margin: computed.margin,
        width: computed.width,
        height: computed.height,
        position: computed.position,
        fontFamily: computed.fontFamily?.substring(0, 80),
        fontSize: computed.fontSize,
        backgroundImage: computed.backgroundImage?.substring(0, 100),
      });
    }

    // 3. Check wrapper element
    const wrapper = body.querySelector('[data-gjs-type="wrapper"]');
    let wrapperInfo = null;
    if (wrapper) {
      const wc = window.getComputedStyle(wrapper);
      wrapperInfo = {
        tag: wrapper.tagName,
        id: wrapper.id,
        classes: wrapper.className,
        display: wc.display,
        backgroundColor: wc.backgroundColor,
        minHeight: wc.minHeight,
        width: wc.width,
        height: wc.height,
        childCount: wrapper.children.length,
        innerHTML: wrapper.innerHTML.substring(0, 500),
      };
    }

    // 4. Check if header#masthead exists and its styles
    const header = doc.querySelector('#masthead') || doc.querySelector('header');
    let headerInfo = null;
    if (header) {
      const hc = window.getComputedStyle(header);
      headerInfo = {
        tag: header.tagName,
        id: header.id,
        classes: header.className?.substring(0, 200),
        display: hc.display,
        backgroundColor: hc.backgroundColor,
        color: hc.color,
        height: hc.height,
        position: hc.position,
        backgroundImage: hc.backgroundImage?.substring(0, 200),
      };
    }

    // 5. Check first section
    const section = doc.querySelector('section') || doc.querySelector('.section-heading');
    let sectionInfo = null;
    if (section) {
      const sc = window.getComputedStyle(section);
      sectionInfo = {
        tag: section.tagName,
        classes: section.className?.substring(0, 200),
        display: sc.display,
        backgroundColor: sc.backgroundColor,
        color: sc.color,
        padding: sc.padding,
        backgroundImage: sc.backgroundImage?.substring(0, 200),
      };
    }

    // 6. Count total elements and check if body has any visible content
    const bodyComputed = window.getComputedStyle(body);
    
    return {
      bodyInfo: {
        childCount: body.children.length,
        innerHTMLLength: body.innerHTML.length,
        backgroundColor: bodyComputed.backgroundColor,
        color: bodyComputed.color,
        overflow: bodyComputed.overflow,
      },
      cssVarsFound: Object.keys(cssVars).length,
      cssVarsSample: Object.entries(cssVars).slice(0, 10),
      wrapperInfo,
      headerInfo,
      sectionInfo,
      firstElements: elements,
      styleSheetCount: doc.styleSheets.length,
      totalElements: allElements.length,
    };
  });

  console.log('=== CANVAS IFRAME DEEP ANALYSIS ===');
  console.log(JSON.stringify(analysis, null, 2));

  await page.screenshot({ path: `${SCREENSHOT_DIR}/13-deep-analysis.png` });
  await browser.close();
}

main().catch(e => { console.error('Failed:', e.message); process.exit(1); });
