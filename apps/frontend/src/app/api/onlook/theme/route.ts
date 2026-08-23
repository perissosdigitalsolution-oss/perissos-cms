import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // Get the current user
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { theme, action } = body // action: 'push' | 'pull'

    if (action === 'push') {
      // Push theme from Perissos to Onlook
      // Store theme in a global setting or user preference
      await payload.updateGlobal({
        slug: 'clientSettings',
        data: {
          onlookTheme: theme,
          onlookThemeUpdatedAt: new Date().toISOString(),
        },
      })

      return NextResponse.json({ success: true, message: 'Theme pushed to Onlook' })
    } else if (action === 'pull') {
      // Pull theme from Onlook (stored in global settings)
      const settings = await payload.findGlobal({ slug: 'clientSettings' })
      const onlookTheme = settings.onlookTheme || null

      return NextResponse.json({ theme: onlookTheme })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Onlook theme sync error:', error)
    return NextResponse.json({ error: 'Failed to sync theme' }, { status: 500 })
  }
}