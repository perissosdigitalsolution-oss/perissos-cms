import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});

const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });
await page.goto('http://localhost:3001/?edit=true', { waitUntil: 'networkidle2', timeout: 60000 });

// Click Page Builder button
await page.waitForSelector('button', { timeout: 15000 });
const buttons = await page.$$('button');
for (const btn of buttons) {
  const text = await btn.evaluate(el => el.textContent);
  if (text.includes('Page Builder')) { await btn.click(); break; }
}
await new Promise(r => setTimeout(r, 10000));

// Screenshot
await page.screenshot({ path: '/tmp/grapejs-test/14-after-header-fix.png', fullPage: false });
console.log('Screenshot saved');

// Canvas layout
const dims = await page.evaluate(() => {
  const results = {};
  for (const sel of ['.gjs-editor', '.gjs-cv-canvas', '.gjs-editor-cont', '.gjs-cv-canvas__frames', '.gjs-frame-wrapper', 'iframe.gjs-frame']) {
    const el = document.querySelector(sel);
    if (el) {
      const s = getComputedStyle(el);
      results[sel] = { w: el.offsetWidth, h: el.offsetHeight, bg: s.backgroundColor, display: s.display, overflow: s.overflow, position: s.position };
    }
  }
  return results;
});
console.log('Canvas layout:', JSON.stringify(dims, null, 2));

// Check header + hero visibility
const contentCheck = await page.evaluate(() => {
  const iframe = document.querySelector('iframe.gjs-frame');
  if (!iframe) return { error: 'no iframe' };
  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) return { error: 'no iframe document' };
  
  const header = iframeDoc.querySelector('header#masthead, header');
  const hero = iframeDoc.querySelector('section.hero, .hero');
  const body = iframeDoc.body;
  
  return {
    headerRect: header?.getBoundingClientRect(),
    headerStyle: header ? { pos: getComputedStyle(header).display, bg: getComputedStyle(header).backgroundColor, color: getComputedStyle(header).color, h: header.offsetHeight } : null,
    heroRect: hero?.getBoundingClientRect(),
    heroStyle: hero ? { pos: getComputedStyle(hero).display, bg: getComputedStyle(hero).backgroundColor, color: getComputedStyle(hero).color, h: hero.offsetHeight, top: getComputedStyle(hero).top, pt: getComputedStyle(hero).paddingTop } : null,
    bodyBg: getComputedStyle(body).backgroundColor,
    bodyOverflow: getComputedStyle(body).overflow,
    scrollHeight: iframeDoc.documentElement.scrollHeight,
  };
});
console.log('Content check:', JSON.stringify(contentCheck, null, 2));

await browser.close();
