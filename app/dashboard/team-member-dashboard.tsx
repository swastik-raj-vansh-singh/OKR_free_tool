"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Loader2,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Building2,
  User,
  RefreshCw,
  CheckCircle,
  ArrowLeft,
} from "lucide-react"

interface KeyResult {
  title: string
  baseline_value: number
  target_value: number
  unit: string
  current_value?: number
}

interface Objective {
  title: string
  description: string
  key_results: KeyResult[]
}

interface UserOKRData {
  user: {
    id: string
    name: string
    email: string
    role: string
  }
  okr: {
    id: string
    company_name: string
    planning_period: string
    strategic_narrative: string
    okrs: Objective[]
    is_draft: boolean
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<UserOKRData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [selectedKR, setSelectedKR] = useState<{
    objectiveIndex: number
    krIndex: number
    kr: KeyResult
  } | null>(null)
  const [updateValue, setUpdateValue] = useState("")
  const [updateNotes, setUpdateNotes] = useState("")

  // For demo purposes, try to get user ID from localStorage or URL
  // In production, you'd use proper authentication
  useEffect(() => {
    async function fetchUserData() {
      try {
        // Try to get user ID from localStorage (set during invitation acceptance)
        const userId = localStorage.getItem("userId")

        if (!userId) {
          // If no user ID, redirect to home
          setError("Please log in to view your dashboard")
          setLoading(false)
          return
        }

        // Fetch user's OKR data
        const response = await fetch(`/api/okr/${userId}`)

        // Check if response is OK before parsing JSON
        if (!response.ok) {
          setError("Failed to load your OKRs")
          setLoading(false)
          return
        }

        const data = await response.json()

        if (!data.success) {
          setError(data.error || "Failed to load your OKRs")
          setLoading(false)
          return
        }

        // Parse OKRs if they're stored as string
        const okrData = {
          user: data.data.user,
          okr: {
            id: data.data.id,
            company_name: data.data.company_name,
            planning_period: data.data.planning_period,
            strategic_narrative: data.data.strategic_narrative,
            is_draft: data.data.is_draft,
            okrs: typeof data.data.okrs === "string"
              ? JSON.parse(data.data.okrs)
              : data.data.okrs,
          }
        }

        setUserData(okrData)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard. Please try again.")
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const getKRProgress = (kr: KeyResult) => {
    const current = kr.current_value ?? kr.baseline_value
    const total = kr.target_value
    if (total === 0) return 0
    return Math.min(Math.round((current / total) * 100), 100)
  }

  const getKRStatus = (kr: KeyResult) => {
    const progress = getKRProgress(kr)
    if (progress >= 70) return "on-track"
    if (progress >= 40) return "at-risk"
    return "off-track"
  }

  const getObjectiveProgress = (objective: Objective) => {
    if (!objective.key_results || objective.key_results.length === 0) return 0
    const totalProgress = objective.key_results.reduce((sum, kr) => sum + getKRProgress(kr), 0)
    return Math.round(totalProgress / objective.key_results.length)
  }

  const getOverallProgress = () => {
    if (!userData?.okr.okrs || userData.okr.okrs.length === 0) return 0
    const totalProgress = userData.okr.okrs.reduce((sum, obj) => sum + getObjectiveProgress(obj), 0)
    return Math.round(totalProgress / userData.okr.okrs.length)
  }

  const handleOpenUpdateModal = (objectiveIndex: number, krIndex: number, kr: KeyResult) => {
    setSelectedKR({ objectiveIndex, krIndex, kr })
    setUpdateValue(String(kr.current_value ?? kr.baseline_value))
    setUpdateNotes("")
    setShowUpdateModal(true)
  }

  const handleSubmitUpdate = async () => {
    if (!selectedKR || !userData) return

    // In a real app, you'd save this to the database
    // For now, just update the local state
    const updatedOKRs = [...userData.okr.okrs]
    updatedOKRs[selectedKR.objectiveIndex].key_results[selectedKR.krIndex] = {
      ...selectedKR.kr,
      current_value: Number(updateValue),
    }

    setUserData({
      ...userData,
      okr: {
        ...userData.okr,
        okrs: updatedOKRs,
      },
    })

    setShowUpdateModal(false)
    // In production, you'd call an API to save the update
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5">
        <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Loading your dashboard...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-destructive/5">
        <Card className="w-full max-w-md border-destructive/50 bg-card/50 backdrop-blur">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="mx-auto p-3 rounded-full bg-destructive/10 w-fit">
                <Target className="w-12 h-12 text-destructive" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Unable to Load Dashboard</h2>
                <p className="text-muted-foreground">{error || "Please check your invitation link."}</p>
              </div>
              <Button variant="outline" onClick={() => {
                localStorage.removeItem("userId")
                router.push("/")
              }}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const overallProgress = getOverallProgress()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-3xl">My OKR Dashboard</CardTitle>
                <CardDescription className="text-base">
                  Track your objectives and key results for {userData.okr.planning_period}
                </CardDescription>
              </div>
              {userData.okr.is_draft && (
                <Badge variant="outline" className="text-accent border-accent/30">
                  Draft
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm text-muted-foreground">{userData.user.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Role</p>
                  <p className="text-sm text-muted-foreground">{userData.user.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Company</p>
                  <p className="text-sm text-muted-foreground">{userData.okr.company_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Period</p>
                  <p className="text-sm text-muted-foreground">{userData.okr.planning_period}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strategic Context */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">Strategic Context</CardTitle>
            <CardDescription>How your work contributes to the overall strategy</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
              {userData.okr.strategic_narrative}
            </p>
          </CardContent>
        </Card>

        {/* Progress Summary */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Progress</p>
                  <p className="text-3xl font-bold">{overallProgress}%</p>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
              </div>
              <Progress value={overallProgress} className="mt-4" />
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Objectives</p>
                  <p className="text-3xl font-bold">{userData.okr.okrs.length}</p>
                </div>
                <div className="p-3 rounded-full bg-accent/10">
                  <Target className="w-6 h-6 text-accent" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                {userData.okr.okrs.reduce((sum, obj) => sum + obj.key_results.length, 0)} key results
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">On Track</p>
                  <p className="text-3xl font-bold">
                    {userData.okr.okrs.reduce((sum, obj) => {
                      const onTrack = obj.key_results.filter(kr => getKRStatus(kr) === "on-track").length
                      return sum + onTrack
                    }, 0)}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-accent/10">
                  <CheckCircle className="w-6 h-6 text-accent" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                {userData.okr.okrs.reduce((sum, obj) => {
                  const atRisk = obj.key_results.filter(kr => getKRStatus(kr) !== "on-track").length
                  return sum + atRisk
                }, 0)}{" "}
                need attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Objectives & Key Results */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Objectives & Key Results</h2>
          {userData.okr.okrs.map((objective, objIndex) => (
            <Card key={objIndex} className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">O{objIndex + 1}</Badge>
                    <div>
                      <CardTitle className="text-lg">{objective.title}</CardTitle>
                      {objective.description && (
                        <CardDescription className="mt-1">{objective.description}</CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{getObjectiveProgress(objective)}%</span>
                    <Progress value={getObjectiveProgress(objective)} className="w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {objective.key_results.map((kr, krIndex) => {
                    const status = getKRStatus(kr)
                    const progress = getKRProgress(kr)
                    const current = kr.current_value ?? kr.baseline_value

                    return (
                      <div
                        key={krIndex}
                        className="flex items-center gap-4 p-3 rounded-lg bg-background/50 border border-border/50"
                      >
                        <span className="text-xs text-muted-foreground w-8">KR{krIndex + 1}</span>
                        <div className="flex-1">
                          <p className="text-sm">{kr.title}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {current} / {kr.target_value} {kr.unit}
                            </span>
                            <Progress value={progress} className="w-32 h-1.5" />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {status === "on-track" && (
                            <Badge variant="outline" className="text-accent border-accent/30 gap-1">
                              <TrendingUp className="w-3 h-3" />
                              On track
                            </Badge>
                          )}
                          {status === "at-risk" && (
                            <Badge variant="outline" className="text-chart-4 border-chart-4/30 gap-1">
                              <Minus className="w-3 h-3" />
                              At risk
                            </Badge>
                          )}
                          {status === "off-track" && (
                            <Badge variant="outline" className="text-destructive border-destructive/30 gap-1">
                              <TrendingDown className="w-3 h-3" />
                              Off track
                            </Badge>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenUpdateModal(objIndex, krIndex, kr)}
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Update
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Update Modal */}
        <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Progress</DialogTitle>
              <DialogDescription>{selectedKR?.kr.title}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Current Value</Label>
                <Input
                  type="number"
                  placeholder="Enter current value"
                  value={updateValue}
                  onChange={(e) => setUpdateValue(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Target: {selectedKR?.kr.target_value} {selectedKR?.kr.unit}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  placeholder="What progress was made?"
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUpdateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitUpdate} disabled={!updateValue}>
                Save Update
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
