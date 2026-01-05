export interface User {
  userId: string
  name: string
  email: string
  role: string
  companyDomain: string
}

export interface CompanyProfile {
  domain: string
  name: string
  industry: string
  size: string
  publicNotes: string
  // Extended fields from Lamatic
  products?: string[]
  employee_count?: string
  headquarters?: string
  founded_year?: string
  key_features?: string[]
  mission?: string
}

export interface KeyResult {
  krId: string
  text: string
  target: number
  unit: string
  actual: number
  progress: number
  confidence?: "highest" | "high" | "medium" | "low" | "lowest"
}

export interface Objective {
  objectiveId: string
  title: string
  description?: string
  rank: number
  keyResults: KeyResult[]
  confidence?: "highest" | "high" | "medium" | "low" | "lowest"
}

export interface ShareableSummary {
  title: string
  text: string
  shortlink?: string
}

export interface OKRPlan {
  planId: string
  planName: string
  ownerId: string
  period: string
  objectives: Objective[]
  companyProfile?: CompanyProfile
  shareableSummary?: ShareableSummary
  settings: {
    shareableSummary: boolean
  }
  createdAt: string
  updatedAt: string
}

export interface Invite {
  inviteId: string
  email: string
  roleTitle: string
  workspaceLink: string
  status: "queued" | "sent" | "accepted" | "expired"
  draftOKRs?: Objective[]
  personalMessage?: string
  // Flow 5 additional fields
  name?: string
  userId?: string
  okrId?: string
  invitationToken?: string
  objectivesCount?: number
  keyResultsCount?: number
}

export interface Workspace {
  workspaceId: string
  planId: string
  userId: string
  userName: string
  userRole: string
  draftOKRs: Objective[]
  status: "draft" | "submitted" | "signed-off"
  invitedBy?: string
}

export interface KRUpdate {
  keyResultId: string
  previousValue: number
  newValue: number
  notes: string
}

export interface WeeklyUpdate {
  updateId: string
  planId: string
  objectiveId: string
  krId: string
  actualValue: number
  notes: string
  evidenceLink?: string
  createdAt: string
}

export interface UpdateSchedule {
  scheduleId: string
  planId: string
  name: string
  cadence: "weekly" | "biweekly" | "monthly"
  dayOfWeek: string
  timeOfDay: string
  participants: string[]
  nextRunAt: string
}

export interface AgentDeployment {
  agentId: string
  planId: string
  agentName: string
  status: "provisioning" | "ready" | "error"
  krTargets: { krId: string; dataSource: string }[]
  estimatedReadyAt?: string
}

export type WizardScreen = "kickoff" | "edit-invite" | "workspace" | "dashboard"

// Invitation page data structure (from Supabase)
export interface InvitationData {
  user: {
    id: string
    email: string
    name: string
    role: string
    invitation_token: string
    invitation_sent_at: string
    invitation_accepted_at: string | null
  }
  okr: {
    id: string
    user_id: string
    website_url: string | null
    company_name: string
    planning_period: string
    strategic_narrative: string
    okrs: Objective[]
    is_draft: boolean
    created_at: string
  }
  leader: {
    name: string
    email: string
  } | null
}
