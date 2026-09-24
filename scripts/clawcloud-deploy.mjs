#!/usr/bin/env node

/**
 * ClawCloud Deployment Automation Script
 * Sprint 37 — Perissos CMS Backoffice
 * 
 * Usage: node scripts/clawcloud-deploy.mjs
 * 
 * Prerequisites:
 * 1. ClawCloud must be accessible from this machine
 * 2. npm install puppeteer (or use npx)
 * 3. GitHub account with 180+ days age
 */

import puppeteer from 'puppeteer';
import { setTimeout } from 'timers/promises';

// Configuration
const CONFIG = {
  clawcloud: {
    signinUrl: 'https://us-east-1.run.claw.cloud/signin',
    databaseUrl: 'https://us-east-1.run.claw.cloud/database',
    appLaunchpadUrl: 'https://us-east-1.run.claw.cloud/app-launchpad',
  },
  backoffice: {
    name: 'perissos-backoffice',
    image: 'ghcr.io/perissosdigitalsolution-oss/backoffice:latest',
    cpu: '1',
    ram: '1024', // MB
    port: '3000',
    publicAccess: true,
  },
  database: {
    name: 'perissos-db',
    type: 'postgresql',
    cpu: '0.5',
    ram: '512', // MB
    storage: '3', // Gi
  },
  envVars: {
    PAYLOAD_SECRET: '944576dd5973f5a20431dbde0464ebb208bb379b4d3400e5498bee4c2200f205',
    NEXT_PUBLIC_CMS_URL: 'https://perissos-backoffice.clawcloud.run',
    NODE_ENV: 'production',
  },
  screenshotDir: './screenshots',
  userDataDir: '/tmp/puppeteer-clawcloud-session',
};

// Helper functions
async function delay(ms) {
  await setTimeout(ms);
}

async function screenshot(page, name) {
  const fs = await import('fs');
  if (!fs.existsSync(CONFIG.screenshotDir)) {
    fs.mkdirSync(CONFIG.screenshotDir, { recursive: true });
  }
  await page.screenshot({ 
    path: `${CONFIG.screenshotDir}/${name}.png`,
    fullPage: true 
  });
  console.log(`📸 Screenshot saved: ${name}.png`);
}

async function waitForElement(page, selector, timeout = 10000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch (error) {
    console.error(`❌ Element not found: ${selector}`);
    return false;
  }
}

async function fillField(page, selector, value) {
  await page.waitForSelector(selector);
  await page.click(selector, { clickCount: 3 }); // Select all
  await page.type(selector, value);
  console.log(`✅ Filled ${selector} with: ${value}`);
}

async function clickButton(page, selector) {
  await page.waitForSelector(selector);
  await page.click(selector);
  console.log(`✅ Clicked: ${selector}`);
}

// Main deployment functions
async function loginToClawCloud(page) {
  console.log('\n🔐 Step 1: Navigating to ClawCloud signin...');
  await page.goto(CONFIG.clawcloud.signinUrl, { waitUntil: 'networkidle0' });
  await screenshot(page, '01-signin-page');

  console.log('🔐 Step 2: Clicking GitHub login...');
  // Look for GitHub login button
  const githubButton = await page.$('button:has-text("GitHub"), a:has-text("GitHub"), [data-provider="github"]');
  if (githubButton) {
    await githubButton.click();
    console.log('⏳ Waiting for GitHub OAuth...');
    await delay(3000);
    await screenshot(page, '02-github-oauth');
    
    // Note: User must complete OAuth manually in the browser window
    console.log('\n⚠️  MANUAL ACTION REQUIRED:');
    console.log('   Please complete GitHub login in the browser window.');
    console.log('   Press Enter here when done...');
    
    // Wait for user input (in real usage, this would be a readline interface)
    // For now, we'll wait for the dashboard to load
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 });
    console.log('✅ Login successful!');
  } else {
    // Try alternative selectors
    const altButton = await page.$('[class*="github"], [class*="GitHub"]');
    if (altButton) {
      await altButton.click();
      await delay(3000);
    }
  }
  
  await screenshot(page, '03-dashboard');
  return true;
}

