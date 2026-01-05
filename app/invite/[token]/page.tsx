"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, Mail, Calendar, Building2, Target } from "lucide-react"
import type { InvitationData } from "@/lib/types"

export default function InvitationPage() {
  const params = useParams()
  const router = useRouter()
  const token = Array.isArray(params.token) ? params.token[0] : (params.token as string)

  const [invitationData, setInvitationData] = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accepted, setAccepted] = useState(false)

  // Fetch invitation data
  useEffect(() => {
    async function fetchInvitation() {
      try {
        const response = await fetch(`/api/invite/${token}`)
        const data = await response.json()

        if (!response.ok || !data.success) {
          setError(data.error || "Invalid invitation link")
          setLoading(false)
          return
        }

        setInvitationData(data.data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching invitation:", err)
        setError("Failed to load invitation. Please try again.")
        setLoading(false)
      }
    }

    if (token) {
      fetchInvitation()
    }
  }, [token])

  // Handle accept invitation
  const handleAccept = async () => {
    setAccepting(true)

    try {
      const response = await fetch("/api/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.error || "Failed to accept invitation")
        setAccepting(false)
        return
      }

      // Store user ID in localStorage for dashboard access
      if (invitationData?.user.id) {
        localStorage.setItem("userId", invitationData.user.id)
      }

      setAccepted(true)
      setAccepting(false)
    } catch (err) {
      console.error("Error accepting invitation:", err)
      setError("Failed to accept invitation. Please try again.")
      setAccepting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5">
        <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Loading invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error || !invitationData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-destructive/5">
        <Card className="w-full max-w-md border-destructive/50 bg-card/50 backdrop-blur">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="mx-auto p-3 rounded-full bg-destructive/10 w-fit">
                <XCircle className="w-12 h-12 text-destructive" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Invalid Invitation</h2>
                <p className="text-muted-foreground">{error || "This invitation link is invalid or has expired."}</p>
              </div>
              <Button variant="outline" onClick={() => router.push("/dashboard")}>
                Return Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state (after accepting)
  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5">
        <Card className="w-full max-w-md border-accent/50 bg-card/50 backdrop-blur">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="mx-auto p-3 rounded-full bg-accent/10 w-fit">
                <CheckCircle className="w-12 h-12 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Welcome Aboard!</h2>
                <p className="text-muted-foreground">
                  You've successfully accepted your OKRs for {invitationData.okr.company_name}.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Your objectives are now finalized and ready to track.
                </p>
              </div>
              <Button onClick={() => router.push("/dashboard")}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main invitation view
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl">You've been invited!</CardTitle>
                <CardDescription>
                  {invitationData.leader?.name || "Your leader"} has invited you to join the OKR planning for{" "}
                  {invitationData.okr.company_name}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-accent border-accent/30">
                Draft OKRs
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{invitationData.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Role</p>
                  <p className="text-sm text-muted-foreground">{invitationData.user.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Company</p>
                  <p className="text-sm text-muted-foreground">{invitationData.okr.company_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Planning Period</p>
                  <p className="text-sm text-muted-foreground">{invitationData.okr.planning_period}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strategic Narrative */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">Your Strategic Context</CardTitle>
            <CardDescription>How your work contributes to the overall strategy</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
              {invitationData.okr.strategic_narrative}
            </p>
          </CardContent>
        </Card>

        {/* Objectives */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">Your Objectives & Key Results</CardTitle>
            <CardDescription>
              {Array.isArray(invitationData.okr.okrs) ? invitationData.okr.okrs.length : 0} objectives proposed for you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.isArray(invitationData.okr.okrs) &&
              invitationData.okr.okrs.map((objective: any, objIndex: number) => (
                <div key={objIndex} className="p-4 rounded-lg border border-border bg-background/50">
                  <div className="flex items-start gap-3 mb-3">
                    <Badge variant="secondary">O{objIndex + 1}</Badge>
                    <div className="flex-1">
                      <h3 className="font-medium">{objective.title}</h3>
                      {objective.description && (
                        <p className="text-sm text-muted-foreground mt-1">{objective.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 pl-4">
                    {Array.isArray(objective.key_results) &&
                      objective.key_results.map((kr: any, krIndex: number) => (
                        <div key={krIndex} className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground w-8">KR{krIndex + 1}</span>
                          <span className="flex-1 text-muted-foreground">{kr.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {kr.baseline_value} → {kr.target_value} {kr.unit}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={() => router.push("/")} disabled={accepting}>
                Decline
              </Button>
              <Button onClick={handleAccept} disabled={accepting} size="lg" className="min-w-[200px]">
                {accepting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accept OKRs
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">
              By accepting, you confirm these objectives and commit to working towards these goals for{" "}
              {invitationData.okr.planning_period}.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
