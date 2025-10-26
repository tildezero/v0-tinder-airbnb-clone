"use client"

import { Check, X } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"

export default function RequestsPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="bg-card rounded-xl border border-border p-8">
          <h1 className="text-2xl font-bold mb-8">New Request!</h1>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
              <span className="text-4xl">👤</span>
            </div>
            <h2 className="text-2xl font-bold">Firstname Lastname</h2>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                <span>User Rating</span>
              </div>
              <span className="font-semibold">4.5/5</span>
            </div>

            <div className="flex items-center justify-between py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>User Age</span>
              </div>
              <span className="font-semibold">28 y/o</span>
            </div>

            <div className="flex items-center justify-between py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                <span>Property Requested</span>
              </div>
              <span className="font-semibold">Property Name Goes Here</span>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">Text of Request</h3>
            <p className="text-muted-foreground">Lorem ipsum....</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button className="bg-success hover:bg-success/90 text-success-foreground gap-2" size="lg">
              <Check className="w-5 h-5" />
              Accept
            </Button>
            <Button variant="destructive" className="gap-2" size="lg">
              <X className="w-5 h-5" />
              Reject
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

function Star({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  )
}

function User({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  )
}

function Home({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  )
}
