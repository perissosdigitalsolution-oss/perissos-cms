import puppeteer from 'puppeteer';

const PORT = 9222;

let gPage;

async function shot(name) {
  await gPage.screenshot({ path: `/tmp/${name}.png`, fullPage: false });
  console.log(`📸 ${name}`);
}

async function verify(page, label) {
  await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 4000));

  const state = await page.evaluate(() => {
    const bodyClass = document.body.className;
    const cssLink = document.getElementById('template-css');
    const cssHref = cssLink?.getAttribute('href') || '';
    const heroText = document.body.innerText.substring(0, 300);
    const buttons = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(t => t.length > 0);
    return { bodyClass, cssHref, heroText, buttons };
  });

  console.log(`\n  [${label}] CSS: ${state.cssHref}`);
  console.log(`  [${label}] Body class: ${state.bodyClass}`);
  console.log(`  [${label}] Buttons: ${state.buttons.filter(b => ['Page Builder','Content','Theme'].includes(b)).join(', ')}`);
  console.log(`  [${label}] Hero preview: ${state.heroText.substring(0, 80)}...`);
  return state;
}

async function openPanel(page, buttonText, label) {
  await page.evaluate((txt) => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText.includes(txt));
    if (btn) btn.click();
  }, buttonText);
  await new Promise(r => setTimeout(r, 2500));
  // Check multiple ways panel might be visible
  const has = await page.evaluate((txt) => {
    const text = document.body.innerText;
    // Try exact match, then fallback to looser match
    return text.includes(txt) || text.includes(txt.toLowerCase());
  }, label);
  // Also take debug screenshot
  await shot(`${buttonText.toLowerCase()}-panel-debug`);
  return has;
}

async function closePanel(page) {
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const close = btns.find(b => b.querySelector('.fa-times'));
    if (close) close.click();
  });
  await new Promise(r => setTimeout(r, 500));
}

