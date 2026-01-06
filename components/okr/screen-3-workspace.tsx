"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useOKR } from "@/lib/okr-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  GripVertical,
  Plus,
  Trash2,
  Send,
  Calendar,
  Users,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Loader2,
} from "lucide-react"
import type { Objective } from "@/lib/types"

const generateId = () => Math.random().toString(36).substring(2, 9)

// This screen is for invitees viewing their workspace via a secure link
export function Screen3Workspace() {
  const { leaderOKRs, companyProfile, currentUser, setToastMessage, setCurrentScreen, isLoading, setIsLoading } =
    useOKR()

  // Mock data for the invitee workspace
  const [inviteContext] = useState({
    leaderName: "Jane Doe",
    leaderObjective: leaderOKRs[0]?.title || "Drive company growth",
  })

  const [draftOKRs, setDraftOKRs] = useState<Objective[]>([
    {
      objectiveId: generateId(),
      title: "Support revenue growth through customer success initiatives",
      rank: 1,
      confidence: "medium",
      keyResults: [
        {
          krId: generateId(),
          text: "Achieve 95% customer satisfaction score",
          target: 95,
          unit: "%",
          actual: 0,
          progress: 0,
        },
        { krId: generateId(), text: "Reduce churn rate to under 3%", target: 3, unit: "%", actual: 0, progress: 0 },
        {
          krId: generateId(),
          text: "Complete 50 customer health checks",
          target: 50,
          unit: "checks",
          actual: 0,
          progress: 0,
        },
      ],
    },
  ])

  const [showMeetingModal, setShowMeetingModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [feedbackGiven, setFeedbackGiven] = useState<"up" | "down" | null>(null)

  const updateObjective = (objectiveId: string, field: string, value: string) => {
    setDraftOKRs(draftOKRs.map((obj) => (obj.objectiveId === objectiveId ? { ...obj, [field]: value } : obj)))
  }

  const updateKeyResult = (objectiveId: string, krId: string, field: string, value: string | number) => {
    setDraftOKRs(
      draftOKRs.map((obj) =>
        obj.objectiveId === objectiveId
          ? {
              ...obj,
              keyResults: obj.keyResults.map((kr) => (kr.krId === krId ? { ...kr, [field]: value } : kr)),
            }
          : obj,
      ),
    )
  }

  const addKeyResult = (objectiveId: string) => {
    setDraftOKRs(
      draftOKRs.map((obj) =>
        obj.objectiveId === objectiveId
          ? {
              ...obj,
              keyResults: [
                ...obj.keyResults,
                { krId: generateId(), text: "", target: 100, unit: "%", actual: 0, progress: 0 },
              ],
            }
          : obj,
      ),
    )
  }

  const removeKeyResult = (objectiveId: string, krId: string) => {
    setDraftOKRs(
      draftOKRs.map((obj) =>
        obj.objectiveId === objectiveId ? { ...obj, keyResults: obj.keyResults.filter((kr) => kr.krId !== krId) } : obj,
      ),
    )
  }

  const addObjective = () => {
    setDraftOKRs([
      ...draftOKRs,
      {
        objectiveId: generateId(),
        title: "",
        rank: draftOKRs.length + 1,
        confidence: "medium",
        keyResults: [{ krId: generateId(), text: "", target: 100, unit: "%", actual: 0, progress: 0 }],
      },
    ])
  }

  const handleSubmitForApproval = async () => {
    const hasEmptyObjectives = draftOKRs.some((obj) => !obj.title)
    const hasEmptyKRs = draftOKRs.some((obj) => obj.keyResults.some((kr) => !kr.text))

    if (hasEmptyObjectives || hasEmptyKRs) {
      setToastMessage("Please fill in all objectives and key results before submitting.")
      return
    }

    setIsLoading(true)

    // Simulate API call: POST /api/v1/okr/plan/{planId}/workspaces/{userId}/submit
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsLoading(false)
    setToastMessage("Submitted for leader sign-off.")
  }

  const handleGenerateTalkingPoints = async () => {
    setIsLoading(true)

    // Simulate API call: POST /api/v1/ai/talkingPoints
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsLoading(false)
    setShowMeetingModal(true)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Context Header */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Invited by</p>
              <p className="font-medium">{inviteContext.leaderName}</p>
              <p className="text-sm text-muted-foreground mt-1">Context: {inviteContext.leaderObjective}</p>
            </div>
            <Badge variant="outline">Workspace</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Draft OKRs */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Your OKRs</CardTitle>
              <CardDescription>Review and edit the suggested OKRs for your role.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={addObjective}>
              <Plus className="w-4 h-4 mr-2" />
              Add Objective
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {draftOKRs.map((objective, objIndex) => (
            <div key={objective.objectiveId} className="p-4 rounded-lg border border-border bg-background/50 space-y-4">
              <div className="flex items-start gap-3">
                <GripVertical className="w-5 h-5 text-muted-foreground mt-2 cursor-grab shrink-0" />
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">O{objIndex + 1}</Badge>
                    <Input
                      value={objective.title}
                      onChange={(e) => updateObjective(objective.objectiveId, "title", e.target.value)}
                      placeholder="Enter objective..."
                      className="flex-1"
                    />
                  </div>

                  <div className="space-y-3 pl-4">
                    {objective.keyResults.map((kr, krIndex) => (
                      <div key={kr.krId} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-8 shrink-0">KR{krIndex + 1}</span>
                        <Input
                          value={kr.text}
                          onChange={(e) => updateKeyResult(objective.objectiveId, kr.krId, "text", e.target.value)}
                          placeholder="Key result description..."
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={kr.target}
                          onChange={(e) =>
                            updateKeyResult(objective.objectiveId, kr.krId, "target", Number(e.target.value))
                          }
                          className="w-20"
                        />
                        <Input
                          value={kr.unit}
                          onChange={(e) => updateKeyResult(objective.objectiveId, kr.krId, "unit", e.target.value)}
                          className="w-20"
                        />
                        {objective.keyResults.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeKeyResult(objective.objectiveId, kr.krId)}
                            className="text-muted-foreground hover:text-destructive h-8 w-8"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addKeyResult(objective.objectiveId)}
                      className="text-muted-foreground"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Key Result
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Feedback Widget */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Was this AI draft helpful?</span>
              <Button
                variant="ghost"
                size="icon"
                className={feedbackGiven === "up" ? "text-accent" : "text-muted-foreground"}
                onClick={() => setFeedbackGiven("up")}
              >
                <ThumbsUp className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={feedbackGiven === "down" ? "text-destructive" : "text-muted-foreground"}
                onClick={() => setFeedbackGiven("down")}
              >
                <ThumbsDown className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleSubmitForApproval} disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
          Accept & Save (submit for approval)
        </Button>
        <Button variant="outline" onClick={handleGenerateTalkingPoints}>
          <Calendar className="w-4 h-4 mr-2" />
          Request 1:1 with {inviteContext.leaderName.split(" ")[0]}
        </Button>
        <Button variant="outline" onClick={() => setShowInviteModal(true)}>
          <Users className="w-4 h-4 mr-2" />
          Invite my own direct reports
        </Button>
        <Button variant="outline">
          <Sparkles className="w-4 h-4 mr-2" />
          Generate 1:1 Talking Points
        </Button>
      </div>

      {/* Meeting Modal */}
      <Dialog open={showMeetingModal} onOpenChange={setShowMeetingModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>1:1 Talking Points</DialogTitle>
            <DialogDescription>
              Suggested discussion points for your meeting with {inviteContext.leaderName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 p-4 rounded-lg bg-secondary/30">
            <p className="text-sm font-medium">Review OKR Alignment</p>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
              <li>Discuss how your objectives support the team's strategic goals</li>
              <li>Clarify any questions about target metrics and timelines</li>
              <li>Identify potential blockers or resource needs</li>
              <li>Agree on check-in frequency and communication preferences</li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMeetingModal(false)}>
              Copy to clipboard
            </Button>
            <Button onClick={() => setShowMeetingModal(false)}>Add to calendar invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Your Direct Reports</DialogTitle>
            <DialogDescription>Cascade OKR planning to your team members.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email Addresses</Label>
              <Input placeholder="team@company.com, another@company.com" />
            </div>
            <p className="text-sm text-muted-foreground">
              Each person will receive a link to their own workspace with draft OKRs based on yours.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowInviteModal(false)
                setToastMessage("Invites sent!")
              }}
            >
              Send Invites
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
