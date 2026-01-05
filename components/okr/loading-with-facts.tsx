"use client"

import { useEffect, useState } from "react"
import { Sparkles, Loader2 } from "lucide-react"

interface LoadingWithFactsProps {
  message?: string
}

interface Fact {
  icon: string
  text: string
  category: "speed" | "cost" | "scale" | "integration" | "technical" | "okr"
}

const LAMATIC_FACTS: Fact[] = [
  // Speed & Performance
  { icon: "⚡", text: "What used to take weeks now takes days. Lamatic speeds up AI development by 10x.", category: "speed" },
  { icon: "🚀", text: "Ship your AI app 3x faster using battle-tested templates that actually work.", category: "speed" },

  // Cost Savings
  { icon: "💰", text: "Smart teams are saving $30,000+ yearly by ditching expensive AI infrastructure.", category: "cost" },
  { icon: "💎", text: "Building from scratch? That's 3x more expensive than using Lamatic.", category: "cost" },

  // Scale & Reach
  { icon: "🌍", text: "Join 1,500+ AI builders who chose Lamatic to power their breakthrough apps.", category: "scale" },
  { icon: "📈", text: "From zero to millions of users - Lamatic scales automatically, no DevOps needed.", category: "scale" },
  { icon: "🏢", text: "Fortune 500 companies trust Lamatic with their mission-critical AI.", category: "scale" },

  // Integration Power
  { icon: "🔗", text: "Connect to 100+ AI models, databases, and tools - all in one unified platform.", category: "integration" },
  { icon: "🎨", text: "Start with no-code, then add custom code when you need it. Best of both worlds.", category: "integration" },
  { icon: "🔌", text: "One click to integrate with the tools you already love and use daily.", category: "integration" },

  // Technical Capabilities
  { icon: "🧠", text: "Your AI agents learn from your actual company data, not generic training sets.", category: "technical" },
  { icon: "📊", text: "See exactly what your AI is thinking with real-time tracing and performance metrics.", category: "technical" },
  { icon: "🛡️", text: "Sleep soundly with SOC 2 compliance and enterprise-grade encryption protecting your data.", category: "technical" },
  { icon: "⚙️", text: "JavaScript, Python, React, Next.js - use the language you already know and love.", category: "technical" },

  // OKR-Specific
  { icon: "🎯", text: "The same AI strategy engine used by Fortune 500 is analyzing your goals right now.", category: "okr" },
  { icon: "✨", text: "We've studied thousands of successful OKR frameworks to generate yours perfectly.", category: "okr" },
  { icon: "🤝", text: "Watch your team align effortlessly as AI connects everyone's goals automatically.", category: "okr" },
  { icon: "📝", text: "No generic templates here - every suggestion is customized for your company's DNA.", category: "okr" },
]

