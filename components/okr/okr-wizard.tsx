"use client"

import { useOKR } from "@/lib/okr-context"
import { AppHeader } from "./app-header"
import { ToastNotification } from "./toast-notification"
import { Screen1Kickoff } from "./screen-1-kickoff"
import { Screen2EditInvite } from "./screen-2-edit-invite"
import { Screen3Workspace } from "./screen-3-workspace"
import { Screen4Dashboard } from "./screen-4-dashboard"

export function OKRWizard() {
  const { currentScreen } = useOKR()

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <ToastNotification />

      <main className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Title Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-balance">OKR Autopilot</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-balance">
              Free AI-powered OKR tool that creates alignment and weekly accountability across your team with zero overhead.
            </p>
          </div>

          {/* Screen Content */}
          {currentScreen === "kickoff" && <Screen1Kickoff />}
          {currentScreen === "edit-invite" && <Screen2EditInvite />}
          {currentScreen === "workspace" && <Screen3Workspace />}
          {currentScreen === "dashboard" && <Screen4Dashboard />}
        </div>
      </main>
    </div>
  )
}
