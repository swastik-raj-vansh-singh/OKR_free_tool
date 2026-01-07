"use client"

import { useState, useEffect } from "react"
import { useOKR } from "@/lib/okr-context"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Layers, ChevronDown, HelpCircle, Palette, Moon, Sun, LogOut, LogIn } from "lucide-react"
import { useTheme } from "next-themes"

// Custom SVG Icons to avoid AI-generated look
const CustomIcon = {
  Zap: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Target: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  TrendingUp: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  Users: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  CheckCircle: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
  ),
  Lightbulb: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21h6M15 3a6 6 0 00-6 9.5V18h6v-5.5A6 6 0 0015 3z" />
    </svg>
  ),
  BookOpen: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2V3zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7V3z" />
    </svg>
  ),
  Rocket: ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15l-3-3m0 0l-3 3m3-3v12m0 0L4.93 19.07A10 10 0 0112 2a10 10 0 017.07 17.07L12 24z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 2l3 3-3 3M15 2l-3 3 3 3" />
    </svg>
  ),
}

type Theme = "default" | "ocean" | "forest" | "sunset" | "lavender"

const themes: Record<Theme, { name: string; primary: string; primaryOklch: string; accent: string; accentOklch: string }> = {
  default: {
    name: "Red Energy",
    primary: "#DC2626",
    primaryOklch: "oklch(0.55 0.22 25)",
    accent: "#DC2626",
    accentOklch: "oklch(0.55 0.22 25)"
  },
  ocean: {
    name: "Ocean Blue",
    primary: "#0EA5E9",
    primaryOklch: "oklch(0.67 0.17 237)",
    accent: "#38BDF8",
    accentOklch: "oklch(0.75 0.14 237)"
  },
  forest: {
    name: "Forest Green",
    primary: "#10B981",
    primaryOklch: "oklch(0.68 0.17 165)",
    accent: "#34D399",
    accentOklch: "oklch(0.78 0.14 165)"
  },
  sunset: {
    name: "Sunset Orange",
    primary: "#F97316",
    primaryOklch: "oklch(0.68 0.19 45)",
    accent: "#FB923C",
    accentOklch: "oklch(0.75 0.16 45)"
  },
  lavender: {
    name: "Lavender Purple",
    primary: "#A855F7",
    primaryOklch: "oklch(0.62 0.25 295)",
    accent: "#C084FC",
    accentOklch: "oklch(0.72 0.20 295)"
  },
}

