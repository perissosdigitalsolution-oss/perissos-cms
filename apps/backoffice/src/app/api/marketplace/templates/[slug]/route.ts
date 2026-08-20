import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'marketplace-templates',
      where: {
        slug: { equals: slug },
      },
      limit: 1,
      depth: 1,
    })

    if (result.docs.length === 0) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result.docs[0])
  } catch (error: any) {
    console.error('Marketplace template detail error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch template details' },
      { status: 500 }
    )
  }
}