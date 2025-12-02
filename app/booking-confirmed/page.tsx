"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, Home } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import type { Booking } from "@/lib/types"

function BookingConfirmedContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [booking, setBooking] = useState<Booking | null>(null)

  const bookingId = searchParams.get("id")

  useEffect(() => {
    if (bookingId) {
      loadBooking()
    }
  }, [bookingId])

  const loadBooking = async () => {
    try {
      const bookings = await api.getBookings()
      const found = bookings.find((b: Booking) => b.id === Number.parseInt(bookingId || "0"))
      if (found) {
        setBooking(found)
      }
    } catch (error) {
      console.error("Failed to load booking:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-6 py-8 max-w-2xl">
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-muted-foreground mb-6">
            Your payment has been processed successfully. Your booking is confirmed.
          </p>

          {booking && (
            <div className="bg-muted rounded-lg p-6 mb-6 text-left">
              <h2 className="font-semibold mb-4">Booking Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Property:</span>
                  <span className="font-semibold">{booking.property_title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-semibold">{booking.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-in:</span>
                  <span className="font-semibold">{new Date(booking.start_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-out:</span>
                  <span className="font-semibold">{new Date(booking.end_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-semibold">${booking.total_price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <Button asChild variant="outline">
              <a href="/search">Browse More Properties</a>
            </Button>
            <Button asChild>
              <a href="/my-bookings">
                <Home className="w-4 h-4 mr-2" />
                View My Bookings
              </a>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function BookingConfirmedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingConfirmedContent />
    </Suspense>
  )
}

