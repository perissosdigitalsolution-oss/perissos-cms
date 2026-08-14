#!/usr/bin/env tsx
// scripts/new-client.ts
// Usage: pnpm new-client --name "acme-corp" --plan "pro" --email "admin@acme.com"

import { parseArgs } from 'node:util';
import { neon } from '@neondatabase/serverless';
import fs from 'node:fs/promises';
import path from 'node:path';

// ─── Types ───────────────────────────────────────────────
interface ClientConfig {
  name: string;
  nameLower: string;
  plan: 'free' | 'pro' | 'enterprise';
  email: string;
}

interface ProvisioningResult {
  success: boolean;
  clientName: string;
  databaseUrl?: string;
  vercelUrl?: string;
  cloudflareUrl?: string;
  r2Prefix?: string;
  errors?: string[];
}

// ─── CLI Arguments ───────────────────────────────────────
const { values } = parseArgs({
  options: {
    name: { type: 'string' },
    plan: { type: 'string', default: 'free' },
    email: { type: 'string' },
  },
  strict: true,
});

if (!values.name || !values.email) {
  console.error('Usage: pnpm new-client --name <name> --plan <plan> --email <email>');
  process.exit(1);
}

const config: ClientConfig = {
  name: values.name,
  nameLower: values.name.toLowerCase().replace(/\s+/g, '-'),
  plan: values.plan as ClientConfig['plan'],
  email: values.email,
};

// ─── Logger ──────────────────────────────────────────────
const LOG_DIR = path.resolve(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, `provision-${config.nameLower}-${Date.now()}.log`);

async function log(level: 'INFO' | 'WARN' | 'ERROR', message: string) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${level}] ${message}`;
  console.log(line);
  await fs.appendFile(LOG_FILE, line + '\n');
}

// ─── Rollback Stack ──────────────────────────────────────
const rollbackActions: (() => Promise<void>)[] = [];

async function rollback(errors: string[]) {
  await log('WARN', 'Starting rollback...');
  for (const action of rollbackActions.reverse()) {
    try {
      await action();
    } catch (e) {
      await log('ERROR', `Rollback action failed: ${e}`);
    }
  }
  await log('INFO', 'Rollback complete.');
}

// ─── Step 1: Create Neon Database ────────────────────────
async function createNeonDatabase(config: ClientConfig): Promise<string> {
  await log('INFO', 'Step 1: Creating Neon database...');

  const sql = neon(process.env.NEON_API_KEY!);
  const dbName = `perissos_${config.nameLower}`;

  // Create database via Neon API
  const response = await fetch(`https://console.neon.tech/api/v2/projects/${process.env.NEON_PROJECT_ID}/branches`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NEON_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      branch: {
        name: `client-${config.nameLower}`,
      },
      endpoints: [{
        type: 'read-write',
        autoscaling: { min: 0.25, max: 1 },
      }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Neon API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as any;
  const databaseUrl = data.connection_uris?.[0]?.connection_uri;

  if (!databaseUrl) {
    throw new Error('Failed to get database connection URL from Neon');
  }

  // Add rollback action
  rollbackActions.push(async () => {
    await log('INFO', `Rolling back Neon branch: client-${config.nameLower}`);
    await fetch(`https://console.neon.tech/api/v2/projects/${process.env.NEON_PROJECT_ID}/branches/client-${config.nameLower}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${process.env.NEON_API_KEY}` },
    });
  });

  await log('INFO', `Database created: ${dbName}`);
  return databaseUrl;
}

// ─── Step 2: Create R2 Prefix ────────────────────────────
async function createR2Prefix(config: ClientConfig): Promise<void> {
  await log('INFO', 'Step 2: Configuring R2 prefix...');

  const prefix = `${config.nameLower}/`;

  // Set CORS policy for client uploads
  const corsResponse = await fetch(`${process.env.R2_ENDPOINT}/perissos-media?cors`, {
    method: 'PUT',
    headers: {
      'Authorization': `AWS4-HMAC-SHA256 ${process.env.R2_ACCESS_KEY_ID}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      CORSRules: [{
        AllowedHeaders: ['*'],
        AllowedMethods: ['PUT', 'POST', 'GET'],
        AllowedOrigins: [`https://admin.${config.nameLower}.perissos.dev`],
        ExposeHeaders: ['ETag'],
        MaxAgeSeconds: 3600,
      }],
    }),
  });

  if (!corsResponse.ok) {
    await log('WARN', `R2 CORS setup returned ${corsResponse.status} — may need manual configuration`);
  }

  await log('INFO', `R2 prefix configured: ${prefix}`);
}

