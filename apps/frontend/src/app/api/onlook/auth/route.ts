import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // Get the current user from the request cookies
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate a JWT token for Onlook that includes the user info
    // This token will be used by Onlook to authenticate the user
    const token = await payload.jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role || 'admin',
      collection: 'users',
      // Add custom claims for Onlook
      onlook: {
        projectPath: 'perissos-frontend',
        permissions: ['read', 'write', 'templates'],
      },
    }, { expiresIn: '24h' })

    const onlookUrl = process.env.NEXT_PUBLIC_ONLOOK_URL || 'http://localhost:3002'

    return NextResponse.json({
      token,
      onlookUrl,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    console.error('Onlook auth error:', error)
    return NextResponse.json({ error: 'Failed to generate Onlook auth token' }, { status: 500 })
  }
}