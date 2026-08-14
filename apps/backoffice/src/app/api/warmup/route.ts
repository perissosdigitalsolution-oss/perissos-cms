import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

export async function GET() {
  try {
    const payload = await getPayload({ config });
    // Simple health check - just initialize the connection
    await payload.find({
      collection: 'users',
      limit: 1,
    });
    return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Warmup failed:', error);
    return NextResponse.json({ status: 'error', error: String(error) }, { status: 500 });
  }
}
