"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const next = searchParams.get('next') || '/generate'

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (error) {
        console.error('OAuth error:', error)
        router.push(`/generate?error=${encodeURIComponent(error)}`)
        return
      }

      if (code) {
        try {
          // Exchange the code for a session
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

          if (exchangeError) {
            console.error('Error exchanging code for session:', exchangeError)
            router.push(`/generate?error=${encodeURIComponent(exchangeError.message)}`)
            return
          }

          if (data?.session?.user) {
            // Sync user to database immediately after authentication
            const user = data.session.user
            const email = user.email!
            const name = user.user_metadata?.full_name || 
                         user.user_metadata?.name || 
                         user.user_metadata?.display_name ||
                         email.split('@')[0]

            console.log('🔄 Syncing user immediately after auth:', { id: user.id, email, name })

            // Upsert user to database
            const { error: syncError } = await supabase
              .from('users')
              .upsert({
                id: user.id,
                email,
                name,
                updated_at: new Date().toISOString(),
              }, {
                onConflict: 'id',
                ignoreDuplicates: false
              })

            if (syncError) {
              console.error('⚠️ Error syncing user (will retry in context):', syncError)
              // Don't block redirect - the auth context will retry
            } else {
              console.log('✅ User synced successfully')
            }

            // Wait a bit for the session to be fully established
            await new Promise(resolve => setTimeout(resolve, 500))
            
            // Redirect to the target page
            router.push(next)
          } else {
            router.push('/generate?error=No session created')
          }
        } catch (err) {
          console.error('Error in auth callback:', err)
          router.push(`/generate?error=${encodeURIComponent('Authentication failed')}`)
        }
      } else {
        // No code, just redirect
        router.push('/generate')
      }
    }

    handleAuthCallback()
  }, [code, error, next, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5">
      <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Completing authentication...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

