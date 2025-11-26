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
  const [reservationNumber, setReservationNumber] = useState("")
  const [booking, setBooking] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

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

  const handleLookupReservation = async () => {
    if (!reservationNumber.trim()) {
      setError("Please enter a reservation number")
      return
    }

    try {
      const bookings = await api.getBookings(user?.id)
      const found = bookings.find(
        (b: any) => b.reservation_number === reservationNumber.trim() && b.property_id === property?.id
      )

      if (!found) {
        setError("Reservation not found for this property. Please check your reservation number.")
        return
      }

      setBooking(found)
      setError("")
    } catch (error) {
      setError("Failed to lookup reservation. Please try again.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !property || !comment.trim()) return

    if (!reservationNumber.trim() || !booking) {
      setError("Please enter and verify your reservation number")
      return
    }

    setIsSubmitting(true)

    try {
      await api.createReview({
        id: Date.now().toString(),
        property_id: property.id,
        user_id: user.id,
        user_name: user.name,
        rating,
        comment,
        reservation_number: reservationNumber,
        stay_start_date: booking.start_date,
        stay_end_date: booking.end_date,
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
              <Label htmlFor="reservationNumber">Reservation Number *</Label>
              <div className="flex gap-2">
                <Input
                  id="reservationNumber"
                  placeholder="Enter your reservation number"
                  value={reservationNumber}
                  onChange={(e) => setReservationNumber(e.target.value)}
                  required
                />
                <Button type="button" onClick={handleLookupReservation} variant="outline">
                  Verify
                </Button>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              {booking && (
                <div className="bg-muted p-3 rounded-lg text-sm">
                  <p className="font-semibold">Reservation Verified</p>
                  <p className="text-muted-foreground">
                    Stay: {new Date(booking.start_date).toLocaleDateString("en-GB")} -{" "}
                    {new Date(booking.end_date).toLocaleDateString("en-GB")}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Rating (1-10 stars) *</Label>
              <div className="flex gap-1 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating ? "fill-primary text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">Selected: {rating} out of 10 stars</p>
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

