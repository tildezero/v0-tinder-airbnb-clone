"use client"

import { useState, useEffect } from "react"
import { Check, X, Star, User, Home } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/context"
import { storage } from "@/lib/storage"
import type { Request } from "@/lib/types"
import { useRouter } from "next/navigation"

export default function RequestsPage() {
  const { user } = useApp()
  const router = useRouter()
  const [requests, setRequests] = useState<Request[]>([])
  const [currentRequestIndex, setCurrentRequestIndex] = useState(0)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    // Get all pending requests for properties owned by current user
    const allRequests = storage.getRequests()
    const userProperties = storage.getProperties().filter((p) => p.hostId === user.id)
    const userPropertyIds = userProperties.map((p) => p.id)
    
    const pendingRequests = allRequests.filter(
      (r) => r.status === "pending" && userPropertyIds.includes(r.propertyId)
    )
    
    setRequests(pendingRequests)
  }, [user, router])

  const currentRequest = requests[currentRequestIndex]

  const handleAccept = () => {
    if (!currentRequest) return
    
    storage.updateRequest(currentRequest.id, { status: "accepted" })
    const updated = requests.filter((r) => r.id !== currentRequest.id)
    setRequests(updated)
    
    if (updated.length > 0) {
      setCurrentRequestIndex(Math.min(currentRequestIndex, updated.length - 1))
    }
  }

  const handleReject = () => {
    if (!currentRequest) return
    
    storage.updateRequest(currentRequest.id, { status: "rejected" })
    const updated = requests.filter((r) => r.id !== currentRequest.id)
    setRequests(updated)
    
    if (updated.length > 0) {
      setCurrentRequestIndex(Math.min(currentRequestIndex, updated.length - 1))
    }
  }

  if (!user) {
    return null
  }

  if (requests.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container mx-auto px-6 py-8 max-w-4xl">
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">No Requests</h1>
            <p className="text-muted-foreground">You don't have any pending requests at the moment.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="bg-card rounded-xl border border-border p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">New Request!</h1>
            <span className="text-sm text-muted-foreground">
              {currentRequestIndex + 1} of {requests.length}
            </span>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
              <span className="text-4xl">👤</span>
            </div>
            <h2 className="text-2xl font-bold">{currentRequest.requesterName}</h2>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                <span>User Rating</span>
              </div>
              <span className="font-semibold">{currentRequest.requesterRating}/5</span>
            </div>

            {currentRequest.requesterAge && (
              <div className="flex items-center justify-between py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span>User Age</span>
                </div>
                <span className="font-semibold">{currentRequest.requesterAge} y/o</span>
              </div>
            )}

            <div className="flex items-center justify-between py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                <span>Property Requested</span>
              </div>
              <span className="font-semibold">{currentRequest.propertyTitle}</span>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">Text of Request</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{currentRequest.message}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              className="bg-success hover:bg-success/90 text-success-foreground gap-2"
              size="lg"
              onClick={handleAccept}
            >
              <Check className="w-5 h-5" />
              Accept
            </Button>
            <Button variant="destructive" className="gap-2" size="lg" onClick={handleReject}>
              <X className="w-5 h-5" />
              Reject
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