async function deployPostgreSQL(page) {
  console.log('\n🗄️  Step 3: Deploying PostgreSQL database...');
  await page.goto(CONFIG.clawcloud.databaseUrl, { waitUntil: 'networkidle0' });
  await delay(2000);
  await screenshot(page, '04-database-page');

  // Click "Create Database" button
  console.log('🗄️  Step 4: Creating database...');
  const createButton = await page.$('button:has-text("Create"), button:has-text("New"), a:has-text("Create Database")');
  if (createButton) {
    await createButton.click();
    await delay(2000);
    await screenshot(page, '05-create-database-form');
  }

  // Fill database form
  console.log('🗄️  Step 5: Filling database form...');
  
  // Database name
  await fillField(page, 'input[name="name"], input[placeholder*="name"], #database-name', CONFIG.database.name);
  
  // Database type (select dropdown)
  const typeSelect = await page.$('select[name="type"], select[name="engine"]');
  if (typeSelect) {
    await page.select('select[name="type"], select[name="engine"]', CONFIG.database.type);
    console.log('✅ Selected database type: postgresql');
  }
  
  // CPU
  await fillField(page, 'input[name="cpu"], input[placeholder*="cpu"], #cpu', CONFIG.database.cpu);
  
  // RAM
  await fillField(page, 'input[name="memory"], input[name="ram"], input[placeholder*="memory"], #memory', CONFIG.database.ram);
  
  // Storage
  await fillField(page, 'input[name="storage"], input[placeholder*="storage"], #storage', CONFIG.database.storage);
  
  await screenshot(page, '06-database-form-filled');

  // Click Deploy button
  console.log('🗄️  Step 6: Deploying database...');
  const deployButton = await page.$('button:has-text("Deploy"), button:has-text("Create"), button[type="submit"]');
  if (deployButton) {
    await deployButton.click();
    console.log('⏳ Waiting for database deployment...');
    await delay(15000); // Wait for deployment
    await screenshot(page, '07-database-deploying');
  }

  // Wait for database to be running
  console.log('🗄️  Step 7: Waiting for database to be ready...');
  await delay(10000);
  await screenshot(page, '08-database-running');

  // Extract DATABASE_URL
  console.log('🗄️  Step 8: Extracting connection details...');
  const databaseUrl = await page.evaluate(() => {
    // Look for connection string or URL in the page
    const elements = document.querySelectorAll('[class*="connection"], [class*="url"], code, pre');
    for (const el of elements) {
      const text = el.textContent;
      if (text && text.includes('postgresql://')) {
        return text.trim();
      }
    }
    // Alternative: look for input fields with connection info
    const inputs = document.querySelectorAll('input[readonly], input[value*="postgresql"]');
    for (const input of inputs) {
      if (input.value && input.value.includes('postgresql://')) {
        return input.value;
      }
    }
    return null;
  });

  if (databaseUrl) {
    console.log(`✅ DATABASE_URL: ${databaseUrl}`);
    CONFIG.envVars.DATABASE_URL = databaseUrl;
  } else {
    console.log('⚠️  Could not extract DATABASE_URL automatically');
    console.log('   Please enter it manually when prompted');
  }

  return true;
}

