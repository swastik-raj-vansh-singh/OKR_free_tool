/**
 * Lamatic API Service Layer
 * Handles all GraphQL communication with Lamatic workflows
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface LamaticCompanyProfile {
  company_name: string
  industry: string
  products: string[]
  mission: string
  employee_count: string
  headquarters: string
  founded_year: string
  key_features: string[]
}

export interface LamaticObjective {
  title: string
  description: string
  order_index: string
  key_results: LamaticKeyResult[]
}

export interface LamaticKeyResult {
  title: string
  baseline_value: number
  target_value: number
  unit: string
  order_index: string
}

export interface LamaticOKRPlan {
  strategic_narrative: string
  objectives: LamaticObjective[]
}

export interface ResearchCompanyResponse {
  website_url: string
  company_profile: LamaticCompanyProfile
}

export interface GenerateOKRsResponse {
  success: boolean
  okr_plan: LamaticOKRPlan
  metadata: {
    objectives_count: number
    key_results_count: number
    planning_period: string
    user_role: string
    company_name: string
  }
}

export interface GenerateOKRsInput {
  company_profile: LamaticCompanyProfile
  user_role: string
  user_goals: string
  planning_period: string
  website_data?: string
}

export interface RegenerateOKRsInput {
  company_profile: LamaticCompanyProfile
  user_role: string
  planning_period: string
  edited_narrative: string
}

export interface SaveOKRsInput {
  user_id: string
  user_email: string
  user_name: string
  user_role: string
  website_url: string
  company_name: string
  planning_period: string
  okr_plan: {
    strategic_narrative: string
    objectives: LamaticObjective[]  // Array of objectives, not stringified
  }
}

export interface SaveOKRsResponse {
  success: boolean
  message: string
  id?: string
  created_at?: string
}

export interface TeamMember {
  name: string
  email: string
  role: string
}

export interface InviteTeamMembersInput {
  leader_user_id: string
  website_url: string
  leader_okr_plan: {
    strategic_narrative: string
    objectives: string  // Stringified JSON array
  }
  planning_period: string
  company_profile: {
    company_name: string
    industry: string
    mission: string
  }
  team_members: TeamMember[]
}

export interface InvitationDetails {
  user_id: string
  name: string
  email: string
  role: string
  invitation_token: string
  invitation_link: string
  okr_id: string
  website_url: string
  company_name: string
  objectives_count: number
  key_results_count: number
  strategic_narrative: string
  okrs: LamaticObjective[]  // Full OKR data from Flow 5
}

export interface InviteTeamMembersResponse {
  success: boolean
  message: string
  invitations: InvitationDetails[]
  total_invited: number
}

export interface EmailInvitation {
  name: string
  email: string
  role: string
  invitation_link: string
  strategic_narrative: string
  okrs: string  // Stringified JSON array of objectives
  personal_message: string  // Personal message from leader
}

export interface SendInvitesInput {
  invitations: EmailInvitation[]
  leader_name: string
  leader_email: string
  company_name: string
  planning_period: string
}

export interface SendInvitesResponse {
  success: boolean
  message: string
  sent_count: number
  failed_count: number
  total_count: number
  results: Array<{
    email: string
    status: string
    sent_at?: string
    note?: string
  }>
}

export interface SendRemindersResponse {
  success: boolean
  message: string
  sent_count: number
}

// ============================================================================
// Configuration - Load from environment variables for security
// ============================================================================

const LAMATIC_CONFIG = {
  endpoint: process.env.NEXT_PUBLIC_LAMATIC_ENDPOINT || "",
  apiKey: process.env.NEXT_PUBLIC_LAMATIC_API_KEY || "",
  projectId: process.env.NEXT_PUBLIC_LAMATIC_PROJECT_ID || "",
  workflows: {
    researchCompany: process.env.NEXT_PUBLIC_LAMATIC_WORKFLOW_RESEARCH_COMPANY || "",
    generateOKRs: process.env.NEXT_PUBLIC_LAMATIC_WORKFLOW_GENERATE_OKRS || "",
    regenerateOKRs: process.env.NEXT_PUBLIC_LAMATIC_WORKFLOW_REGENERATE_OKRS || "",
    saveOKRs: process.env.NEXT_PUBLIC_LAMATIC_WORKFLOW_SAVE_OKRS || "",
    inviteTeam: process.env.NEXT_PUBLIC_LAMATIC_WORKFLOW_INVITE_TEAM || "",
    sendInvites: process.env.NEXT_PUBLIC_LAMATIC_WORKFLOW_SEND_INVITES || "",
    sendReminders: process.env.NEXT_PUBLIC_LAMATIC_WORKFLOW_SEND_REMINDERS || "",
  },
}

// ============================================================================
// GraphQL Client Helpers
// ============================================================================

async function fetchLamaticAPI(query: string, variables: Record<string, unknown>) {
  const response = await fetch(LAMATIC_CONFIG.endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LAMATIC_CONFIG.apiKey}`,
      "Content-Type": "application/json",
      "x-project-id": LAMATIC_CONFIG.projectId,
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Lamatic API error: ${response.status} ${response.statusText} - ${errorText.substring(0, 200)}`)
  }

  // Check if response is JSON before parsing
  const contentType = response.headers.get("content-type")
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text()
    throw new Error(`Expected JSON response but got: ${text.substring(0, 200)}`)
  }

  const data = await response.json()

  if (data.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(data.errors)}`)
  }

  if (!data.data?.executeWorkflow) {
    throw new Error("Invalid response from Lamatic API")
  }

  const { status, result } = data.data.executeWorkflow

  if (status !== "success" && status !== "completed") {
    throw new Error(`Workflow execution failed with status: ${status}`)
  }

  // Parse the result string if it's JSON
  try {
    const parsed = typeof result === "string" ? JSON.parse(result) : result
    return parsed
  } catch (e) {
    return result
  }
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Flow 1: Research Company
 * Scrapes and analyzes company website to extract profile information
 */
