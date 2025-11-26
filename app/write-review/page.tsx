"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Star, Send, User, Home } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useApp } from "@/lib/context"
import { api } from "@/lib/api"
import type { Property, Booking } from "@/lib/types"

export default function WriteReviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useApp()
  const [property, setProperty] = useState<Property | null>(null)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [rating, setRating] = useState(3)
  const [comment, setComment] = useState("")
  const [reservationNumber, setReservationNumber] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [availableBookings, setAvailableBookings] = useState<Booking[]>([])

  const propertyId = searchParams.get("propertyId")
  const bookingId = searchParams.get("bookingId")

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (propertyId) {
      loadProperty()
    }

    if (bookingId) {
      loadBooking()
    } else if (user.account_type === "renter") {
      loadRenterBookings()
    } else if (user.account_type === "homeowner") {
      loadHomeownerBookings()
    }
  }, [propertyId, bookingId, user, router])

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

  const loadBooking = async () => {
    try {
      const bookings = await api.getBookings()
      const found = bookings.find((b: Booking) => b.id === Number.parseInt(bookingId || "0"))
      if (found) {
        setBooking(found)
        setReservationNumber(found.reservation_number || "")
        if (found.property_id && !propertyId) {
          const properties = await api.getProperties()
          const prop = properties.find((p: Property) => p.id === found.property_id)
          if (prop) setProperty(prop)
        }
      }
    } catch (error) {
      console.error("Failed to load booking:", error)
    }
  }

  const loadRenterBookings = async () => {
    try {
      const bookings = await api.getBookings(user?.id)
      // Filter out cancelled bookings and only show confirmed/completed bookings
      const activeBookings = bookings.filter((b: Booking) => 
        b.status !== "cancelled" && (b.status === "confirmed" || b.status === "completed")
      )
      // Only show bookings for the specific property if propertyId is provided
      const filtered = propertyId
        ? activeBookings.filter((b: Booking) => b.property_id === Number.parseInt(propertyId))
        : activeBookings
      setAvailableBookings(filtered)
    } catch (error) {
      console.error("Failed to load bookings:", error)
    }
  }

  const loadHomeownerBookings = async () => {
    try {
      // Get all bookings for properties owned by this homeowner
      const properties = await api.getProperties(user?.id)
      const propertyIds = properties.map((p: Property) => p.id)
      
      const allBookings = await api.getBookings()
      const filtered = allBookings.filter((b: Booking) => 
        propertyIds.includes(b.property_id) && 
        b.status !== "cancelled" && 
        (b.status === "confirmed" || b.status === "completed")
      )
      setAvailableBookings(filtered)
    } catch (error) {
      console.error("Failed to load bookings:", error)
    }
  }

  const handleLookupReservation = async () => {
    if (!reservationNumber.trim()) {
      setError("Please enter a reservation number")
      return
    }

    try {
      if (user?.account_type === "renter") {
        const bookings = await api.getBookings(user.id)
        const found = bookings.find(
          (b: Booking) => b.reservation_number === reservationNumber.trim()
        )
        if (!found) {
          setError("Reservation not found. Please check your reservation number.")
          return
        }
        setBooking(found)
        if (found.property_id) {
          const properties = await api.getProperties()
          const prop = properties.find((p: Property) => p.id === found.property_id)
          if (prop) setProperty(prop)
        }
      } else if (user?.account_type === "homeowner") {
        const properties = await api.getProperties(user.id)
        const propertyIds = properties.map((p: Property) => p.id)
        const allBookings = await api.getBookings()
        const found = allBookings.find(
          (b: Booking) => 
            b.reservation_number === reservationNumber.trim() && 
            propertyIds.includes(b.property_id)
        )
        if (!found) {
          setError("Reservation not found for your properties. Please check your reservation number.")
          return
        }
        setBooking(found)
        if (found.property_id) {
          const properties = await api.getProperties()
          const prop = properties.find((p: Property) => p.id === found.property_id)
          if (prop) setProperty(prop)
        }
      }
      setError("")
    } catch (error) {
      setError("Failed to lookup reservation. Please try again.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !comment.trim()) return

    if (user.account_type === "renter") {
      // Renter reviewing property
      if (!property || !booking) {
        setError("Please select a booking to review")
        return
      }

      if (!reservationNumber.trim()) {
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
          review_type: "property",
        })

        // Refresh the page to show the new review
        window.location.href = `/listing/${property.id}`
      } catch (error) {
        alert("Failed to submit review. Please try again.")
        setIsSubmitting(false)
      }
    } else if (user.account_type === "homeowner") {
      // Homeowner reviewing renter
      if (!booking) {
        setError("Please select a booking to review the renter")
        return
      }

      setIsSubmitting(true)
      try {
        await api.createRenterReview({
          id: Date.now().toString(),
          booking_id: booking.id,
          property_id: booking.property_id,
          renter_id: booking.renter_id || "",
          renter_name: booking.guest_first_name && booking.guest_last_name
            ? `${booking.guest_first_name} ${booking.guest_last_name}`
            : "Guest",
          homeowner_id: user.id,
          homeowner_name: user.name,
          rating,
          comment,
          reservation_number: booking.reservation_number || "",
        })

        alert("Review submitted successfully!")
        router.push(`/reviews`)
      } catch (error: any) {
        alert(error.message || "Failed to submit review. Please try again.")
        setIsSubmitting(false)
      }
    }
  }

  if (!user) {
    return null
  }

  const isRenter = user.account_type === "renter"
  const isHomeowner = user.account_type === "homeowner"

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-6 py-8 max-w-2xl">
        <div className="bg-card rounded-xl border border-border p-8">
          <div className="flex items-center gap-2 mb-2">
            {isRenter ? (
              <Home className="w-6 h-6" />
            ) : (
              <User className="w-6 h-6" />
            )}
            <h1 className="text-2xl font-bold">
              {isRenter ? "Review Property" : "Review Renter"}
            </h1>
          </div>
          
          {isRenter && property && (
            <p className="text-muted-foreground mb-6">{property.title}</p>
          )}

          {isHomeowner && booking && (
            <div className="bg-muted p-4 rounded-lg mb-6">
              <p className="font-semibold mb-1">Reviewing:</p>
              <p className="text-sm">
                {booking.guest_first_name && booking.guest_last_name
                  ? `${booking.guest_first_name} ${booking.guest_last_name}`
                  : "Guest"}
              </p>
              {property && <p className="text-sm text-muted-foreground">{property.title}</p>}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isRenter && (
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
                {availableBookings.length > 0 && !booking && (
                  <div className="space-y-2 mt-2">
                    <Label>Or select from your bookings:</Label>
                    <select
                      className="w-full p-2 border rounded-lg bg-input"
                      onChange={(e) => {
                        const selected = availableBookings.find(
                          (b: Booking) => b.id === Number.parseInt(e.target.value)
                        )
                        if (selected) {
                          setBooking(selected)
                          setReservationNumber(selected.reservation_number || "")
                        }
                      }}
                    >
                      <option value="">Select a booking...</option>
                      {availableBookings.map((b: Booking) => (
                        <option key={b.id} value={b.id}>
                          {b.property_title} - {b.reservation_number} ({new Date(b.start_date).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {isHomeowner && (
              <div className="space-y-2">
                <Label>Select Booking to Review Renter *</Label>
                {availableBookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No bookings available to review</p>
                ) : (
                  <select
                    className="w-full p-2 border rounded-lg bg-input"
                    onChange={async (e) => {
                      const selected = availableBookings.find(
                        (b: Booking) => b.id === Number.parseInt(e.target.value)
                      )
                      if (selected) {
                        setBooking(selected)
                        setReservationNumber(selected.reservation_number || "")
                        try {
                          const properties = await api.getProperties()
                          const prop = properties.find((p: Property) => p.id === selected.property_id)
                          if (prop) setProperty(prop)
                        } catch (error) {
                          console.error("Failed to load property:", error)
                        }
                      }
                    }}
                    required
                  >
                    <option value="">Select a booking...</option>
                    {availableBookings.map((b: Booking) => (
                      <option key={b.id} value={b.id}>
                        {b.guest_first_name && b.guest_last_name
                          ? `${b.guest_first_name} ${b.guest_last_name}`
                          : "Guest"} - {b.property_title} ({b.reservation_number})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Rating (1-5 stars) *</Label>
              <div className="flex gap-1 flex-wrap">
                {[1, 2, 3, 4, 5].map((star) => (
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
              <p className="text-sm text-muted-foreground">Selected: {rating} out of 5 stars</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Your Review *</Label>
              <Textarea
                id="comment"
                placeholder={isRenter ? "Share your experience with this property..." : "Share your experience with this renter..."}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[150px]"
                required
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || !booking}>
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
