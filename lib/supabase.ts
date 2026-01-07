/**
 * Supabase Client Configuration
 * Provides database access for OKR application
 */

import { createClient } from '@supabase/supabase-js'
import type { InvitationData } from './types'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use implicit flow for client-side apps (simpler, no PKCE verifier issues)
    // The hash tokens (#access_token=...) will be auto-detected and stripped
    flowType: 'implicit',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// ============================================================================
// Invitation Helper Functions
// ============================================================================

/**
 * Validate invitation token and fetch invitation data
 */
export async function validateInvitationToken(token: string): Promise<InvitationData | null> {
  try {
    console.log('🔍 Validating invitation token:', token)
    
    // Fetch user by invitation token
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('invitation_token', token)
      .single()

    if (userError) {
      console.error('❌ Error fetching user for token:', userError.message, userError.code)
      console.error('Token was:', token)
      return null
    }
    
    if (!user) {
      console.error('❌ No user found for token:', token)
      return null
    }
    
    console.log('✅ Found user:', { id: user.id, email: user.email, role: user.role })

    // Check if invitation is already accepted
    if (user.invitation_accepted_at) {
      console.error('❌ Invitation already accepted at:', user.invitation_accepted_at)
      return null
    }

    // Fetch user's OKRs - try with is_draft first, then without
    let { data: okr, error: okrError } = await supabase
      .from('okr_generations')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_draft', true)
      .single()

    // If no draft OKR found, try to get any OKR for this user
    if (okrError || !okr) {
      console.log('⚠️ No draft OKR found, trying to fetch any OKR for user...')
      const { data: anyOkr, error: anyOkrError } = await supabase
        .from('okr_generations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (anyOkrError || !anyOkr) {
        console.error('❌ No OKR found for user:', user.id, anyOkrError?.message)
        return null
      }
      
      console.log('✅ Found OKR (non-draft):', anyOkr.id)
      okr = anyOkr
    } else {
      console.log('✅ Found draft OKR:', okr.id)
    }

    // Fetch leader info (optional)
    let leader = null
    if (user.invited_by) {
      const { data: leaderData, error: leaderError } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', user.invited_by)
        .single()

      if (!leaderError && leaderData) {
        leader = leaderData
      }
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        invitation_token: user.invitation_token,
        invitation_sent_at: user.invitation_sent_at,
        invitation_accepted_at: user.invitation_accepted_at,
      },
      okr: {
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
      leader,
    }
  } catch (error) {
    console.error('Error validating invitation token:', error)
    return null
  }
}

/**
 * Accept invitation and finalize OKRs
 */
export async function acceptInvitation(token: string): Promise<{ success: boolean; message: string }> {
  try {
    // Get user by token
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('invitation_token', token)
      .single()

    if (userError || !user) {
      return { success: false, message: 'Invalid invitation token' }
    }

    // Check if already accepted
    const { data: existingUser } = await supabase
      .from('users')
      .select('invitation_accepted_at')
      .eq('id', user.id)
      .single()

    if (existingUser?.invitation_accepted_at) {
      return { success: false, message: 'Invitation already accepted' }
    }

    // Update user: mark invitation as accepted
    const { error: updateUserError } = await supabase
      .from('users')
      .update({ invitation_accepted_at: new Date().toISOString() })
      .eq('id', user.id)

    if (updateUserError) {
      console.error('Error updating user:', updateUserError)
      return { success: false, message: 'Failed to accept invitation' }
    }

    // Update OKR: mark as finalized (not draft)
    const { error: updateOkrError } = await supabase
      .from('okr_generations')
      .update({ is_draft: false })
      .eq('user_id', user.id)

    if (updateOkrError) {
      console.error('Error updating OKR:', updateOkrError)
      return { success: false, message: 'Failed to finalize OKRs' }
    }

    return { success: true, message: 'Invitation accepted successfully' }
  } catch (error) {
    console.error('Error accepting invitation:', error)
    return { success: false, message: 'An error occurred while accepting the invitation' }
  }
}

/**
 * Update OKRs for a user (before accepting)
 */
export async function updateDraftOKRs(userId: string, okrs: any): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from('okr_generations')
      .update({ okrs })
      .eq('user_id', userId)
      .eq('is_draft', true)

    if (error) {
      console.error('Error updating OKRs:', error)
      return { success: false, message: 'Failed to update OKRs' }
    }

    return { success: true, message: 'OKRs updated successfully' }
  } catch (error) {
    console.error('Error in updateDraftOKRs:', error)
    return { success: false, message: 'An error occurred while updating OKRs' }
  }
}
