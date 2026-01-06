"use client"

import { OKRProvider } from "@/lib/okr-context"
import { AppHeader } from "@/components/okr/app-header"
import { ToastNotification } from "@/components/okr/toast-notification"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <OKRProvider>
      <div className="min-h-screen bg-background">
        <AppHeader />
        <ToastNotification />
        {children}
      </div>
    </OKRProvider>
  )
}