// ─── Step 3: Create Vercel Project ───────────────────────
async function createVercelProject(config: ClientConfig, databaseUrl: string): Promise<string> {
  await log('INFO', 'Step 3: Creating Vercel project...');

  const projectName = `perissos-${config.nameLower}`;

  const response = await fetch('https://api.vercel.com/v9/projects', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: projectName,
      framework: 'nextjs',
      buildSettings: {
        buildCommand: 'cd apps/backoffice && pnpm build',
        outputDirectory: 'apps/backoffice/.next',
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Vercel API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as any;

  // Set environment variables
  const envVars = [
    { key: 'PAYLOAD_SECRET', value: generateSecret() },
    { key: 'DATABASE_URL', value: databaseUrl },
    { key: 'R2_ENDPOINT', value: process.env.R2_ENDPOINT! },
    { key: 'R2_BUCKET', value: 'perissos-media' },
    { key: 'R2_ACCESS_KEY_ID', value: process.env.R2_ACCESS_KEY_ID! },
    { key: 'R2_SECRET_ACCESS_KEY', value: process.env.R2_SECRET_ACCESS_KEY! },
    { key: 'R2_PUBLIC_URL', value: `https://media.perissos.dev/${config.nameLower}` },
    { key: 'NEXT_PUBLIC_R2_URL', value: `https://media.perissos.dev/${config.nameLower}` },
    { key: 'CLIENT_NAME', value: config.name },
    { key: 'NEXT_PUBLIC_CMS_URL', value: `https://${projectName}.vercel.app` },
    { key: 'NEXT_PUBLIC_FRONTEND_URL', value: `https://${config.nameLower}.perissos.dev` },
  ];

  for (const env of envVars) {
    await fetch(`https://api.vercel.com/v10/projects/${projectName}/env`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: env.key,
        value: env.value,
        target: ['production'],
      }),
    });
  }

  // Add rollback action
  rollbackActions.push(async () => {
    await log('INFO', `Rolling back Vercel project: ${projectName}`);
    await fetch(`https://api.vercel.com/v9/projects/${projectName}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${process.env.VERCEL_TOKEN}` },
    });
  });

  const vercelUrl = `https://${projectName}.vercel.app`;
  await log('INFO', `Vercel project created: ${vercelUrl}`);
  return vercelUrl;
}

// ─── Step 4: Create Cloudflare Pages Project ─────────────
async function createCloudflareProject(config: ClientConfig): Promise<string> {
  await log('INFO', 'Step 4: Creating Cloudflare Pages project...');

  const projectName = `perissos-${config.nameLower}`;

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/pages/projects`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: projectName,
        production_branch: 'main',
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Cloudflare API error: ${response.status} ${response.statusText}`);
  }

  // Add rollback action
  rollbackActions.push(async () => {
    await log('INFO', `Rolling back Cloudflare project: ${projectName}`);
    await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/pages/projects/${projectName}`,
      {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}` },
      }
    );
  });

  const cloudflareUrl = `https://${config.nameLower}.perissos.dev`;
  await log('INFO', `Cloudflare Pages project created: ${projectName}`);
  return cloudflareUrl;
}

// ─── Step 5: Send Welcome Email ──────────────────────────
async function sendWelcomeEmail(config: ClientConfig, vercelUrl: string): Promise<void> {
  await log('INFO', 'Step 5: Sending welcome email...');

  // Integration with email service (Resend, SendGrid, etc.)
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Perissos <onboarding@perissos.dev>',
      to: config.email,
      subject: `Welcome to Perissos — Your ${config.name} instance is ready!`,
      html: `
        <h1>Welcome to Perissos, ${config.name}!</h1>
        <p>Your instance has been provisioned and is ready to use.</p>
        <h2>Your Details:</h2>
        <ul>
          <li><strong>Admin Panel:</strong> <a href="${vercelUrl}/admin">${vercelUrl}/admin</a></li>
          <li><strong>Frontend:</strong> <a href="https://${config.nameLower}.perissos.dev">https://${config.nameLower}.perissos.dev</a></li>
          <li><strong>Plan:</strong> ${config.plan}</li>
        </ul>
        <h2>Getting Started:</h2>
        <ol>
          <li>Log in to the admin panel</li>
          <li>Configure your client settings (name, logo, colors)</li>
          <li>Create your first page</li>
          <li>Preview changes in real-time</li>
        </ol>
        <p>Need help? Check our documentation or contact support.</p>
      `,
    }),
  });

  if (!response.ok) {
    await log('WARN', `Welcome email failed: ${response.status}`);
  } else {
    await log('INFO', `Welcome email sent to ${config.email}`);
  }
}

// ─── Helpers ─────────────────────────────────────────────
function generateSecret(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// ─── Main ────────────────────────────────────────────────
async function main(): Promise<ProvisioningResult> {
  const startTime = Date.now();
  const errors: string[] = [];

  await log('INFO', `═══════════════════════════════════════════`);
  await log('INFO', `Provisioning client: ${config.name}`);
  await log('INFO', `Plan: ${config.plan} | Email: ${config.email}`);
  await log('INFO', `═══════════════════════════════════════════`);

  try {
    const databaseUrl = await createNeonDatabase(config);
    await createR2Prefix(config);
    const vercelUrl = await createVercelProject(config, databaseUrl);
    const cloudflareUrl = await createCloudflareProject(config);
    await sendWelcomeEmail(config, vercelUrl);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    await log('INFO', `═══════════════════════════════════════════`);
    await log('INFO', `✅ Provisioning complete in ${elapsed}s`);
    await log('INFO', `Admin:    ${vercelUrl}/admin`);
    await log('INFO', `Frontend: ${cloudflareUrl}`);
    await log('INFO', `═══════════════════════════════════════════`);

    return {
      success: true,
      clientName: config.name,
      databaseUrl,
      vercelUrl,
      cloudflareUrl,
      r2Prefix: `${config.nameLower}/`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(message);
    await log('ERROR', `Provisioning failed: ${message}`);
    await rollback(errors);

    return {
      success: false,
      clientName: config.name,
      errors,
    };
  }
}

main()
  .then(result => {
    if (!result.success) {
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