async function checkGrapeJS(page) {
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find(b => b.innerText.includes('Page Builder'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 5000));
  const state = await page.evaluate(() => ({
    hasGrapeJS: !!document.querySelector('.gjs-editor'),
    hasCanvas: !!document.querySelector('.gjs-cv-canvas'),
    hasBlocks: !!document.querySelector('.gjs-blocks-c'),
  }));
  await shot( 'grapejs');
  await closePanel(page);
  return state;
}

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  TEMPLATE SWITCHING TEST');
  console.log('═══════════════════════════════════════════\n');

  const browser = await puppeteer.connect({
    browserURL: `http://127.0.0.1:${PORT}`,
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  gPage = page;
  await page.setViewport({ width: 1440, height: 900 });

  // ── PHASE 1: Digital Agency ──
  console.log('━━━ PHASE 1: Digital Agency ━━━');
  const da = await verify(page, 'DA-home');

  const daContent = await openPanel(page, 'Content', 'Edit Content');
  console.log(`  Content Panel: ${daContent ? '✅' : '❌'}`);
  await shot( 'da-content');

  const daSections = await page.evaluate(() => {
    const text = document.body.innerText;
    return ['Hero', 'Services', 'About', 'Team', 'Portfolio', 'Blog', 'Pricing', 'Contact', 'CTA']
      .filter(s => text.includes(s));
  });
  console.log(`  Sections: ${daSections.join(', ')}`);
  await closePanel(page);

  const daTheme = await openPanel(page, 'Theme', 'Theme Editor');
  console.log(`  Theme Panel: ${daTheme ? '✅' : '❌'}`);
  await shot( 'da-theme');
  await closePanel(page);

  const daPB = await checkGrapeJS(page);
  console.log(`  Page Builder: GJS=${daPB.hasGrapeJS ? '✅' : '❌'} Canvas=${daPB.hasCanvas ? '✅' : '❌'} Blocks=${daPB.hasBlocks ? '✅' : '❌'}`);

  // ── PHASE 2: Switch to Food Express ──
  console.log('\n━━━ PHASE 2: Switch to Food Express ━━━');

  // Check DB state
  const dbState = await page.evaluate(async () => {
    const res = await fetch('http://localhost:3000/api/templates?limit=5', { credentials: 'include' });
    const data = await res.json();
    return data.docs.map(t => ({ id: t.id, name: t.name, isActive: t.isActive }));
  });
  console.log('  DB state before switch:', JSON.stringify(dbState));

  // Need to switch via backoffice - activate template 83
  // Use fetch from the page context (has cookies)
  console.log('  Activating Food Express via API...');
  const activateResult = await page.evaluate(async () => {
    // Login to get JWT
    const loginRes = await fetch('http://localhost:3000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@perissos.dev', password: 'Admin123!@#' }),
      credentials: 'include',
    });
    const loginData = await loginRes.json();
    const token = loginData.token;

    // Activate
    const res = await fetch('http://localhost:3000/api/templates/83', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `JWT ${token}`,
      },
      body: JSON.stringify({ isActive: true }),
    });
    const data = await res.json();
    return { ok: res.ok, isActive: data.doc?.isActive };
  });
  console.log(`  Activate result: ${JSON.stringify(activateResult)}`);

  // Wait for background hook
  console.log('  Waiting 15s for background hook...');
  await new Promise(r => setTimeout(r, 15000));

  const fe = await verify(page, 'FE-home');
  const feContent = await openPanel(page, 'Content', 'Edit Content');
  console.log(`  Content Panel: ${feContent ? '✅' : '❌'}`);
  await shot( 'fe-content');

  const feSections = await page.evaluate(() => {
    const text = document.body.innerText;
    return ['Hero', 'Menu Highlights', 'Reservation', 'Gallery', 'Testimonials', 'Contact']
      .filter(s => text.includes(s));
  });
  console.log(`  Sections: ${feSections.join(', ')}`);
  await closePanel(page);

  const feTheme = await openPanel(page, 'Theme', 'Theme Editor');
  console.log(`  Theme Panel: ${feTheme ? '✅' : '❌'}`);
  await shot( 'fe-theme');
  await closePanel(page);

  const fePB = await checkGrapeJS(page);
  console.log(`  Page Builder: GJS=${fePB.hasGrapeJS ? '✅' : '❌'} Canvas=${fePB.hasCanvas ? '✅' : '❌'} Blocks=${fePB.hasBlocks ? '✅' : '❌'}`);

  // ── PHASE 3: Switch back to Digital Agency ──
  console.log('\n━━━ PHASE 3: Back to Digital Agency ━━━');
  const activateResult2 = await page.evaluate(async () => {
    const loginRes = await fetch('http://localhost:3000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@perissos.dev', password: 'Admin123!@#' }),
      credentials: 'include',
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    const res = await fetch('http://localhost:3000/api/templates/95', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `JWT ${token}` },
      body: JSON.stringify({ isActive: true }),
    });
    const data = await res.json();
    return { ok: res.ok, isActive: data.doc?.isActive };
  });
  console.log(`  Activate result: ${JSON.stringify(activateResult2)}`);
  await new Promise(r => setTimeout(r, 15000));

  const da2 = await verify(page, 'DA2-home');
  const da2Content = await openPanel(page, 'Content', 'Edit Content');
  console.log(`  Content Panel: ${da2Content ? '✅' : '❌'}`);
  await shot( 'da2-content');
  await closePanel(page);

  const da2PB = await checkGrapeJS(page);
  console.log(`  Page Builder: GJS=${da2PB.hasGrapeJS ? '✅' : '❌'} Canvas=${da2PB.hasCanvas ? '✅' : '❌'} Blocks=${da2PB.hasBlocks ? '✅' : '❌'}`);

  // ── SUMMARY ──
  console.log('\n═══════════════════════════════════════════');
  console.log('  RESULTS');
  console.log('═══════════════════════════════════════════');
  console.log(`  Phase 1 (Digital Agency):  Content=${daContent?'✅':'❌'} Theme=${daTheme?'✅':'❌'} PB=${daPB.hasGrapeJS?'✅':'❌'}`);
  console.log(`  Phase 2 (Food Express):    Content=${feContent?'✅':'❌'} Theme=${feTheme?'✅':'❌'} PB=${fePB.hasGrapeJS?'✅':'❌'}`);
  console.log(`  Phase 3 (Back to Agency):  Content=${da2Content?'✅':'❌'} PB=${da2PB.hasGrapeJS?'✅':'❌'}`);
  console.log(`  CSS switching: DA=${da.cssHref.includes('digital')} FE=${fe.cssHref.includes('restaurant')} DA2=${da2.cssHref.includes('digital')}`);
  console.log('═══════════════════════════════════════════');

  await page.close();
  console.log('\n✅ Test complete');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
