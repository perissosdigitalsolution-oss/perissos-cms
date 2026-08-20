import puppeteer from 'puppeteer';

const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222' });
const pages = await browser.pages();
const page = pages.find(p => p.url().includes('localhost:3001')) || pages[0];

await page.goto('http://localhost:3001/?edit=true', { waitUntil: 'networkidle2', timeout: 30000 });
await page.reload({ waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 3000));

// Click Page Builder
const btns = await page.$$('button');
for (const btn of btns) {
  const text = await btn.evaluate(el => el.textContent?.trim());
  if (text?.includes('Page Builder')) {
    await btn.click();
    break;
  }
}
await new Promise(r => setTimeout(r, 10000));

// Test the editor API directly
console.log('=== Test Editor API ===');
const editorData = await page.evaluate(() => {
  // Access the GrapeJS editor through the window/global scope
  // The editor instance is stored in the component ref, not accessible from outside
  // But we can check the iframe content
  const iframe = document.querySelector('iframe.gjs-frame');
  if (!iframe) return { error: 'no iframe' };
  
  try {
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return { error: 'no document' };
    
    return {
      bodyHTML: doc.body?.innerHTML?.substring(0, 500),
      styleCount: doc.querySelectorAll('style').length,
      elementCount: doc.querySelectorAll('*').length,
      hasHeader: !!doc.querySelector('header'),
      hasHero: !!doc.querySelector('.hero, section.hero'),
      hasFooter: !!doc.querySelector('footer, .footer'),
    };
  } catch(e) {
    return { error: e.message };
  }
});
console.log('Editor content:', JSON.stringify(editorData, null, 2));

// Test: Click Save and monitor network
console.log('\n=== Test Save Network ===');
let saveDetected = false;
page.on('response', async (response) => {
  const url = response.url();
  if (url.includes('/api/pages/') && response.request().method() === 'PATCH') {
    saveDetected = true;
    console.log('SAVE DETECTED:', url);
    try {
      const body = await response.text();
      console.log('Response status:', response.status());
      console.log('Response body length:', body.length);
    } catch(e) {
      console.log('Could not read response body');
    }
  }
});

// Click Save
const saveBtns2 = await page.$$('button');
for (const btn of saveBtns2) {
  const text = await btn.evaluate(el => el.textContent?.trim());
  if (text?.includes('Save')) {
    console.log('Clicking Save...');
    await btn.click();
    break;
  }
}
await new Promise(r => setTimeout(r, 8000));

if (!saveDetected) {
  console.log('No save request detected');
  
  // Check if "Saving..." text appeared
  const savingState = await page.evaluate(() => {
    const spans = Array.from(document.querySelectorAll('span'));
    const savingSpan = spans.find(s => s.textContent?.includes('Saving'));
    return savingSpan ? savingSpan.textContent : 'no saving indicator';
  });
  console.log('Saving state:', savingState);
}

await browser.disconnect();
console.log('\nDone.');
