import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payload = await getPayload({ config })
    const body = await request.json()
    const { version } = body

    if (!version) {
      return NextResponse.json(
        { error: 'Version is required' },
        { status: 400 }
      )
    }

    const template = await payload.findByID({
      collection: 'templates',
      id: Number(id),
      depth: 1,
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    const availableVersions = template.availableVersions || []
    const targetVersion = availableVersions.find((v: any) => v.version === version)

    if (!targetVersion) {
      return NextResponse.json(
        { error: `Version ${version} not found in available versions` },
        { status: 404 }
      )
    }

    const serverURL = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:3000'
    const cookieHeader = request.headers.get('cookie') || ''
    const authHeader = request.headers.get('authorization') || ''

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (authHeader) headers['Authorization'] = authHeader
    if (cookieHeader) headers['Cookie'] = cookieHeader

    const updateData: Record<string, any> = {
      version: targetVersion.version,
      installedVersion: targetVersion.version,
    }

    if (targetVersion.layoutConfig) {
      updateData.layoutConfig = targetVersion.layoutConfig
    }

    if (targetVersion.zipFile) {
      updateData.zipFile = typeof targetVersion.zipFile === 'object'
        ? targetVersion.zipFile.id
        : targetVersion.zipFile
    }

    const updateResponse = await fetch(`${serverURL}/api/templates/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updateData),
    })

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json()
      console.error('Rollback update failed:', JSON.stringify(errorData))
      return NextResponse.json(
        { error: 'Failed to rollback template', details: errorData },
        { status: 500 }
      )
    }

    const updatedTemplate = await updateResponse.json()

    return NextResponse.json({
      success: true,
      template: updatedTemplate.doc,
      message: `Rolled back to version ${version}`,
    })
  } catch (error: any) {
    console.error('Rollback error:', error)
    return NextResponse.json(
      { error: 'Failed to rollback template' },
      { status: 500 }
    )
  }
}
