"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { XCircle, AlertTriangle } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApp } from "@/lib/context"
import { api } from "@/lib/api"
import type { Booking } from "@/lib/types"

export default function CancelReservationPage() {
  const router = useRouter()
  const { user } = useApp()
  const [reservationNumber, setReservationNumber] = useState("")
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isCancelling, setIsCancelling] = useState(false)

  const handleLookup = async () => {
    if (!reservationNumber.trim()) {
      setError("Please enter a reservation number")
      return
    }

    setIsLoading(true)
    setError("")
    setBooking(null)

    try {
      const bookings = await api.getBookings(user?.id)
      const found = bookings.find(
        (b: Booking) => b.reservation_number === reservationNumber.trim()
      )

      if (!found) {
        setError("Reservation not found. Please check your reservation number.")
        setIsLoading(false)
        return
      }

      // Check if cancellation is allowed (at least 5 days before rental start)
      const startDate = new Date(found.start_date)
      const today = new Date()
      const daysUntilStart = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntilStart < 5) {
        setError(
          `Cancellation is only allowed if the current date is at least 5 days before the rental start date. Your rental starts in ${daysUntilStart} day(s).`
        )
        setIsLoading(false)
        return
      }

      if (found.status === "cancelled") {
        setError("This reservation has already been cancelled.")
        setIsLoading(false)
        return
      }

      setBooking(found)
    } catch (error) {
      setError("Failed to lookup reservation. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!booking) return

    setIsCancelling(true)
    try {
      // Calculate refund (total minus 3% cancellation fee)
      const cancellationFee = booking.total_price * 0.03
      const refundAmount = booking.total_price - cancellationFee

      // Update booking status to cancelled
      await api.updateBooking(booking.id, "cancelled")

      alert(
        `Reservation cancelled successfully!\n\nRefund Details:\nTotal: $${booking.total_price.toFixed(2)}\nCancellation Fee (3%): $${cancellationFee.toFixed(2)}\nRefund Amount: $${refundAmount.toFixed(2)}\n\nThe refund will be processed to your credit card.`
      )

      router.push("/search")
    } catch (error) {
      alert("Failed to cancel reservation. Please try again.")
      setIsCancelling(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-6 py-8 max-w-2xl">
        <div className="bg-card rounded-xl border border-border p-8">
          <div className="flex items-center gap-2 mb-6">
            <XCircle className="w-6 h-6" />
            <h1 className="text-2xl font-bold">Cancel Reservation</h1>
          </div>

          {!user && (
            <div className="bg-muted p-4 rounded-lg mb-6">
              <p className="text-sm text-muted-foreground">
                Please{" "}
                <a href="/login" className="text-primary hover:underline">
                  log in
                </a>{" "}
                to cancel a reservation.
              </p>
            </div>
          )}

          {user && (
            <>
              <div className="space-y-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="reservationNumber">Reservation Number *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="reservationNumber"
                      placeholder="Enter reservation number (e.g., RES-1234567890-123)"
                      value={reservationNumber}
                      onChange={(e) => setReservationNumber(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleLookup()
                        }
                      }}
                    />
                    <Button onClick={handleLookup} disabled={isLoading}>
                      {isLoading ? "Looking up..." : "Lookup"}
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}
              </div>

              {booking && (
                <div className="bg-muted rounded-lg p-6 space-y-4">
                  <h2 className="font-semibold text-lg">Reservation Details</h2>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reservation Number:</span>
                      <span className="font-semibold">{booking.reservation_number}</span>
                    </div>
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
                      <span className="font-semibold">
                        {new Date(booking.start_date).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-out:</span>
                      <span className="font-semibold">
                        {new Date(booking.end_date).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Paid:</span>
                      <span className="font-semibold">${booking.total_price.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 mt-4">
                    <h3 className="font-semibold mb-2">Cancellation Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cancellation Fee (3%):</span>
                        <span className="font-semibold text-destructive">
                          -${(booking.total_price * 0.03).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg border-t border-border pt-2">
                        <span>Refund Amount:</span>
                        <span className="text-success">
                          ${(booking.total_price * 0.97).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      The refund will be processed to your credit card within 5-7 business days.
                    </p>
                  </div>

                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleCancel}
                    disabled={isCancelling}
                  >
                    {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

