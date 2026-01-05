/**
 * API Route: GET /api/invite/[token]
 * Validates invitation token and returns invitation data
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateInvitationToken } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token) {
      return NextResponse.json(
        { error: 'Invitation token is required' },
        { status: 400 }
      )
    }

    // Validate token and fetch invitation data
    const invitationData = await validateInvitationToken(token)

    if (!invitationData) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation token' },
        { status: 404 }
      )
    }

    // Return invitation data
    return NextResponse.json({
      success: true,
      data: invitationData,
    })
  } catch (error) {
    console.error('Error validating invitation token:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
