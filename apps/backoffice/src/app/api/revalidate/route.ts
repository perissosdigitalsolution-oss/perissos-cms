import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { collection, slug } = body;

    if (!collection || !slug) {
      return NextResponse.json({ error: 'Missing collection or slug' }, { status: 400 });
    }

    // Verify revalidation secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.REVALIDATION_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await getPayload({ config });

    // Trigger Cloudflare Pages rebuild
    if (process.env.CLOUDFLARE_REBUILD_WEBHOOK) {
      await fetch(process.env.CLOUDFLARE_REBUILD_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection, slug }),
      }).catch(err => console.error('Cloudflare rebuild failed:', err));
    }

    return NextResponse.json({ revalidated: true, collection, slug });
  } catch (error) {
    console.error('Revalidation failed:', error);
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 });
  }
}
