import type React from "react"
import type { Metadata } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "next-themes"
import "./globals.css"

const _inter = Inter({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "OKR Autopilot by Lamatic | Free AI-Powered Goal Planning",
  description:
    "Free AI-powered OKR tool that creates alignment and weekly accountability across your team with zero overhead.",
  keywords: "OKR tool, objectives key results, goal setting, team planning, AI planning, Lamatic, strategic planning",
  openGraph: {
    title: "OKR Autopilot by Lamatic",
    description: "Free AI-powered OKR tool that creates alignment and weekly accountability across your team with zero overhead.",
    type: "website",
  },
    generator: 'v0.app'
}

export const viewport = {
  themeColor: "#0a0a0f",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