export async function researchCompany(websiteUrl: string): Promise<ResearchCompanyResponse> {
  const query = `
    query ExecuteWorkflow($workflowId: String!, $website_url: String) {
      executeWorkflow(
        workflowId: $workflowId
        payload: { website_url: $website_url }
      ) {
        status
        result
      }
    }
  `

  const variables = {
    workflowId: LAMATIC_CONFIG.workflows.researchCompany,
    website_url: websiteUrl,
  }

  return await fetchLamaticAPI(query, variables)
}

/**
 * Flow 2: Generate Leader OKRs
 * Generates strategic OKRs based on company profile and user inputs
 */
export async function generateLeaderOKRs(input: GenerateOKRsInput): Promise<GenerateOKRsResponse> {
  const query = `
    query ExecuteWorkflow(
      $workflowId: String!
      $company_profile_company_name: String
      $company_profile_industry: String
      $company_profile_products: [String]
      $company_profile_mission: String
      $company_profile_employee_count: String
      $company_profile_headquarters: String
      $company_profile_founded_year: String
      $company_profile_key_features: [String]
      $user_role: String
      $user_goals: String
      $planning_period: String
      $website_data: String
    ) {
      executeWorkflow(
        workflowId: $workflowId
        payload: {
          company_profile: {
            company_name: $company_profile_company_name
            industry: $company_profile_industry
            products: $company_profile_products
            mission: $company_profile_mission
            employee_count: $company_profile_employee_count
            headquarters: $company_profile_headquarters
            founded_year: $company_profile_founded_year
            key_features: $company_profile_key_features
          }
          user_role: $user_role
          user_goals: $user_goals
          planning_period: $planning_period
          website_data: $website_data
        }
      ) {
        status
        result
      }
    }
  `

  const variables = {
    workflowId: LAMATIC_CONFIG.workflows.generateOKRs,
    company_profile_company_name: input.company_profile.company_name,
    company_profile_industry: input.company_profile.industry,
    company_profile_products: input.company_profile.products,
    company_profile_mission: input.company_profile.mission,
    company_profile_employee_count: String(input.company_profile.employee_count || ""),
    company_profile_headquarters: input.company_profile.headquarters,
    company_profile_founded_year: String(input.company_profile.founded_year || ""),
    company_profile_key_features: input.company_profile.key_features,
    user_role: input.user_role,
    user_goals: input.user_goals,
    planning_period: input.planning_period,
    website_data: input.website_data || "",
  }

  return await fetchLamaticAPI(query, variables)
}

/**
 * Flow 3: Regenerate OKRs from Summary
 * Regenerates OKRs when user edits the strategic narrative
 */
export async function regenerateOKRsFromSummary(
  input: RegenerateOKRsInput
): Promise<GenerateOKRsResponse> {
  const query = `
    query ExecuteWorkflow(
      $workflowId: String!
      $company_profile: JSON
      $user_role: String
      $planning_period: String
      $edited_narrative: String
    ) {
      executeWorkflow(
        workflowId: $workflowId
        payload: {
          company_profile: $company_profile
          user_role: $user_role
          planning_period: $planning_period
          edited_narrative: $edited_narrative
        }
      ) {
        status
        result
      }
    }
  `

  const variables = {
    workflowId: LAMATIC_CONFIG.workflows.regenerateOKRs,
    company_profile: {
      company_name: input.company_profile.company_name,
      industry: input.company_profile.industry,
      products: input.company_profile.products,
      mission: input.company_profile.mission,
    },
    user_role: input.user_role,
    planning_period: input.planning_period,
    edited_narrative: input.edited_narrative,
  }

  return await fetchLamaticAPI(query, variables)
}

/**
 * Flow 4: Save OKRs to Database
 * Persists generated OKRs to Supabase database
 */
