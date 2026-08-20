const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  // Clear all storage
  await page.goto('http://localhost:3001');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  
  // Hard refresh
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 5000));
  
  const bodyClass = await page.evaluate(() => document.body.className);
  console.log('Body class after clear:', bodyClass);
  
  const sections = await page.$$eval('section[id]', els => 
    els.map(el => ({ id: el.id, class: el.className }))
  );
  console.log('Sections:', JSON.stringify(sections, null, 2));
  
  await browser.close();
})();
