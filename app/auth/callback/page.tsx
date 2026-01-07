"use client"

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

// Separate component that uses useSearchParams
function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const next = searchParams.get('next') || '/generate'

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (error) {
        router.push(`/generate?error=${encodeURIComponent(error)}`)
        return
      }

      if (code) {
        try {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

          if (exchangeError) {
            router.push(`/generate?error=${encodeURIComponent(exchangeError.message)}`)
            return
          }

          if (data?.session?.user) {
            const user = data.session.user
            const email = user.email!
            const name = user.user_metadata?.full_name || 
                         user.user_metadata?.name || 
                         user.user_metadata?.display_name ||
                         email.split('@')[0]

            // Upsert user to database
            await supabase
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

            // Wait a bit for the session to be fully established
            await new Promise(resolve => setTimeout(resolve, 500))
            
            router.push(next)
          } else {
            router.push('/generate?error=No session created')
          }
        } catch {
          router.push(`/generate?error=${encodeURIComponent('Authentication failed')}`)
        }
      } else {
        router.push('/generate')
      }
    }

    handleAuthCallback()
  }, [code, error, next, router])

  return (
    <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur">
      <CardContent className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Completing authentication...</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Loading fallback component
function LoadingFallback() {
  return (
    <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur">
      <CardContent className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </CardContent>
    </Card>
  )
}

// Main page component with Suspense boundary
export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5">
      <Suspense fallback={<LoadingFallback />}>
        <AuthCallbackContent />
      </Suspense>
    </div>
  )
}
