import puppeteer from 'puppeteer';

const FRONTEND_URL = 'http://localhost:3001';
const BACKEND_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = '/tmp/grapejs-test';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const fs = await import('fs');
  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080'],
    defaultViewport: { width: 1920, height: 1080 },
  });

  const page = await browser.newPage();
  
  // Collect console errors
  const errors = [];
  const consoleLogs = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', err => errors.push(err.message));

  console.log('1. Opening frontend...');
  await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/01-frontend-loaded.png`, fullPage: false });
  console.log('   ✓ Frontend loaded');

  // Check if we need to login first
  console.log('2. Logging in to backoffice for edit mode...');
  await page.goto(BACKEND_URL + '/api/users/login', { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  
  // Go back to frontend and set cookie
  await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(1000);

  // Set auth cookie for frontend
  await page.setCookie({
    name: 'payload-token',
    value: (await (await fetch(BACKEND_URL + '/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@perissos.dev', password: 'Admin123!@#' }),
    })).json()).token,
    domain: 'localhost',
    path: '/',
  });

  console.log('3. Reloading with auth...');
  await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(3000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/02-frontend-auth.png`, fullPage: false });

  // Check for edit toolbar / Page Builder button
  console.log('4. Looking for Page Builder button...');
  const pageBuilderBtn = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button, [role="button"], a'));
    for (const btn of btns) {
      if (btn.textContent?.includes('Page Builder') || btn.textContent?.includes('page builder')) {
        return { found: true, text: btn.textContent.trim(), tag: btn.tagName };
      }
    }
    // Also check for any fixed toolbar
    const toolbar = document.querySelector('[class*="toolbar"], [class*="Toolbar"]');
    return { found: false, toolbarPresent: !!toolbar, bodyClasses: document.body.className };
  });
  console.log('   Page Builder search:', JSON.stringify(pageBuilderBtn));

  // Click the Page Builder button if found
  if (pageBuilderBtn.found) {
    console.log('5. Clicking Page Builder...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, [role="button"], a'));
      const pbBtn = btns.find(b => b.textContent?.includes('Page Builder'));
      if (pbBtn) pbBtn.click();
    });
    await sleep(5000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/03-page-builder-opened.png`, fullPage: false });
    console.log('   ✓ Page Builder opened');
  } else {
    console.log('5. No Page Builder button found — trying to find EditToolbar...');
    // Maybe the toolbar is there but text is different
    const toolbarHTML = await page.evaluate(() => {
      const toolbar = document.querySelector('[style*="z-index: 9999"], [style*="z-index: 10000"]');
      return toolbar ? toolbar.innerHTML.substring(0, 500) : 'No toolbar found';
    });
    console.log('   Toolbar:', toolbarHTML.substring(0, 200));
  }

  // Check for GrapeJS canvas
  console.log('6. Inspecting GrapeJS canvas...');
  const canvasInfo = await page.evaluate(() => {
    const gjsContainer = document.querySelector('[class*="gjs-"]');
    const iframes = document.querySelectorAll('iframe');
    const grapeEditor = document.querySelector('.grapejs-editor, [class*="grapejs"]');
    
    return {
      gjsContainerFound: !!gjsContainer,
      gjsContainerClass: gjsContainer?.className || 'none',
      iframeCount: iframes.length,
      iframeSrcs: Array.from(iframes).map(f => f.src?.substring(0, 100)),
      grapeEditorFound: !!grapeEditor,
      fixedOverlays: document.querySelectorAll('[style*="position: fixed"]').length,
    };
  });
  console.log('   Canvas info:', JSON.stringify(canvasInfo, null, 2));
  await page.screenshot({ path: `${SCREENSHOT_DIR}/04-canvas-inspection.png`, fullPage: false });

  // If there's an iframe, inspect its contents
  if (canvasInfo.iframeCount > 0) {
    console.log('7. Inspecting iframe content...');
    const iframeContent = await page.evaluate(() => {
      const iframe = document.querySelector('iframe');
      if (!iframe) return { error: 'No iframe' };
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return { error: 'Cannot access iframe document (cross-origin?)' };
        
        const styles = doc.querySelectorAll('style, link[rel="stylesheet"]');
        const bodyHTML = doc.body?.innerHTML?.substring(0, 2000) || 'empty body';
        const bodyClasses = doc.body?.className || '';
        const headContent = doc.head?.innerHTML?.substring(0, 1000) || 'empty head';
        
        return {
          title: doc.title,
          bodyClasses,
          bodyHTMLLength: doc.body?.innerHTML?.length || 0,
          bodyHTMLPreview: bodyHTML,
          styleCount: styles.length,
          stylesheets: Array.from(doc.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href),
          inlineStyles: Array.from(doc.querySelectorAll('style')).map(s => s.textContent?.substring(0, 100)),
          headPreview: headContent,
        };
      } catch (e) {
        return { error: e.message };
      }
    });
    console.log('   Iframe content:', JSON.stringify(iframeContent, null, 2));
    await page.screenshot({ path: `${SCREENSHOT_DIR}/05-iframe-content.png`, fullPage: false });
  }

  // Check console errors
  console.log('\n8. Console errors:');
  if (errors.length === 0) {
    console.log('   ✓ No errors');
  } else {
    errors.forEach(e => console.log(`   ✗ ${e}`));
  }

  console.log('\n9. Console logs (last 20):');
  consoleLogs.slice(-20).forEach(l => console.log(`   ${l}`));

  await page.screenshot({ path: `${SCREENSHOT_DIR}/06-final-state.png`, fullPage: false });

  console.log(`\nScreenshots saved to ${SCREENSHOT_DIR}/`);
  await browser.close();
}

main().catch(e => {
  console.error('Test failed:', e.message);
  process.exit(1);
});