export function AppHeader() {
  const { companyProfile, currentUser, currentScreen } = useOKR()
  const { user: authUser, supabaseUser, loading: authLoading, signInWithGoogle, signOut } = useAuth()
  const [showHelp, setShowHelp] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<Theme>("default")
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const applyTheme = (theme: Theme) => {
    setCurrentTheme(theme)
    const themeConfig = themes[theme]

    // Update CSS variables using oklch color space
    const root = document.documentElement

    // Add smooth transition for theme changes
    root.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'

    // Primary color variables
    root.style.setProperty('--primary', themeConfig.primaryOklch)
    root.style.setProperty('--accent', themeConfig.accentOklch)
    root.style.setProperty('--ring', themeConfig.primaryOklch)
    root.style.setProperty('--destructive', themeConfig.primaryOklch)
    root.style.setProperty('--chart-1', themeConfig.primaryOklch)
    root.style.setProperty('--sidebar-primary', themeConfig.primaryOklch)
    root.style.setProperty('--sidebar-ring', themeConfig.primaryOklch)

    // The CSS variables above will automatically theme most elements
    // Only update elements that use hardcoded hex colors (not CSS variables)
    // This prevents text from becoming invisible

    // We don't need to manually update elements since the CSS variables handle it
    // The --primary, --accent, etc. variables cascade to all components

    // Optional: Clear any previously set inline styles that might interfere
    document.querySelectorAll('[style*="color"], [style*="background"]').forEach((el) => {
      const htmlEl = el as HTMLElement
      // Don't clear styles from the logo or notification elements
      if (htmlEl.hasAttribute('data-no-theme') || htmlEl.closest('[data-no-theme]') || htmlEl.hasAttribute('data-notification')) {
        return
      }
      // Only clear if it was set by previous theme changes
      if (htmlEl.style.color && htmlEl.style.color.startsWith('#')) {
        htmlEl.style.color = ''
      }
      if (htmlEl.style.backgroundColor && htmlEl.style.backgroundColor.startsWith('#')) {
        htmlEl.style.backgroundColor = ''
      }
      if (htmlEl.style.borderColor && htmlEl.style.borderColor.startsWith('#')) {
        htmlEl.style.borderColor = ''
      }
    })

    // Show theme change notification with themed color
    const notification = document.createElement('div')
    notification.setAttribute('data-notification', 'true')
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      padding: 12px 20px;
      background: ${themeConfig.primary};
      color: white;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease-out;
    `
    notification.textContent = `✨ Theme changed to ${themeConfig.name}`
    document.body.appendChild(notification)

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out'
      setTimeout(() => notification.remove(), 300)
    }, 2000)
  }

  return (
    <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2" data-no-theme>
            <div className="p-1.5 rounded-md bg-[#DC2626]/10">
              <Layers className="w-5 h-5 text-[#DC2626]" />
            </div>
            <span className="font-semibold text-sm">OKR Autopilot</span>
          </div>
          {companyProfile && (
            <>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm text-muted-foreground">{companyProfile.name}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Help Button */}
          <Button variant="ghost" size="sm" onClick={() => setShowHelp(true)} className="gap-2">
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Help</span>
          </Button>

          {/* Dark/Light Mode Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="gap-2"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-4 h-4" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </Button>
          )}

          {/* Theme Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">Theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Choose Theme</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.keys(themes) as Theme[]).map((themeKey) => (
                <DropdownMenuItem
                  key={themeKey}
                  onClick={() => applyTheme(themeKey)}
                  className="gap-2"
                >
                  <div
                    className="w-4 h-4 rounded-full border-2 border-border"
                    style={{ backgroundColor: themes[themeKey].primary }}
                  />
                  <span>{themes[themeKey].name}</span>
                  {currentTheme === themeKey && <CustomIcon.CheckCircle className="w-4 h-4 ml-auto" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu - Show user if either authUser or supabaseUser exists */}
          {(authUser || supabaseUser) ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs bg-[#DC2626]/10 text-[#DC2626]">
                      {(authUser?.name || supabaseUser?.user_metadata?.full_name || supabaseUser?.user_metadata?.name || supabaseUser?.email || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm hidden sm:inline">
                    {authUser?.name || supabaseUser?.user_metadata?.full_name || supabaseUser?.user_metadata?.name || supabaseUser?.email?.split("@")[0] || "User"}
                  </span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {authUser?.name || supabaseUser?.user_metadata?.full_name || supabaseUser?.user_metadata?.name || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {authUser?.email || supabaseUser?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowHelp(true)}>
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onSelect={(e) => {
                    e.preventDefault() // Prevent menu from closing immediately
                    console.log('🚪 Sign out menu item clicked')
                    signOut()
                  }}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" size="sm" onClick={signInWithGoogle} className="gap-2">
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Sign in with Google</span>
            </Button>
          )}
        </div>
      </div>

      {/* Help Dialog */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <CustomIcon.BookOpen className="w-6 h-6 text-[#DC2626]" />
              Help & Support
            </DialogTitle>
            <DialogDescription>
              Everything you need to know about OKRs and using OKR Autopilot powered by Lamatic
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="okr-basics" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="okr-basics">OKR Basics</TabsTrigger>
              <TabsTrigger value="how-to-use">How to Use</TabsTrigger>
              <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
              <TabsTrigger value="lamatic">About Lamatic</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4 pr-2">
              {/* OKR Basics Tab */}
              <TabsContent value="okr-basics" className="space-y-6 mt-0">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
                    <CustomIcon.Target className="w-5 h-5 text-[#DC2626] mt-1 flex-shrink-0" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">What are OKRs?</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        OKRs (Objectives and Key Results) are a goal-setting framework used by organizations to define measurable goals and track their outcomes.
                        An <strong>Objective</strong> is a clearly defined goal, and <strong>Key Results</strong> are specific measures used to track the achievement of that goal.
                      </p>
                      <div className="mt-3 p-3 rounded-md bg-muted/50 text-sm">
                        <p className="font-medium mb-1">Example:</p>
                        <p className="text-muted-foreground"><strong>Objective:</strong> Become the market leader in customer satisfaction</p>
                        <p className="text-muted-foreground mt-1"><strong>KR1:</strong> Increase NPS score from 45 to 70</p>
                        <p className="text-muted-foreground"><strong>KR2:</strong> Reduce average response time to under 2 hours</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
                    <CustomIcon.TrendingUp className="w-5 h-5 text-[#DC2626] mt-1 flex-shrink-0" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">Why Use OKRs?</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CustomIcon.CheckCircle className="w-4 h-4 mt-0.5 text-[#DC2626] flex-shrink-0" />
                          <span><strong>Alignment:</strong> Ensures everyone is working toward the same goals</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CustomIcon.CheckCircle className="w-4 h-4 mt-0.5 text-[#DC2626] flex-shrink-0" />
                          <span><strong>Focus:</strong> Helps teams prioritize what matters most</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CustomIcon.CheckCircle className="w-4 h-4 mt-0.5 text-[#DC2626] flex-shrink-0" />
                          <span><strong>Transparency:</strong> Makes goals visible across the organization</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CustomIcon.CheckCircle className="w-4 h-4 mt-0.5 text-[#DC2626] flex-shrink-0" />
                          <span><strong>Accountability:</strong> Creates clear ownership and measurable outcomes</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CustomIcon.CheckCircle className="w-4 h-4 mt-0.5 text-[#DC2626] flex-shrink-0" />
                          <span><strong>Agility:</strong> Enables quick adjustments based on progress</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
                    <CustomIcon.Users className="w-5 h-5 text-[#DC2626] mt-1 flex-shrink-0" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">Who Uses OKRs?</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Companies like Google, LinkedIn, Twitter, Uber, and thousands of others use OKRs to drive growth and alignment.
                        From startups to enterprises, OKRs work for teams of any size.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* How to Use Tab */}
              <TabsContent value="how-to-use" className="space-y-6 mt-0">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
                    <CustomIcon.Rocket className="w-5 h-5 text-[#DC2626] mt-1 flex-shrink-0" />
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">Getting Started with OKR Autopilot</h3>
                      <ol className="space-y-3 text-sm text-muted-foreground">
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#DC2626]/10 text-[#DC2626] flex items-center justify-center font-semibold text-xs">1</span>
                          <div>
                            <strong className="text-foreground">Enter Company Details:</strong> Provide your company website and planning period. Our AI will analyze your business context.
                          </div>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#DC2626]/10 text-[#DC2626] flex items-center justify-center font-semibold text-xs">2</span>
                          <div>
                            <strong className="text-foreground">Review Generated OKRs:</strong> AI creates strategic objectives aligned with your business goals. Edit and refine them to match your vision.
                          </div>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#DC2626]/10 text-[#DC2626] flex items-center justify-center font-semibold text-xs">3</span>
                          <div>
                            <strong className="text-foreground">Invite Your Team:</strong> Share OKRs with team members. They'll receive personalized OKRs aligned with your goals.
                          </div>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#DC2626]/10 text-[#DC2626] flex items-center justify-center font-semibold text-xs">4</span>
                          <div>
                            <strong className="text-foreground">Track Progress:</strong> Monitor team progress through the dashboard. Update metrics weekly for accountability.
                          </div>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#DC2626]/10 text-[#DC2626] flex items-center justify-center font-semibold text-xs">5</span>
                          <div>
                            <strong className="text-foreground">Export & Share:</strong> Export OKRs in multiple formats (Markdown, CSV, JSON) to share with stakeholders.
                          </div>
                        </li>
                      </ol>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
                    <CustomIcon.Lightbulb className="w-5 h-5 text-[#DC2626] mt-1 flex-shrink-0" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">Tips for Success</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-[#DC2626] font-bold">•</span>
                          <span>Start with 3-5 objectives per person/team - focus on quality over quantity</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#DC2626] font-bold">•</span>
                          <span>Make key results measurable with specific numbers and deadlines</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#DC2626] font-bold">•</span>
                          <span>Review and update progress weekly to maintain momentum</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#DC2626] font-bold">•</span>
                          <span>Set ambitious but achievable goals - aim for 70-80% completion</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#DC2626] font-bold">•</span>
                          <span>Ensure team OKRs align with and support leadership OKRs</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Best Practices Tab */}
              <TabsContent value="best-practices" className="space-y-6 mt-0">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
                    <CustomIcon.CheckCircle className="w-5 h-5 text-[#DC2626] mt-1 flex-shrink-0" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">Writing Great Objectives</h3>
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="font-medium text-foreground mb-1">✅ Good Objective:</p>
                          <p className="text-muted-foreground italic">"Become the most trusted brand in our industry"</p>
                        </div>
                        <div>
                          <p className="font-medium text-destructive mb-1">❌ Poor Objective:</p>
                          <p className="text-muted-foreground italic">"Do marketing stuff"</p>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          Objectives should be <strong>qualitative, inspirational, and time-bound</strong>. They answer "What do we want to achieve?"
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
                    <CustomIcon.Target className="w-5 h-5 text-[#DC2626] mt-1 flex-shrink-0" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">Writing Great Key Results</h3>
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="font-medium text-foreground mb-1">✅ Good Key Results:</p>
                          <p className="text-muted-foreground italic">• Increase customer retention from 75% to 90%</p>
                          <p className="text-muted-foreground italic">• Reduce churn rate from 5% to 2%</p>
                          <p className="text-muted-foreground italic">• Achieve NPS score of 70+</p>
                        </div>
                        <div>
                          <p className="font-medium text-destructive mb-1">❌ Poor Key Results:</p>
                          <p className="text-muted-foreground italic">• Make customers happy</p>
                          <p className="text-muted-foreground italic">• Improve retention</p>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          Key Results must be <strong>quantitative, measurable, and verifiable</strong>. They answer "How will we know if we achieved the objective?"
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
                    <CustomIcon.TrendingUp className="w-5 h-5 text-[#DC2626] mt-1 flex-shrink-0" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">Common Pitfalls to Avoid</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <span className="text-destructive font-bold">×</span>
                          <span><strong>Setting too many OKRs</strong> - Focus on 3-5 per quarter, not 20</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-destructive font-bold">×</span>
                          <span><strong>Making KRs tasks instead of outcomes</strong> - "Launch feature X" → "Increase engagement by 30%"</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-destructive font-bold">×</span>
                          <span><strong>Set and forget</strong> - Review progress weekly, adjust as needed</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-destructive font-bold">×</span>
                          <span><strong>Making them too easy</strong> - 100% achievement means you didn't aim high enough</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-destructive font-bold">×</span>
                          <span><strong>Lack of alignment</strong> - Team OKRs should support company OKRs</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* About Lamatic Tab */}
              <TabsContent value="lamatic" className="space-y-6 mt-0">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-[#DC2626]/10 to-[#DC2626]/5 border border-[#DC2626]/20">
                    <CustomIcon.Zap className="w-5 h-5 text-[#DC2626] mt-1 flex-shrink-0" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">What is Lamatic?</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Lamatic is a powerful AI development platform that helps teams build, deploy, and scale AI applications 10x faster.
                        From AI agents to complex workflows, Lamatic provides the infrastructure you need without the overhead.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="p-4 rounded-lg bg-card border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <CustomIcon.Zap className="w-4 h-4 text-[#DC2626]" />
                        <h4 className="font-semibold">10x Faster Development</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">Build AI features in days, not months. Lamatic handles the complexity.</p>
                    </div>

                    <div className="p-4 rounded-lg bg-card border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <CustomIcon.Target className="w-4 h-4 text-[#DC2626]" />
                        <h4 className="font-semibold">$30K+ Annual Savings</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">Smart teams are cutting infrastructure costs significantly.</p>
                    </div>

                    <div className="p-4 rounded-lg bg-card border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <CustomIcon.TrendingUp className="w-4 h-4 text-[#DC2626]" />
                        <h4 className="font-semibold">Production-Ready AI</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">Deploy reliable AI with built-in monitoring and optimization.</p>
                    </div>

                    <div className="p-4 rounded-lg bg-card border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <CustomIcon.Rocket className="w-4 h-4 text-[#DC2626]" />
                        <h4 className="font-semibold">Any LLM, One Platform</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">Switch between GPT, Claude, Gemini with one line of code.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
                    <CustomIcon.BookOpen className="w-5 h-5 text-[#DC2626] mt-1 flex-shrink-0" />
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">Key Features</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CustomIcon.CheckCircle className="w-4 h-4 mt-0.5 text-[#DC2626] flex-shrink-0" />
                          <span><strong>AI Agents:</strong> Build autonomous agents that handle complex workflows</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CustomIcon.CheckCircle className="w-4 h-4 mt-0.5 text-[#DC2626] flex-shrink-0" />
                          <span><strong>Visual Workflow Builder:</strong> Create AI pipelines with drag-and-drop simplicity</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CustomIcon.CheckCircle className="w-4 h-4 mt-0.5 text-[#DC2626] flex-shrink-0" />
                          <span><strong>Smart Caching:</strong> Reduce API costs by up to 80% with intelligent caching</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CustomIcon.CheckCircle className="w-4 h-4 mt-0.5 text-[#DC2626] flex-shrink-0" />
                          <span><strong>Built-in Monitoring:</strong> Track performance, costs, and quality in real-time</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CustomIcon.CheckCircle className="w-4 h-4 mt-0.5 text-[#DC2626] flex-shrink-0" />
                          <span><strong>Easy Integrations:</strong> Connect to 100+ tools and services out of the box</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-br from-[#DC2626]/10 to-[#DC2626]/5 border border-[#DC2626]/20">
                    <h3 className="font-semibold mb-2">Learn More</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Ready to build your own AI applications? Visit Lamatic to get started for free.
                    </p>
                    <Button
                      size="sm"
                      className="bg-[#DC2626] hover:bg-[#DC2626]/90"
                      onClick={() => window.open('https://lamatic.ai/', '_blank')}
                    >
                      <CustomIcon.Rocket className="w-4 h-4 mr-2" />
                      Explore Lamatic Platform
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </header>
  )
}