export async function saveOKRsToDatabase(input: SaveOKRsInput): Promise<SaveOKRsResponse> {
  const query = `
    query ExecuteWorkflow(
      $workflowId: String!
      $user_id: String
      $user_email: String
      $user_name: String
      $user_role: String
      $website_url: String
      $company_name: String
      $planning_period: String
      $okr_plan_strategic_narrative: String
      $okr_plan_objectives: [JSON]
    ) {
      executeWorkflow(
        workflowId: $workflowId
        payload: {
          user_id: $user_id
          user_email: $user_email
          user_name: $user_name
          user_role: $user_role
          website_url: $website_url
          company_name: $company_name
          planning_period: $planning_period
          okr_plan: {
            strategic_narrative: $okr_plan_strategic_narrative
            objectives: $okr_plan_objectives
          }
        }
      ) {
        status
        result
      }
    }
  `

  const variables = {
    workflowId: LAMATIC_CONFIG.workflows.saveOKRs,
    user_id: input.user_id,
    user_email: input.user_email,
    user_name: input.user_name,
    user_role: input.user_role,
    website_url: input.website_url,
    company_name: input.company_name,
    planning_period: input.planning_period,
    okr_plan_strategic_narrative: input.okr_plan.strategic_narrative,
    okr_plan_objectives: input.okr_plan.objectives, // Send as array
  }

  return await fetchLamaticAPI(query, variables)
}

/**
 * Flow 5: Invite Team Members
 * Generates team member OKRs and creates invitation tokens
 */
export async function inviteTeamMembers(input: InviteTeamMembersInput): Promise<InviteTeamMembersResponse> {
  const query = `
    query ExecuteWorkflow(
      $workflowId: String!
      $leader_user_id: String
      $website_url: String
      $leader_okr_plan_strategic_narrative: String
      $leader_okr_plan_objectives: String
      $planning_period: String
      $company_profile_company_name: String
      $company_profile_industry: String
      $company_profile_mission: String
      $team_members: [JSON]
    ) {
      executeWorkflow(
        workflowId: $workflowId
        payload: {
          leader_user_id: $leader_user_id
          website_url: $website_url
          leader_okr_plan: {
            strategic_narrative: $leader_okr_plan_strategic_narrative
            objectives: $leader_okr_plan_objectives
          }
          planning_period: $planning_period
          company_profile: {
            company_name: $company_profile_company_name
            industry: $company_profile_industry
            mission: $company_profile_mission
          }
          team_members: $team_members
        }
      ) {
        status
        result
      }
    }
  `

  const variables = {
    workflowId: LAMATIC_CONFIG.workflows.inviteTeam,
    leader_user_id: input.leader_user_id,
    website_url: input.website_url,
    leader_okr_plan_strategic_narrative: input.leader_okr_plan.strategic_narrative,
    leader_okr_plan_objectives: input.leader_okr_plan.objectives, // Already stringified
    planning_period: input.planning_period,
    company_profile_company_name: input.company_profile.company_name,
    company_profile_industry: input.company_profile.industry,
    company_profile_mission: input.company_profile.mission,
    team_members: input.team_members,
  }

  return await fetchLamaticAPI(query, variables)
}

/**
 * Flow 6: Send Invitation Emails
 * Sends actual email invitations to team members with their OKRs
 */
export async function sendInvitationEmails(input: SendInvitesInput): Promise<SendInvitesResponse> {
  const query = `
    query ExecuteWorkflow(
      $workflowId: String!
      $invitations: [JSON]
      $leader_name: String
      $leader_email: String
      $company_name: String
      $planning_period: String
    ) {
      executeWorkflow(
        workflowId: $workflowId
        payload: {
          invitations: $invitations
          leader_name: $leader_name
          leader_email: $leader_email
          company_name: $company_name
          planning_period: $planning_period
        }
      ) {
        status
        result
      }
    }
  `

  const variables = {
    workflowId: LAMATIC_CONFIG.workflows.sendInvites,
    invitations: input.invitations,
    leader_name: input.leader_name,
    leader_email: input.leader_email,
    company_name: input.company_name,
    planning_period: input.planning_period,
  }

  return await fetchLamaticAPI(query, variables)
}

/**
 * Flow 7: Send OKR Reminders
 * Triggers scheduled reminder emails to users based on their reminder settings
 */
export async function sendOKRReminders(): Promise<SendRemindersResponse> {
  const query = `
    query ExecuteWorkflow(
      $workflowId: String!
      $trigger_date: String
    ) {
      executeWorkflow(
        workflowId: $workflowId
        payload: {
          trigger_date: $trigger_date
        }
      ) {
        status
        result
      }
    }
  `

  const variables = {
    workflowId: LAMATIC_CONFIG.workflows.sendReminders,
    trigger_date: new Date().toISOString(),
  }

  return await fetchLamaticAPI(query, variables)
}
