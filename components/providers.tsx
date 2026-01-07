"use client"

import { OKRProvider } from "@/lib/okr-context"
import { AuthProvider } from "@/lib/auth-context"
import { AppHeader } from "@/components/okr/app-header"
import { ToastNotification } from "@/components/okr/toast-notification"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <OKRProvider>
        <div className="min-h-screen bg-background">
          <AppHeader />
          <ToastNotification />
          {children}
        </div>
      </OKRProvider>
    </AuthProvider>
  )
}
