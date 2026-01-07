/**
 * API Route: GET /api/okr/[userId]
 * Fetches OKR data for a specific user
 * Now supports both authenticated users and legacy user IDs
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Try to get authenticated user from session
    const authHeader = request.headers.get('authorization')
    let authenticatedUserId: string | null = null

    if (authHeader) {
      // If authorization header is provided, verify the session
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabase.auth.getUser(token)
      if (user) {
        authenticatedUserId = user.id
      }
    }

    // Use authenticated user ID if available, otherwise use provided userId
    const targetUserId = authenticatedUserId || userId

    // Fetch user info first
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', targetUserId)
      .single()

    if (userError || !user) {
      console.error('User not found:', targetUserId, userError)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch user's OKRs (fetch both draft and finalized)
    const { data: okr, error: okrError } = await supabase
      .from('okr_generations')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (okrError || !okr) {
      console.error('OKR not found for user:', targetUserId, okrError)
      return NextResponse.json(
        { error: 'OKR not found for user' },
        { status: 404 }
      )
    }

    // Return OKR data with user info
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        id: okr.id,
        user_id: okr.user_id,
        website_url: okr.website_url,
        company_name: okr.company_name,
        planning_period: okr.planning_period,
        strategic_narrative: okr.strategic_narrative,
        okrs: okr.okrs,
        is_draft: okr.is_draft,
        created_at: okr.created_at,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/okr/[userId]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
