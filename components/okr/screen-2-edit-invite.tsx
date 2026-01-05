"use client"

import { useState } from "react"
import { useOKR } from "@/lib/okr-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
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
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Mail,
  Sparkles,
  Eye,
  Users,
  Send,
  Loader2,
  CheckCircle,
  Copy,
  Download,
  FileText,
  Table,
  Code,
  FileDown,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import type { Invite, Objective } from "@/lib/types"
import { inviteTeamMembers, sendInvitationEmails, type LamaticObjective } from "@/lib/lamatic-api"
import { LoadingWithFacts } from "./loading-with-facts"

const generateId = () => Math.random().toString(36).substring(2, 9)

// Email validation function
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

interface InviteEntry {
  id: string
  name: string
  email: string
  roleTitle: string
  includeDraftOKRs: boolean
  personalMessage: string
  draftOKRs?: Objective[]
  // Store Flow 5 response data
  userId?: string
  okrId?: string
  invitationToken?: string
  strategicNarrative?: string
  generatedOKRs?: any[] // Full OKR data from Flow 5
  objectivesCount?: number
  keyResultsCount?: number
}

export function Screen2EditInvite() {
  const {
    leaderOKRs,
    shareableSummary,
    companyProfile,
    planningPeriod,
    setCurrentScreen,
    setInvites,
    setToastMessage,
    isLoading,
    setIsLoading,
    currentUser,
  } = useOKR()

  const [inviteEntries, setInviteEntries] = useState<InviteEntry[]>([
    {
      id: generateId(),
      name: "Swastik",
      email: "swastikrajvanshsingh0@gmail.com",
      roleTitle: "full time employ",
      includeDraftOKRs: true,
      personalMessage: "",
    }
  ])
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [sentInvites, setSentInvites] = useState<Invite[]>([])

  const addInviteEntry = () => {
    setInviteEntries([
      ...inviteEntries,
      {
        id: generateId(),
        name: "",
        email: "",
        roleTitle: "",
        includeDraftOKRs: true,
        personalMessage: "",
      },
    ])
  }

  const updateInviteEntry = (id: string, field: string, value: string | boolean) => {
    setInviteEntries(inviteEntries.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)))
  }

  const removeInviteEntry = (id: string) => {
    setInviteEntries(inviteEntries.filter((entry) => entry.id !== id))
  }

  const generateDraftOKRsForInvites = async () => {
    setIsLoading(true)

    // Simulate API call: POST /api/v1/research/role for each invite
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const updatedEntries = inviteEntries.map((entry) => ({
      ...entry,
      draftOKRs: [
        {
          objectiveId: generateId(),
          title: `Support ${leaderOKRs[0]?.title || "team goals"} as ${entry.roleTitle}`,
          rank: 1,
          confidence: "medium" as const,
          keyResults: [
            {
              krId: generateId(),
              text: `Complete assigned deliverables for ${entry.roleTitle} role`,
              target: 100,
              unit: "%",
              actual: 0,
              progress: 0,
            },
            {
              krId: generateId(),
              text: "Achieve personal development milestones",
              target: 3,
              unit: "milestones",
              actual: 0,
              progress: 0,
            },
          ],
        },
      ],
    }))

    setInviteEntries(updatedEntries)
    setIsLoading(false)
    setToastMessage("Drafts generated — review before sending.")
  }

  const handleSendInvites = async () => {
    // Filter entries that have ALL THREE required fields filled (name, email, role) AND valid email
    const validEntries = inviteEntries.filter((e) =>
      e.name.trim() !== "" &&
      e.email.trim() !== "" &&
      e.roleTitle.trim() !== "" &&
      isValidEmail(e.email)
    )

    // Check if there are NO valid entries at all
    if (validEntries.length === 0) {
      setToastMessage("Please fill in all required fields (Name, Email, and Role) for at least one team member")
      return
    }

    // Check for invalid email addresses
    const hasInvalidEmails = inviteEntries.some((e) => e.email.trim() !== "" && !isValidEmail(e.email))
    if (hasInvalidEmails) {
      setToastMessage("Please enter valid email addresses for all team members")
      return
    }

    // Check if some entries are partially filled (this helps users complete their forms)
    if (validEntries.length < inviteEntries.length) {
      setToastMessage("Some team members are missing required fields (Name, Email, or Role). Please complete all fields or remove incomplete entries.")
      return
    }

    if (!currentUser || !companyProfile || !shareableSummary || !planningPeriod) {
      setToastMessage("Missing required data. Please go back and complete the OKR generation.")
      return
    }

    setIsLoading(true)

    try {
      // Convert frontend Objective[] to Lamatic format
      const lamaticObjectives: LamaticObjective[] = leaderOKRs.map((obj) => ({
        title: obj.title,
        description: obj.description || "",
        order_index: String(obj.rank),
        key_results: obj.keyResults.map((kr) => ({
          title: kr.text,
          baseline_value: kr.actual,
          target_value: kr.target,
          unit: kr.unit,
          order_index: "1",
        })),
      }))

      // Stringify objectives array (Flow 5 expects stringified JSON)
      const objectivesString = JSON.stringify(lamaticObjectives)

      // Ensure website URL has protocol
      const websiteUrl = companyProfile.domain.startsWith('http')
        ? companyProfile.domain
        : `https://${companyProfile.domain}`;

      // Call Flow 5: Invite Team Members - ONLY send valid entries
      const result = await inviteTeamMembers({
        leader_user_id: currentUser.userId,
        website_url: websiteUrl,
        leader_okr_plan: {
          strategic_narrative: shareableSummary.text,
          objectives: objectivesString, // Send as stringified JSON
        },
        planning_period: planningPeriod,
        company_profile: {
          company_name: companyProfile.name,
          industry: companyProfile.industry,
          mission: companyProfile.mission || companyProfile.publicNotes,
        },
        team_members: validEntries.map((entry) => ({
          name: entry.name,
          email: entry.email,
          role: entry.roleTitle,
        })),
      })

      if (!result.success) {
        throw new Error(result.message || "Failed to send invitations")
      }

      // Transform API response to frontend Invite format
      const newInvites: Invite[] = result.invitations.map((inv) => ({
        inviteId: inv.okr_id,
        userId: inv.user_id,
        name: inv.name,
        email: inv.email,
        roleTitle: inv.role,
        workspaceLink: `${window.location.origin}/invite/${inv.invitation_token}`,
        invitationToken: inv.invitation_token,
        status: "sent",
        objectivesCount: inv.objectives_count,
        keyResultsCount: inv.key_results_count,
      }))

      setInvites(newInvites)
      setSentInvites(newInvites)
      setToastMessage(`Successfully created ${result.total_invited} invitation(s)!`)

      // STEP 2: Send actual emails via Flow 6
      try {
        // Prepare email invitations from Flow 5 response
        const emailInvitations = result.invitations.map((inv) => {
          const invitationLink = `${window.location.origin}/invite/${inv.invitation_token}`
          const okrsString = JSON.stringify(inv.okrs || [])

          // Find the corresponding invite entry to get the personal message
          const matchingEntry = validEntries.find(entry => entry.email === inv.email)
          const personalMessage = matchingEntry?.personalMessage || ''

          return {
            name: inv.name,
            email: inv.email,
            role: inv.role,
            invitation_link: invitationLink,
            strategic_narrative: inv.strategic_narrative || shareableSummary.text,
            okrs: okrsString,  // Stringified JSON array
            personal_message: personalMessage,  // Personal message from leader
          }
        })

        const emailResult = await sendInvitationEmails({
          invitations: emailInvitations,
          leader_name: currentUser.name,
          leader_email: currentUser.email,
          company_name: companyProfile.name,
          planning_period: planningPeriod,
        })

        if (emailResult.success) {
          setToastMessage(`Successfully sent ${emailResult.sent_count} email(s) to team members!`)
        } else {
          setToastMessage(`Invitations created, but only ${emailResult.sent_count} email(s) sent`)
        }
      } catch (emailError) {
        console.error('Failed to send emails:', emailError)
        // Don't fail the whole flow - invitations are already created
        setToastMessage('Invitations created! You can manually share the links.')
      }

      setIsLoading(false)
      setShowSuccessModal(true)

      // Clear the invite entries after successful send
      setInviteEntries([])
    } catch (error) {
      console.error("Error sending invites:", error)
      setToastMessage(`Failed to send invitations: ${error instanceof Error ? error.message : "Unknown error"}`)
      setIsLoading(false)
    }
  }

  const previewEmailContent = {
    subject: `[Action Requested] Review OKRs for ${companyProfile?.name || "your team"} — ${currentUser?.name || "Leader"}`,
    from: "Lamatic · OKR Launchpad <no-reply@lamatic.ai>",
    preview: `${currentUser?.name || "Your leader"} invited you to review and edit proposed OKRs.`,
  }

  // Export handlers
  const exportAsPDF = () => {
    const content = generateExportContent()
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `okrs-${companyProfile?.name || 'export'}-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setToastMessage('OKRs exported as text file (PDF generation coming soon)')
  }

  const exportAsCSV = () => {
    let csv = 'Objective Number,Objective Title,KR Number,Key Result,Target,Unit\n'

    leaderOKRs.forEach((obj, objIndex) => {
      obj.keyResults.forEach((kr, krIndex) => {
        const row = [
          `O${objIndex + 1}`,
          `"${obj.title.replace(/"/g, '""')}"`,
          `KR${krIndex + 1}`,
          `"${kr.text.replace(/"/g, '""')}"`,
          kr.target,
          kr.unit
        ].join(',')
        csv += row + '\n'
      })
    })

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `okrs-${companyProfile?.name || 'export'}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setToastMessage('OKRs exported as CSV')
  }

  const exportAsJSON = () => {
    const data = {
      company: companyProfile?.name,
      planningPeriod: planningPeriod,
      exportDate: new Date().toISOString(),
      strategicSummary: shareableSummary?.text,
      objectives: leaderOKRs.map((obj, objIndex) => ({
        objectiveNumber: objIndex + 1,
        title: obj.title,
        description: obj.description,
        keyResults: obj.keyResults.map((kr, krIndex) => ({
          krNumber: krIndex + 1,
          text: kr.text,
          target: kr.target,
          unit: kr.unit,
          actual: kr.actual,
          progress: kr.progress
        }))
      }))
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `okrs-${companyProfile?.name || 'export'}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setToastMessage('OKRs exported as JSON')
  }

  const exportAsMarkdown = () => {
    let markdown = `# OKRs for ${companyProfile?.name || 'Organization'}\n\n`
    markdown += `**Planning Period:** ${planningPeriod}\n`
    markdown += `**Export Date:** ${new Date().toLocaleDateString()}\n\n`

    if (shareableSummary?.text) {
      markdown += `## Strategic Summary\n\n${shareableSummary.text}\n\n`
    }

    markdown += `## Objectives and Key Results\n\n`

    leaderOKRs.forEach((obj, objIndex) => {
      markdown += `### O${objIndex + 1}: ${obj.title}\n\n`
      if (obj.description) {
        markdown += `${obj.description}\n\n`
      }
      markdown += `**Key Results:**\n\n`
      obj.keyResults.forEach((kr, krIndex) => {
        markdown += `- **KR${krIndex + 1}:** ${kr.text} (Target: ${kr.target} ${kr.unit})\n`
      })
      markdown += '\n'
    })

    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `okrs-${companyProfile?.name || 'export'}-${new Date().toISOString().split('T')[0]}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setToastMessage('OKRs exported as Markdown')
  }

  const generateExportContent = () => {
    let content = `OKRs for ${companyProfile?.name || 'Organization'}\n`
    content += `Planning Period: ${planningPeriod}\n`
    content += `Export Date: ${new Date().toLocaleDateString()}\n\n`

    if (shareableSummary?.text) {
      content += `Strategic Summary:\n${shareableSummary.text}\n\n`
    }

    content += `Objectives and Key Results:\n\n`

    leaderOKRs.forEach((obj, objIndex) => {
      content += `O${objIndex + 1}: ${obj.title}\n`
      if (obj.description) {
        content += `   ${obj.description}\n`
      }
      obj.keyResults.forEach((kr, krIndex) => {
        content += `   KR${krIndex + 1}: ${kr.text} (Target: ${kr.target} ${kr.unit})\n`
      })
      content += '\n'
    })

    return content
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Show loading with facts during invite sending */}
      {isLoading && (
        <LoadingWithFacts message="Sending invitations to your team..." />
      )}

      {/* Main content - hide during loading */}
      {!isLoading && (
        <>
          {/* Leader OKRs Section - Read Only */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#DC2626]/10">
                <CheckCircle className="w-5 h-5 text-[#DC2626]" />
              </div>
              <div>
                <CardTitle className="text-xl">Your Final OKRs</CardTitle>
                <CardDescription>Review your objectives before inviting your team.</CardDescription>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={exportAsMarkdown}>
                  <FileText className="w-4 h-4 mr-2" />
                  Markdown (.md)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportAsCSV}>
                  <Table className="w-4 h-4 mr-2" />
                  CSV Spreadsheet (.csv)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportAsJSON}>
                  <Code className="w-4 h-4 mr-2" />
                  JSON Data (.json)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={exportAsPDF} className="text-muted-foreground">
                  <FileDown className="w-4 h-4 mr-2" />
                  PDF Document (Coming Soon)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {leaderOKRs.map((objective, objIndex) => (
            <div
              key={objective.objectiveId}
              className="p-4 rounded-lg border border-border bg-background/50"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">O{objIndex + 1}</Badge>
                    <h3 className="font-semibold text-foreground">{objective.title}</h3>
                  </div>
                  <div className="space-y-2 pl-4">
                    {objective.keyResults.map((kr, krIndex) => (
                      <div key={kr.krId} className="flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground w-8 font-medium">KR{krIndex + 1}</span>
                        <span className="flex-1 text-foreground">{kr.text}</span>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#DC2626]/10 border border-[#DC2626]/30 min-w-[80px] justify-center">
                          <span className="text-sm font-bold text-[#DC2626]">{kr.target}</span>
                          <span className="text-sm font-medium text-[#DC2626]/80">{kr.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Invite Section */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Invite Your Team</CardTitle>
              <CardDescription>Send personalized invites with draft OKRs for each team member.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invite Entries */}
          {inviteEntries.length > 0 && (
            <div className="space-y-4">
              {inviteEntries.map((entry, index) => (
                <div key={entry.id} className="p-4 rounded-lg border border-border bg-background/50 space-y-4">
                  <div className="flex items-start justify-between">
                    <Badge variant="outline" className="font-medium">Team Member {index + 1}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeInviteEntry(entry.id)}
                      className="text-muted-foreground hover:text-destructive h-6 w-6"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        placeholder="John Doe"
                        value={entry.name}
                        onChange={(e) => updateInviteEntry(entry.id, "name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input
                        type="email"
                        placeholder="colleague@company.com"
                        value={entry.email}
                        onChange={(e) => updateInviteEntry(entry.id, "email", e.target.value)}
                        className={entry.email.trim() !== "" && !isValidEmail(entry.email) ? "border-destructive focus-visible:ring-destructive" : ""}
                      />
                      {entry.email.trim() !== "" && !isValidEmail(entry.email) && (
                        <p className="text-xs text-destructive">Please enter a valid email address</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Role / Title</Label>
                      <Input
                        placeholder="Director of CS, Senior Engineer..."
                        value={entry.roleTitle}
                        onChange={(e) => updateInviteEntry(entry.id, "roleTitle", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Personal Message (optional)</Label>
                    <Textarea
                      placeholder="Add a personal note to your invite..."
                      value={entry.personalMessage}
                      onChange={(e) => updateInviteEntry(entry.id, "personalMessage", e.target.value)}
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`includeDraft-${entry.id}`}
                        checked={entry.includeDraftOKRs}
                        onCheckedChange={(checked) =>
                          updateInviteEntry(entry.id, "includeDraftOKRs", checked as boolean)
                        }
                      />
                      <Label htmlFor={`includeDraft-${entry.id}`} className="text-sm cursor-pointer">
                        Include draft OKRs for this role
                      </Label>
                    </div>
                    {entry.draftOKRs && (
                      <Badge variant="outline" className="text-accent border-accent/30">
                        Draft ready
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Invite Button */}
          <Button variant="outline" onClick={addInviteEntry} className="w-full bg-transparent">
            <Plus className="w-4 h-4 mr-2" />
            Add Team Member
          </Button>

          {/* Action Buttons */}
          {inviteEntries.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={generateDraftOKRsForInvites}
                disabled={isLoading || inviteEntries.some((e) => !e.roleTitle)}
              >
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Generate Draft OKRs for Invites
              </Button>
              <Button
                onClick={handleSendInvites}
                disabled={isLoading || inviteEntries.some((e) => !e.name.trim() || !e.email.trim() || !e.roleTitle.trim() || !isValidEmail(e.email))}
                className="ml-auto"
              >
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Send Invites
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentScreen("kickoff")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Edit OKRs
        </Button>
        <Button onClick={() => setCurrentScreen("dashboard")}>
          Continue to Dashboard
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Preview Email Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <DialogDescription>This is how your invite email will appear to recipients.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-4 rounded-lg border border-border bg-background">
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">From:</span> {previewEmailContent.from}
              </p>
              <p>
                <span className="text-muted-foreground">Subject:</span> {previewEmailContent.subject}
              </p>
            </div>
            <div className="border-t border-border pt-4 space-y-4">
              <p className="text-sm">Hi [Name],</p>
              <p className="text-sm text-muted-foreground">
                {currentUser?.name || "Your leader"} has invited you to review and contribute to the{" "}
                {companyProfile?.name} OKR planning for the upcoming period.
              </p>
              <p className="text-sm text-muted-foreground">
                Click the button below to access your personalized workspace with suggested OKRs based on your role.
              </p>
              <Button size="sm" className="w-full">
                <Mail className="w-4 h-4 mr-2" />
                Review & Edit OKRs
              </Button>
              <p className="text-xs text-muted-foreground text-center">This link expires in 7 days.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto p-3 rounded-full bg-accent/10 w-fit mb-4">
              <CheckCircle className="w-8 h-8 text-accent" />
            </div>
            <DialogTitle className="text-center">Invites Sent!</DialogTitle>
            <DialogDescription className="text-center">
              {sentInvites.length} invite{sentInvites.length > 1 ? "s" : ""} queued. Recipients will receive an email
              with a link to their workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {sentInvites.map((invite) => (
              <div key={invite.inviteId} className="p-3 rounded-lg border border-border bg-background/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{invite.name || invite.email}</p>
                    <p className="text-xs text-muted-foreground">{invite.email}</p>
                  </div>
                  <Badge variant="outline" className="text-xs border-accent/30 text-accent">
                    {invite.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={invite.workspaceLink}
                    className="text-xs font-mono h-8"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(invite.workspaceLink)
                      setToastMessage("Invitation link copied!")
                    }}
                    className="h-8 px-3"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                {invite.objectivesCount !== undefined && (
                  <p className="text-xs text-muted-foreground">
                    {invite.objectivesCount} objectives, {invite.keyResultsCount} key results generated
                  </p>
                )}
              </div>
            ))}
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setShowSuccessModal(false)} className="w-full sm:w-auto">
              Add More Invites
            </Button>
            <Button
              onClick={() => {
                setShowSuccessModal(false)
                setCurrentScreen("dashboard")
              }}
              className="w-full sm:w-auto"
            >
              View Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </>
      )}
    </div>
  )
}
