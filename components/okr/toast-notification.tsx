"use client"

import { useEffect } from "react"
import { useOKR } from "@/lib/okr-context"
import { X, CheckCircle } from "lucide-react"

export function ToastNotification() {
  const { toastMessage, setToastMessage } = useOKR()

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage, setToastMessage])

  if (!toastMessage) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
      <div className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3 shadow-lg max-w-sm">
        <CheckCircle className="w-5 h-5 text-accent shrink-0" />
        <p className="text-sm text-foreground">{toastMessage}</p>
        <button onClick={() => setToastMessage(null)} className="text-muted-foreground hover:text-foreground ml-2">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
