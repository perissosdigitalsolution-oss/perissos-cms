import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  try {
    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'marketplace-templates',
      pagination: false,
      depth: 0,
    })

    const categories = [...new Set(result.docs.map(doc => doc.category))]

    return NextResponse.json({
      categories: ['all', ...categories],
    })
  } catch (error: any) {
    console.error('Marketplace categories error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}