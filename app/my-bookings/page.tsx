"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, MapPin, XCircle, Star, FileText } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/context"
import { api } from "@/lib/api"
import type { Booking } from "@/lib/types"
import Link from "next/link"

export default function MyBookingsPage() {
  const router = useRouter()
  const { user } = useApp()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (user.account_type !== "renter") {
      router.push("/search")
      return
    }

    loadBookings()
  }, [user, router])

  const loadBookings = async () => {
    try {
      setIsLoading(true)
      const userBookings = await api.getBookings(user?.id)
      // Sort by most recent first
      const sorted = userBookings.sort((a: Booking, b: Booking) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
      setBookings(sorted)
    } catch (error) {
      console.error("Failed to load bookings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async (booking: Booking) => {
    if (!booking.reservation_number) {
      alert("Reservation number not found")
      return
    }

    // Check if cancellation is allowed (at least 5 days before rental start)
    const startDate = new Date(booking.start_date)
    const today = new Date()
    const daysUntilStart = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilStart < 5) {
      alert(
        `Cancellation is only allowed if the current date is at least 5 days before the rental start date. Your rental starts in ${daysUntilStart} day(s).`
      )
      return
    }

    if (booking.status === "cancelled") {
      alert("This reservation has already been cancelled.")
      return
    }

    if (!confirm("Are you sure you want to cancel this reservation? A 3% cancellation fee will apply.")) {
      return
    }

    try {
      await api.updateBooking(booking.id, "cancelled")
      const cancellationFee = booking.total_price * 0.03
      const refundAmount = booking.total_price - cancellationFee

      alert(
        `Reservation cancelled successfully!\n\nRefund Details:\nTotal: $${booking.total_price.toFixed(2)}\nCancellation Fee (3%): $${cancellationFee.toFixed(2)}\nRefund Amount: $${refundAmount.toFixed(2)}\n\nThe refund will be processed to your credit card.`
      )

      loadBookings()
    } catch (error) {
      alert("Failed to cancel reservation. Please try again.")
    }
  }

  const handleViewInvoice = (booking: Booking) => {
    if (booking.reservation_number) {
      router.push(`/invoice?reservation=${booking.reservation_number}`)
    }
  }

  const handleWriteReview = (booking: Booking) => {
    if (booking.property_id) {
      router.push(`/write-review?propertyId=${booking.property_id}`)
    }
  }

  if (!user || user.account_type !== "renter") {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container mx-auto px-6 py-8">
          <p className="text-center text-muted-foreground">Loading bookings...</p>
        </main>
      </div>
    )
  }

  const activeBookings = bookings.filter((b) => b.status !== "cancelled")
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled")

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Bookings</h1>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Bookings Yet</h2>
            <p className="text-muted-foreground mb-6">
              Start exploring properties and make your first booking!
            </p>
            <Button asChild>
              <Link href="/search">Browse Properties</Link>
            </Button>
          </div>
        ) : (
          <>
            {activeBookings.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Active Bookings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {booking.images && booking.images.length > 0 && (
                        <div className="aspect-video bg-muted">
                          <img
                            src={booking.images[0]}
                            alt={booking.property_title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="font-semibold text-lg mb-2">{booking.property_title}</h3>
                        <div className="space-y-2 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{booking.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(booking.start_date).toLocaleDateString("en-GB")} -{" "}
                              {new Date(booking.end_date).toLocaleDateString("en-GB")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">
                              ${booking.total_price.toFixed(2)}
                            </span>
                          </div>
                          {booking.reservation_number && (
                            <div className="text-xs">
                              Reservation: <span className="font-mono">{booking.reservation_number}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewInvoice(booking)}
                            className="w-full"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            View Invoice
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleWriteReview(booking)}
                            className="w-full"
                          >
                            <Star className="w-4 h-4 mr-2" />
                            Write Review
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancel(booking)}
                            className="w-full"
                            disabled={booking.status === "cancelled"}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel Reservation
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {cancelledBookings.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Cancelled Bookings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cancelledBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-card rounded-xl border border-border overflow-hidden opacity-60"
                    >
                      {booking.images && booking.images.length > 0 && (
                        <div className="aspect-video bg-muted">
                          <img
                            src={booking.images[0]}
                            alt={booking.property_title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">{booking.property_title}</h3>
                          <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded">
                            Cancelled
                          </span>
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{booking.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(booking.start_date).toLocaleDateString("en-GB")} -{" "}
                              {new Date(booking.end_date).toLocaleDateString("en-GB")}
                            </span>
                          </div>
                          {booking.reservation_number && (
                            <div className="text-xs">
                              Reservation: <span className="font-mono">{booking.reservation_number}</span>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewInvoice(booking)}
                          className="w-full"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View Invoice
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

