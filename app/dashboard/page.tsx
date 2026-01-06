"use client"

import { useEffect, useState } from "react"
import { useOKR } from "@/lib/okr-context"
import { Screen4Dashboard } from "@/components/okr/screen-4-dashboard"
import TeamMemberDashboard from "./team-member-dashboard"

export default function DashboardPage() {
  const { leaderOKRs, currentUser } = useOKR()
  const [isLeader, setIsLeader] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if this is a leader (has OKRs in context) or team member (has userId in localStorage)
    const hasLeaderOKRs = leaderOKRs.length > 0
    const hasTeamMemberSession = typeof window !== 'undefined' && localStorage.getItem("userId")

    // Leader takes priority
    if (hasLeaderOKRs) {
      setIsLeader(true)
    } else if (hasTeamMemberSession) {
      setIsLeader(false)
    } else {
      // No data available, will show error in team member dashboard
      setIsLeader(false)
    }
  }, [leaderOKRs])

  if (isLeader === null) {
    return null // Loading state
  }

  // Show leader's dashboard if they have OKRs
  if (isLeader) {
    return (
      <main className="px-4 py-8">
        <Screen4Dashboard />
      </main>
    )
  }

  // Show team member's dashboard
  return <TeamMemberDashboard />
}
