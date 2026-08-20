import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const isPremium = searchParams.get('isPremium')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || '-createdAt'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    const payload = await getPayload({ config })

    const where: any = {}

    if (category && category !== 'all') {
      where.category = { equals: category }
    }

    if (isPremium !== null) {
      where.isPremium = { equals: isPremium === 'true' }
    }

    if (search) {
      where.or = [
        { name: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
      ]
    }

    const result = await payload.find({
      collection: 'marketplace-templates',
      where,
      sort,
      page,
      limit,
      depth: 0,
    })

    return NextResponse.json({
      docs: result.docs,
      totalDocs: result.totalDocs,
      limit: result.limit,
      totalPages: result.totalPages,
      page: result.page,
      pagingCounter: result.pagingCounter,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
    })
  } catch (error: any) {
    console.error('Marketplace fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch marketplace templates' },
      { status: 500 }
    )
  }
}