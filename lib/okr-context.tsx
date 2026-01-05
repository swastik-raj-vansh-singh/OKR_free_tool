"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type {
  User,
  CompanyProfile,
  OKRPlan,
  Objective,
  Invite,
  Workspace,
  WeeklyUpdate,
  UpdateSchedule,
  WizardScreen,
  ShareableSummary,
} from "./types"

interface OKRContextType {
  // Current user
  currentUser: User | null
  setCurrentUser: (user: User | null) => void

  // Screen navigation
  currentScreen: WizardScreen
  setCurrentScreen: (screen: WizardScreen) => void

  // Company profile (from research)
  companyProfile: CompanyProfile | null
  setCompanyProfile: (profile: CompanyProfile | null) => void

  // Leader OKRs
  leaderOKRs: Objective[]
  setLeaderOKRs: (okrs: Objective[]) => void

  // Shareable summary
  shareableSummary: ShareableSummary | null
  setShareableSummary: (summary: ShareableSummary | null) => void

  // Planning period
  planningPeriod: string
  setPlanningPeriod: (period: string) => void

  // Plan
  plan: OKRPlan | null
  setPlan: (plan: OKRPlan | null) => void

  // Invites
  invites: Invite[]
  setInvites: (invites: Invite[]) => void
  addInvite: (invite: Invite) => void

  // Workspaces (for direct reports)
  workspaces: Workspace[]
  setWorkspaces: (workspaces: Workspace[]) => void

  // Updates
  weeklyUpdates: WeeklyUpdate[]
  addWeeklyUpdate: (update: WeeklyUpdate) => void

  // Schedules
  updateSchedules: UpdateSchedule[]
  addUpdateSchedule: (schedule: UpdateSchedule) => void

  // Loading state
  isLoading: boolean
  setIsLoading: (loading: boolean) => void

  // Toast messages
  toastMessage: string | null
  setToastMessage: (message: string | null) => void
}

const OKRContext = createContext<OKRContextType | undefined>(undefined)

export function OKRProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentScreen, setCurrentScreen] = useState<WizardScreen>("kickoff")
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null)
  const [leaderOKRs, setLeaderOKRs] = useState<Objective[]>([])
  const [shareableSummary, setShareableSummary] = useState<ShareableSummary | null>(null)
  const [planningPeriod, setPlanningPeriod] = useState<string>("")
  const [plan, setPlan] = useState<OKRPlan | null>(null)
  const [invites, setInvites] = useState<Invite[]>([])
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [weeklyUpdates, setWeeklyUpdates] = useState<WeeklyUpdate[]>([])
  const [updateSchedules, setUpdateSchedules] = useState<UpdateSchedule[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const addInvite = (invite: Invite) => {
    setInvites((prev) => [...prev, invite])
  }

  const addWeeklyUpdate = (update: WeeklyUpdate) => {
    setWeeklyUpdates((prev) => [...prev, update])
  }

  const addUpdateSchedule = (schedule: UpdateSchedule) => {
    setUpdateSchedules((prev) => [...prev, schedule])
  }

  return (
    <OKRContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        currentScreen,
        setCurrentScreen,
        companyProfile,
        setCompanyProfile,
        leaderOKRs,
        setLeaderOKRs,
        shareableSummary,
        setShareableSummary,
        planningPeriod,
        setPlanningPeriod,
        plan,
        setPlan,
        invites,
        setInvites,
        addInvite,
        workspaces,
        setWorkspaces,
        weeklyUpdates,
        addWeeklyUpdate,
        updateSchedules,
        addUpdateSchedule,
        isLoading,
        setIsLoading,
        toastMessage,
        setToastMessage,
      }}
    >
      {children}
    </OKRContext.Provider>
  )
}

export function useOKR() {
  const context = useContext(OKRContext)
  if (!context) {
    throw new Error("useOKR must be used within an OKRProvider")
  }
  return context
}
