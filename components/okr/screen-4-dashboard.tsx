"use client"

import { useState } from "react"
import { useOKR } from "@/lib/okr-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Calendar,
  Copy,
  MessageSquare,
  Link2,
  Download,
  Bot,
  Zap,
  ArrowLeft,
  Loader2,
  CheckCircle,
} from "lucide-react"
import type { Objective, WeeklyUpdate, UpdateSchedule } from "@/lib/types"

const generateId = () => Math.random().toString(36).substring(2, 9)

export function Screen4Dashboard() {
  const {
    leaderOKRs,
    setLeaderOKRs,
    companyProfile,
    weeklyUpdates,
    addWeeklyUpdate,
    updateSchedules,
    addUpdateSchedule,
    setToastMessage,
    setCurrentScreen,
    isLoading,
    setIsLoading,
    invites,
  } = useOKR()

  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showAgentModal, setShowAgentModal] = useState(false)
  const [selectedKR, setSelectedKR] = useState<{ objectiveId: string; krId: string; text: string } | null>(null)

  const [updateForm, setUpdateForm] = useState({
    actualValue: "",
    notes: "",
    evidenceLink: "",
  })

  const [scheduleForm, setScheduleForm] = useState({
    name: "Weekly OKR Update",
    cadence: "weekly",
    dayOfWeek: "monday",
    timeOfDay: "09:00",
  })

  const [agentForm, setAgentForm] = useState({
    agentName: "",
    dataSource: "",
  })

  // Calculate progress for each objective
  const getObjectiveProgress = (objective: Objective) => {
    const totalKRs = objective.keyResults.length
    if (totalKRs === 0) return 0

    const totalProgress = objective.keyResults.reduce((sum, kr) => {
      const progress = (kr.actual / kr.target) * 100
      return sum + Math.min(progress, 100)
    }, 0)

    return Math.round(totalProgress / totalKRs)
  }

  // Get confidence status
  const getKRStatus = (kr: { actual: number; target: number }) => {
    const progress = (kr.actual / kr.target) * 100
    if (progress >= 70) return "on-track"
    if (progress >= 40) return "at-risk"
    return "off-track"
  }

  const handleOpenUpdateModal = (objectiveId: string, krId: string, text: string) => {
    setSelectedKR({ objectiveId, krId, text })
    setUpdateForm({ actualValue: "", notes: "", evidenceLink: "" })
    setShowUpdateModal(true)
  }

  const handleSubmitUpdate = async () => {
    if (!selectedKR || !updateForm.actualValue) return

    setIsLoading(true)

    // Simulate API call: POST /api/v1/okr/plan/{planId}/updates
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newUpdate: WeeklyUpdate = {
      updateId: generateId(),
      planId: "plan-1",
      objectiveId: selectedKR.objectiveId,
      krId: selectedKR.krId,
      actualValue: Number(updateForm.actualValue),
      notes: updateForm.notes,
      evidenceLink: updateForm.evidenceLink,
      createdAt: new Date().toISOString(),
    }

    // Update the actual value in the leaderOKRs
    setLeaderOKRs(
      leaderOKRs.map((obj) =>
        obj.objectiveId === selectedKR.objectiveId
          ? {
              ...obj,
              keyResults: obj.keyResults.map((kr) =>
                kr.krId === selectedKR.krId
                  ? {
                      ...kr,
                      actual: Number(updateForm.actualValue),
                      progress: Math.min(
                        Math.round((Number(updateForm.actualValue) / kr.target) * 100),
                        100
                      ),
                    }
                  : kr
              ),
            }
          : obj
      )
    )

    addWeeklyUpdate(newUpdate)
    setIsLoading(false)
    setShowUpdateModal(false)
    setToastMessage("Update saved.")
  }

  const handleCreateSchedule = async () => {
    setIsLoading(true)

    // Simulate API call: POST /api/v1/updateSchedules
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newSchedule: UpdateSchedule = {
      scheduleId: generateId(),
      planId: "plan-1",
      name: scheduleForm.name,
      cadence: scheduleForm.cadence as "weekly" | "biweekly" | "monthly",
      dayOfWeek: scheduleForm.dayOfWeek,
      timeOfDay: scheduleForm.timeOfDay,
      participants: [],
      nextRunAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }

    addUpdateSchedule(newSchedule)
    setIsLoading(false)
    setShowScheduleModal(false)
    setToastMessage(`Update schedule active — next run ${new Date(newSchedule.nextRunAt).toLocaleDateString()}`)
  }

  const handleDeployAgent = async () => {
    if (!agentForm.agentName || !agentForm.dataSource) return

    setIsLoading(true)

    // Simulate API call: POST /api/v1/agents/deploy
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsLoading(false)
    setShowAgentModal(false)
    setToastMessage("Agent provisioning started. We'll notify you when it's ready.")
  }

  // Overall progress
  const overallProgress =
    leaderOKRs.length > 0
      ? Math.round(leaderOKRs.reduce((sum, obj) => sum + getObjectiveProgress(obj), 0) / leaderOKRs.length)
      : 0

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Plan vs. Actuals Dashboard</h2>
          <p className="text-muted-foreground">
            {companyProfile?.name} — {leaderOKRs.length} Objectives
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentScreen("edit-invite")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Edit
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/50 bg-card/50">
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
        <Card className="border-border/50 bg-card/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Team Members</p>
                <p className="text-3xl font-bold">{invites.length || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-accent/10">
                <CheckCircle className="w-6 h-6 text-accent" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              {invites.filter((i) => i.status === "accepted").length} accepted invites
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Updates This Week</p>
                <p className="text-3xl font-bold">{weeklyUpdates.length}</p>
              </div>
              <div className="p-3 rounded-full bg-chart-4/10">
                <RefreshCw className="w-6 h-6 text-chart-4" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              {updateSchedules.length > 0 ? `Next scheduled: ${updateSchedules[0].dayOfWeek}` : "No schedule set"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* OKR Details */}
      <Tabs defaultValue="objectives" className="w-full">
        <TabsList>
          <TabsTrigger value="objectives">Objectives</TabsTrigger>
          <TabsTrigger value="activity">Activity Feed</TabsTrigger>
        </TabsList>

        <TabsContent value="objectives" className="space-y-4 mt-4">
          {leaderOKRs.map((objective, objIndex) => (
            <Card key={objective.objectiveId} className="border-border/50 bg-card/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">O{objIndex + 1}</Badge>
                    <CardTitle className="text-lg">{objective.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{getObjectiveProgress(objective)}%</span>
                    <Progress value={getObjectiveProgress(objective)} className="w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {objective.keyResults.map((kr, krIndex) => {
                    const status = getKRStatus(kr)
                    const progress = Math.round((kr.actual / kr.target) * 100)

                    return (
                      <div
                        key={kr.krId}
                        className="flex items-center gap-4 p-3 rounded-lg bg-background/50 border border-border/50"
                      >
                        <span className="text-xs text-muted-foreground w-8">KR{krIndex + 1}</span>
                        <div className="flex-1">
                          <p className="text-sm">{kr.text}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {kr.actual} / {kr.target} {kr.unit}
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
                            onClick={() => handleOpenUpdateModal(objective.objectiveId, kr.krId, kr.text)}
                          >
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
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-6">
              {weeklyUpdates.length > 0 ? (
                <div className="space-y-4">
                  {weeklyUpdates.map((update) => (
                    <div key={update.updateId} className="flex gap-4 pb-4 border-b border-border last:border-0">
                      <div className="p-2 rounded-full bg-primary/10 h-fit">
                        <RefreshCw className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm">
                          Updated KR to <span className="font-medium">{update.actualValue}</span>
                        </p>
                        {update.notes && <p className="text-sm text-muted-foreground mt-1">{update.notes}</p>}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(update.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <RefreshCw className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No updates yet. Start tracking progress by updating your key results.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => setShowScheduleModal(true)}>
          <Calendar className="w-4 h-4 mr-2" />
          Schedule Updates
        </Button>
        <Button variant="outline">
          <Copy className="w-4 h-4 mr-2" />
          Copy Weekly Update
        </Button>
        <Button variant="outline">
          <MessageSquare className="w-4 h-4 mr-2" />
          Post to Slack
        </Button>
        <Button variant="outline">
          <Link2 className="w-4 h-4 mr-2" />
          Share Dashboard Link
        </Button>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        <Button
          onClick={() => setShowAgentModal(true)}
          className="ml-auto bg-gradient-to-r from-primary to-accent text-primary-foreground"
        >
          <Bot className="w-4 h-4 mr-2" />
          Deploy Agent to Auto-Track
        </Button>
      </div>

      {/* Update Modal */}
      <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Progress</DialogTitle>
            <DialogDescription>{selectedKR?.text}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Actual Value</Label>
              <Input
                type="number"
                placeholder="Enter current value"
                value={updateForm.actualValue}
                onChange={(e) => setUpdateForm({ ...updateForm, actualValue: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="What progress was made?"
                value={updateForm.notes}
                onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Evidence Link (optional)</Label>
              <Input
                type="url"
                placeholder="https://..."
                value={updateForm.evidenceLink}
                onChange={(e) => setUpdateForm({ ...updateForm, evidenceLink: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitUpdate} disabled={isLoading || !updateForm.actualValue}>
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Modal */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Updates</DialogTitle>
            <DialogDescription>Set up recurring reminders for your team to update progress.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Schedule Name</Label>
              <Input
                value={scheduleForm.name}
                onChange={(e) => setScheduleForm({ ...scheduleForm, name: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Cadence</Label>
                <Select
                  value={scheduleForm.cadence}
                  onValueChange={(value) => setScheduleForm({ ...scheduleForm, cadence: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Day</Label>
                <Select
                  value={scheduleForm.dayOfWeek}
                  onValueChange={(value) => setScheduleForm({ ...scheduleForm, dayOfWeek: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="tuesday">Tuesday</SelectItem>
                    <SelectItem value="wednesday">Wednesday</SelectItem>
                    <SelectItem value="thursday">Thursday</SelectItem>
                    <SelectItem value="friday">Friday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSchedule} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Create Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Agent Deployment Modal */}
      <Dialog open={showAgentModal} onOpenChange={setShowAgentModal}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 w-fit mb-4">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-center">Deploy Lamatic Agent</DialogTitle>
            <DialogDescription className="text-center">
              Automatically track KR progress by connecting to your data sources.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Agent Name</Label>
              <Input
                placeholder="e.g., Revenue Tracker"
                value={agentForm.agentName}
                onChange={(e) => setAgentForm({ ...agentForm, agentName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Data Source</Label>
              <Select
                value={agentForm.dataSource}
                onValueChange={(value) => setAgentForm({ ...agentForm, dataSource: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a connector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google_analytics">Google Analytics</SelectItem>
                  <SelectItem value="hubspot">HubSpot</SelectItem>
                  <SelectItem value="salesforce">Salesforce</SelectItem>
                  <SelectItem value="slack">Slack</SelectItem>
                  <SelectItem value="snowflake">Snowflake</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Powered by Lamatic</p>
                  <p className="text-sm text-muted-foreground">
                    Your agent will poll data every 15 minutes and automatically update your KR actuals.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAgentModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDeployAgent}
              disabled={isLoading || !agentForm.agentName || !agentForm.dataSource}
              className="bg-gradient-to-r from-primary to-accent"
            >
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bot className="w-4 h-4 mr-2" />}
              Deploy Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
