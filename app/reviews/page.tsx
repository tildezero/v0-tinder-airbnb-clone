"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Star, MessageSquare } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { useApp } from "@/lib/context"
import { api } from "@/lib/api"
import type { Review } from "@/lib/types"

export default function ReviewsPage() {
  const router = useRouter()
  const { user } = useApp()
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    loadReviews()
  }, [user, router])

  const loadReviews = async () => {
    try {
      setIsLoading(true)
      const userReviews = await api.getReviews(undefined, user?.id)
      setReviews(userReviews)
    } catch (error) {
      console.error("Failed to load reviews:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="flex items-center gap-2 mb-8">
          <MessageSquare className="w-6 h-6" />
          <h1 className="text-3xl font-bold">My Reviews</h1>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">You haven't written any reviews yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold mb-1">Property #{review.property_id}</h3>
                    <div className="flex items-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? "fill-primary text-primary" : "text-muted-foreground"
                          }`}
                        />
                      ))}
                      <span className="text-sm text-muted-foreground ml-2">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

