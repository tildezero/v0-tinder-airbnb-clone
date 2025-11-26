"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Star, Send } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useApp } from "@/lib/context"
import { api } from "@/lib/api"
import type { Property } from "@/lib/types"

export default function WriteReviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useApp()
  const [property, setProperty] = useState<Property | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const propertyId = searchParams.get("propertyId")

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (propertyId) {
      loadProperty()
    }
  }, [propertyId, user, router])

  const loadProperty = async () => {
    try {
      const properties = await api.getProperties()
      const found = properties.find((p: Property) => p.id === Number.parseInt(propertyId || "0"))
      if (found) {
        setProperty(found)
      }
    } catch (error) {
      console.error("Failed to load property:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !property || !comment.trim()) return

    setIsSubmitting(true)

    try {
      await api.createReview({
        id: Date.now().toString(),
        property_id: property.id,
        user_id: user.id,
        user_name: user.name,
        rating,
        comment,
      })

      router.push(`/listing/${property.id}`)
    } catch (error) {
      alert("Failed to submit review. Please try again.")
      setIsSubmitting(false)
    }
  }

  if (!user || !property) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container mx-auto px-6 py-8">
          <p className="text-center text-muted-foreground">Loading...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-6 py-8 max-w-2xl">
        <div className="bg-card rounded-xl border border-border p-8">
          <h1 className="text-2xl font-bold mb-2">Write a Review</h1>
          <p className="text-muted-foreground mb-6">{property.title}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating ? "fill-primary text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Your Review</Label>
              <Textarea
                id="comment"
                placeholder="Share your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[150px]"
                required
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}

