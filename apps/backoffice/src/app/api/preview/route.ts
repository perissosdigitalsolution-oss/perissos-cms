import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { SignJWT } from 'jose';

const SECRET = new TextEncoder().encode(process.env.PREVIEW_SECRET || 'fallback-secret-change-in-production');

export async function POST(request: NextRequest) {
  try {
    const { collection, slug } = await request.json();

    if (!collection || !slug) {
      return NextResponse.json({ error: 'Missing collection or slug' }, { status: 400 });
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const payload = await getPayload({ config });
    
    // Verify user exists and has permission
    const { docs: users } = await payload.find({
      collection: 'users',
      where: { email: { equals: token } },
    });

    if (!users.length) {
      return NextResponse.json({ error: 'Invalid user' }, { status: 401 });
    }

    // Generate short-lived preview JWT (15 minutes)
    const previewToken = await new SignJWT({
      collection,
      slug,
      nonce: crypto.randomUUID(),
      iat: Math.floor(Date.now() / 1000),
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('15m')
      .sign(SECRET);

    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://preview.perissos.dev';
    const previewUrl = `${frontendUrl}/preview?token=${previewToken}`;

    return NextResponse.json({ url: previewUrl });
  } catch (error) {
    console.error('Preview token generation failed:', error);
    return NextResponse.json({ error: 'Failed to generate preview' }, { status: 500 });
  }
}
