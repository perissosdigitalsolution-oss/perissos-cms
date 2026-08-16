#!/usr/bin/env node
/**
 * Test: Direct API test for hero mainImage save
 */

const BACKOFFICE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@perissos.dev';
const ADMIN_PASSWORD = 'Admin123!@#';

async function login() {
  const res = await fetch(`${BACKOFFICE_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  const data = await res.json();
  return data.token;
}

async function testDirectSave() {
  try {
    console.log('🔐 Logging in...');
    const token = await login();
    console.log('✅ Logged in');

    // Get current page
    console.log('\n📄 Fetching current page...');
    const pageRes = await fetch(`${BACKOFFICE_URL}/api/pages?where[slug][equals]=home&depth=1`, {
      headers: { Authorization: `JWT ${token}` },
    });
    const pageData = await pageRes.json();
    const page = pageData.docs[0];
    console.log('Page ID:', page.id);
    console.log('Current sections[0].mainImage:', page.sections[0]?.mainImage);

    // Update hero section with mainImage
    const updatedSections = [...page.sections];
    updatedSections[0] = {
      ...updatedSections[0],
      mainImage: 'https://cdn.prod.website-files.com/6877e02f5387b6bdd6d338ec/687809ff2e58f4023f2a0ba4_Banner%20Image.png'
    };

    console.log('\n💾 Saving page with mainImage...');
    const saveRes = await fetch(`${BACKOFFICE_URL}/api/pages/${page.id}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `JWT ${token}` 
      },
      body: JSON.stringify({ sections: updatedSections }),
    });
    const saveData = await saveRes.json();
    console.log('Save status:', saveRes.status);
    console.log('Save result mainImage:', saveData.doc?.sections?.[0]?.mainImage);

    // Verify
    console.log('\n🔍 Verifying...');
    const verifyRes = await fetch(`${BACKOFFICE_URL}/api/pages?where[slug][equals]=home&depth=1`, {
      headers: { Authorization: `JWT ${token}` },
    });
    const verifyData = await verifyRes.json();
    console.log('Verified mainImage:', verifyData.docs[0]?.sections?.[0]?.mainImage);

  } catch (err) {
    console.error('Error:', err.message);
  }
}

testDirectSave();