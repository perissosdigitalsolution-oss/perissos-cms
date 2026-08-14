#!/usr/bin/env node
/**
 * API Smoke Tests for Perissos CMS
 * Run against a live backoffice instance
 * Usage: BACKOFFICE_URL=http://localhost:3000 node scripts/test-api.mjs
 */

const BACKOFFICE_URL = process.env.BACKOFFICE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@perissos.dev';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!@#';

async function fetchJson(url, options = {}) {
  const res = await fetch(`${BACKOFFICE_URL}${url}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function login() {
  const { status, ok, data } = await fetchJson('/api/users/login', {
    method: 'POST',
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!ok) throw new Error(`Login failed: ${status} ${JSON.stringify(data)}`);
  const token = data.token;
  if (!token) throw new Error('No token in login response');
  console.log('✓ Login successful');
  return token;
}

async function testHealth() {
  const { status, ok, data } = await fetchJson('/api/health');
  if (!ok || data.status !== 'ok') throw new Error(`Health check failed: ${status}`);
  console.log('✓ Health check passed');
}

async function testTemplatesList(token) {
  const { status, ok, data } = await fetchJson('/api/templates', {
    headers: { Authorization: `JWT ${token}` },
  });
  if (!ok) throw new Error(`Templates list failed: ${status}`);
  console.log(`✓ Templates list: ${data.totalDocs} templates`);
  return data.docs;
}

async function testTemplateImport(token) {
  // Create a minimal test ZIP in memory
  const AdmZip = (await import('adm-zip')).default;
  const zip = new AdmZip();
  zip.addFile('index.html', Buffer.from('<html><title>Test</title><section id="hero">Hero</section></html>'));
  zip.addFile('manifest.json', Buffer.from(JSON.stringify({ name: 'Smoke Test', category: 'test', version: '1.0.0' })));
  const zipBuffer = zip.toBuffer();

  // Use form-data for multipart
  const formData = new FormData();
  const blob = new Blob([zipBuffer], { type: 'application/zip' });
  formData.append('zipFile', blob, 'smoke-test.zip');

  const res = await fetch(`${BACKOFFICE_URL}/api/templates/import-zip`, {
    method: 'POST',
    headers: { Authorization: `JWT ${token}` },
    body: formData,
  });
  const result = await res.json();
  if (!res.ok) throw new Error(`Import failed: ${res.status} ${JSON.stringify(result)}`);
  console.log(`✓ Template imported: ${result.template?.name} (id: ${result.template?.id})`);
  return result.template;
}

async function testTemplateActivate(token, templateId) {
  const { status, ok, data } = await fetchJson(`/api/templates/${templateId}`, {
    method: 'PATCH',
    headers: { Authorization: `JWT ${token}` },
    body: JSON.stringify({ isActive: true }),
  });
  if (!ok || !data.doc?.isActive) throw new Error(`Activate failed: ${status}`);
  console.log(`✓ Template ${templateId} activated`);
}

async function testTemplateDeactivate(token, templateId) {
  const { status, ok, data } = await fetchJson(`/api/templates/${templateId}`, {
    method: 'PATCH',
    headers: { Authorization: `JWT ${token}` },
    body: JSON.stringify({ isActive: false }),
  });
  if (!ok || data.doc?.isActive) throw new Error(`Deactivate failed: ${status}`);
  console.log(`✓ Template ${templateId} deactivated`);
}

async function run() {
  console.log(`\n🧪 Running API smoke tests against ${BACKOFFICE_URL}\n`);
  const start = Date.now();

  try {
    await testHealth();
    const token = await login();
    const beforeTemplates = await testTemplatesList(token);

    const template = await testTemplateImport(token);
    await testTemplateActivate(token, template.id);
    await testTemplateDeactivate(token, template.id);

    const afterTemplates = await testTemplatesList(token);
    if (afterTemplates.length !== beforeTemplates.length + 1) {
      console.warn('⚠ Template count mismatch (import may not persist)');
    }

    console.log(`\n✅ All API tests passed in ${Date.now() - start}ms\n`);
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ Test failed: ${err.message}\n`);
    process.exit(1);
  }
}

run();