export function LoadingWithFacts({ message = "Analyzing and generating OKRs..." }: LoadingWithFactsProps) {
  const [currentFactIndex, setCurrentFactIndex] = useState(0)
  const [shownFacts, setShownFacts] = useState<Set<number>>(new Set())
  const [shuffledFacts, setShuffledFacts] = useState<Fact[]>([])
  const [fadeIn, setFadeIn] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)

  // Custom icon components
  const getStepIcon = (type: string, isActive: boolean, isPassed: boolean) => {
    const colorClass = isActive ? 'text-primary' : isPassed ? 'text-primary' : 'text-muted-foreground'

    switch(type) {
      case 'research':
        return (
          <svg className={`w-7 h-7 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )
      case 'analyze':
        return (
          <svg className={`w-7 h-7 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )
      case 'build':
        return (
          <svg className={`w-7 h-7 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        )
      case 'align':
        return (
          <svg className={`w-7 h-7 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'craft':
        return (
          <svg className={`w-7 h-7 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
          </svg>
        )
      case 'finalize':
        return (
          <svg className={`w-7 h-7 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return null
    }
  }

  // Pipeline steps for the flow animation
  const pipelineSteps = [
    { label: "Researching", type: "research", subtitle: "Company" },
    { label: "Analyzing", type: "analyze", subtitle: "Context" },
    { label: "Building", type: "build", subtitle: "Strategy" },
    { label: "Aligning", type: "align", subtitle: "Goals" },
    { label: "Crafting", type: "craft", subtitle: "OKRs" },
    { label: "Finalizing", type: "finalize", subtitle: "Results" },
  ]

  // Shuffle facts on mount and when all facts have been shown
  useEffect(() => {
    const shuffled = [...LAMATIC_FACTS].sort(() => Math.random() - 0.5)
    setShuffledFacts(shuffled)
    setShownFacts(new Set())
    setCurrentFactIndex(0)
  }, [])

  // Animate through pipeline steps
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % pipelineSteps.length)
    }, 1500) // Change step every 1.5 seconds for smoother flow

    return () => clearInterval(stepInterval)
  }, [pipelineSteps.length])

  // Rotate facts every 5 seconds (slower for better reading)
  useEffect(() => {
    if (shuffledFacts.length === 0) return

    const interval = setInterval(() => {
      setFadeIn(false)

      setTimeout(() => {
        setCurrentFactIndex((prevIndex) => {
          const newSet = new Set(shownFacts)
          newSet.add(prevIndex)

          // If all facts shown, reset
          if (newSet.size >= shuffledFacts.length) {
            setShownFacts(new Set())
            return 0
          }

          setShownFacts(newSet)

          // Find next unshown fact
          let nextIndex = (prevIndex + 1) % shuffledFacts.length
          while (newSet.has(nextIndex)) {
            nextIndex = (nextIndex + 1) % shuffledFacts.length
          }

          return nextIndex
        })
        setFadeIn(true)
      }, 500) // Longer fade out duration for smoother transition
    }, 5000) // Show each fact for 5 seconds

    return () => clearInterval(interval)
  }, [shuffledFacts, shownFacts])

  const currentFact = shuffledFacts[currentFactIndex]

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] py-12 px-4">
      {/* Main Loading Animation - Enhanced */}
      <div className="relative mb-8">
        {/* Outer rotating ring */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border-2 border-primary/20 border-t-primary/60 animate-spin"
               style={{ animationDuration: '3s' }} />
        </div>
        {/* Pulsing background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 animate-ping"
               style={{ animationDuration: '2s' }} />
        </div>
        {/* Center icon */}
        <div className="relative flex items-center justify-center w-24 h-24">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm border border-primary/30 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </div>
        </div>
      </div>

      {/* Loading Message */}
      <div className="text-center space-y-4 mb-12">
        <p className="text-2xl font-semibold text-foreground">
          {message}
        </p>
        <p className="text-sm text-muted-foreground italic">This may take a moment while our AI works its magic...</p>
      </div>

      {/* Lamatic Flow Pipeline Animation */}
      <div className="w-full max-w-7xl mb-10 px-4">
        <div className="relative py-6">
          {/* Background flow line */}
          <div className="absolute top-16 left-[8%] right-[8%] h-0.5">
            <div className="h-full bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          {/* Animated flowing line that fills as steps complete */}
          <div className="absolute top-16 left-[8%] right-[8%] h-0.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-700 ease-out"
              style={{
                width: `${(currentStep / (pipelineSteps.length - 1)) * 100}%`,
              }}
            >
              {/* Glowing tip of the flowing line */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full shadow-lg shadow-primary/50 animate-pulse" />
            </div>
          </div>

          {/* Pipeline steps */}
          <div className="relative grid grid-cols-6 gap-4">
            {pipelineSteps.map((step, index) => {
              const isActive = index === currentStep
              const isPassed = index < currentStep

              return (
                <div key={index} className="flex flex-col items-center gap-3 z-10">
                  {/* Step circle */}
                  <div className={`
                    relative flex items-center justify-center w-16 h-16 rounded-full border-2 transition-all duration-500 bg-background
                    ${isActive
                      ? 'border-primary scale-110 shadow-lg shadow-primary/30'
                      : isPassed
                        ? 'border-primary bg-primary/5'
                        : 'border-border/50'
                    }
                  `}>
                    {/* Pulsing ring for active step */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping"
                           style={{ animationDuration: '1.5s' }} />
                    )}

                    {/* Icon or Checkmark */}
                    {isPassed && !isActive ? (
                      <div className="flex items-center justify-center w-full h-full">
                        <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <div className={`transition-all duration-300 ${isActive ? 'scale-110' : ''}`}>
                        {getStepIcon(step.type, isActive, isPassed)}
                      </div>
                    )}
                  </div>

                  {/* Step label */}
                  <div className="text-center px-1">
                    <p className={`text-xs font-semibold transition-colors duration-300 ${
                      isActive ? 'text-primary' : isPassed ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.label}
                    </p>
                    <p className={`text-[10px] transition-colors duration-300 ${
                      isActive ? 'text-primary/80' : isPassed ? 'text-foreground/60' : 'text-muted-foreground/60'
                    }`}>
                      {step.subtitle}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Did You Know Card - Completely Redesigned */}
      {currentFact && (
        <div className="w-full max-w-2xl">
          <div className="relative group">
            {/* Animated border gradient */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50 rounded-2xl blur opacity-30 group-hover:opacity-40 transition duration-1000 animate-pulse"
                 style={{ animationDuration: '3s' }} />

            {/* Main card */}
            <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-background via-background to-primary/5 p-8 shadow-2xl backdrop-blur-xl">
              {/* Animated background elements */}
              <div className="absolute top-0 left-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"
                   style={{ animationDuration: '4s' }} />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse"
                   style={{ animationDuration: '5s', animationDelay: '1s' }} />

              <div className="relative">
                {/* Header with icon */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm border border-primary/30">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-primary uppercase tracking-wider">
                      Did You Know?
                    </span>
                    <p className="text-xs text-muted-foreground">Interesting facts about Lamatic</p>
                  </div>
                </div>

                {/* Fact content with slide animation */}
                <div
                  className={`transition-all duration-500 transform ${
                    fadeIn
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-5xl flex-shrink-0 mt-1 animate-pulse">
                      {currentFact.icon}
                    </div>
                    <p className="text-lg text-foreground font-medium leading-relaxed flex-1">
                      {currentFact.text}
                    </p>
                  </div>
                </div>

                {/* Category badge */}
                <div className="mt-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-medium text-primary capitalize">
                      {currentFact.category}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Powered by badge */}
      <div className="mt-8 flex items-center gap-2 px-4 py-2 rounded-full bg-muted/30 border border-border/50">
        <Sparkles className="w-3 h-3 text-primary" />
        <p className="text-xs font-medium text-muted-foreground">
          Powered by <span className="text-primary font-semibold">Lamatic AI</span>
        </p>
      </div>
    </div>
  )
}