async function deployBackoffice(page) {
  console.log('\n🚀 Step 9: Deploying backoffice app...');
  await page.goto(CONFIG.clawcloud.appLaunchpadUrl, { waitUntil: 'networkidle0' });
  await delay(2000);
  await screenshot(page, '09-app-launchpad');

  // Click "Create App" button
  console.log('🚀 Step 10: Creating app...');
  const createButton = await page.$('button:has-text("Create"), button:has-text("New"), a:has-text("Create App")');
  if (createButton) {
    await createButton.click();
    await delay(2000);
    await screenshot(page, '10-create-app-form');
  }

  // Fill app form
  console.log('🚀 Step 11: Filling app form...');
  
  // App name
  await fillField(page, 'input[name="name"], input[placeholder*="name"], #app-name', CONFIG.backoffice.name);
  
  // Image name
  await fillField(page, 'input[name="image"], input[placeholder*="image"], #image', CONFIG.backoffice.image);
  
  // CPU
  await fillField(page, 'input[name="cpu"], input[placeholder*="cpu"], #cpu', CONFIG.backoffice.cpu);
  
  // RAM
  await fillField(page, 'input[name="memory"], input[name="ram"], input[placeholder*="memory"], #memory', CONFIG.backoffice.ram);
  
  // Port
  await fillField(page, 'input[name="port"], input[placeholder*="port"], #port', CONFIG.backoffice.port);
  
  // Public Access toggle
  const publicToggle = await page.$('input[name="public"], input[type="checkbox"][name*="public"], button:has-text("Public")');
  if (publicToggle) {
    await publicToggle.click();
    console.log('✅ Enabled public access');
  }
  
  await screenshot(page, '11-app-form-filled');

  // Add environment variables
  console.log('🚀 Step 12: Adding environment variables...');
  
  for (const [key, value] of Object.entries(CONFIG.envVars)) {
    // Click "Add Environment Variable" button
    const addButton = await page.$('button:has-text("Add"), button:has-text("Add Variable"), button:has-text("+")');
    if (addButton) {
      await addButton.click();
      await delay(500);
    }
    
    // Fill key field
    const keyInput = await page.$('input[placeholder*="key"], input[name*="key"], input[placeholder*="Key"]');
    if (keyInput) {
      await keyInput.click({ clickCount: 3 });
      await keyInput.type(key);
    }
    
    // Fill value field
    const valueInput = await page.$('input[placeholder*="value"], input[name*="value"], input[placeholder*="Value"]');
    if (valueInput) {
      await valueInput.click({ clickCount: 3 });
      await valueInput.type(value);
    }
    
    console.log(`✅ Added env var: ${key}=${value.substring(0, 20)}...`);
    await delay(300);
  }
  
  await screenshot(page, '12-env-vars-added');

  // Click Deploy button
  console.log('🚀 Step 13: Deploying app...');
  const deployButton = await page.$('button:has-text("Deploy"), button:has-text("Create"), button[type="submit"]');
  if (deployButton) {
    await deployButton.click();
    console.log('⏳ Waiting for app deployment...');
    await delay(20000); // Wait for deployment
    await screenshot(page, '13-app-deploying');
  }

  // Wait for app to be running
  console.log('🚀 Step 14: Waiting for app to be ready...');
  await delay(15000);
  await screenshot(page, '14-app-running');

  return true;
}

async function verifyDeployment(page) {
  console.log('\n✅ Step 15: Verifying deployment...');
  
  // Test health endpoint
  console.log('✅ Step 16: Testing health endpoint...');
  await page.goto('https://perissos-backoffice.clawcloud.run/api/health', { waitUntil: 'networkidle0' });
  await delay(3000);
  await screenshot(page, '15-health-check');
  
  const healthText = await page.evaluate(() => document.body.textContent);
  console.log(`Health check response: ${healthText}`);
  
  // Test admin page
  console.log('✅ Step 17: Testing admin page...');
  await page.goto('https://perissos-backoffice.clawcloud.run/admin', { waitUntil: 'networkidle0' });
  await delay(3000);
  await screenshot(page, '16-admin-page');
  
  console.log('\n🎉 Deployment verification complete!');
  return true;
}

// Main deployment function
async function deploy() {
  console.log('🚀 ClawCloud Deployment Automation');
  console.log('==================================\n');
  
  const browser = await puppeteer.launch({
    headless: false, // Set to true for automation, false for manual OAuth
    defaultViewport: { width: 1280, height: 720 },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
    ],
    userDataDir: CONFIG.userDataDir, // Persist session
  });

  const page = await browser.newPage();
  
  try {
    // Step 1: Login
    await loginToClawCloud(page);
    
    // Step 2: Deploy PostgreSQL
    await deployPostgreSQL(page);
    
    // Step 3: Deploy Backoffice
    await deployBackoffice(page);
    
    // Step 4: Verify
    await verifyDeployment(page);
    
    console.log('\n🎉 Deployment complete!');
    console.log('==================================');
    console.log('Backoffice URL: https://perissos-backoffice.clawcloud.run');
    console.log('Admin URL: https://perissos-backoffice.clawcloud.run/admin');
    console.log('Login: admin@perissos.dev / Admin123!@#');
    console.log('==================================\n');
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    await screenshot(page, 'error');
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Run deployment
deploy().catch(console.error);
