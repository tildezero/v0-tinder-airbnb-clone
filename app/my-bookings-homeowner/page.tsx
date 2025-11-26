"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, MapPin, Star, User } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { useApp } from "@/lib/context"
import { api } from "@/lib/api"
import type { Booking, Property } from "@/lib/types"

export default function MyBookingsHomeownerPage() {
  const router = useRouter()
  const { user } = useApp()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (user.account_type !== "homeowner") {
      router.push("/search")
      return
    }

    loadData()
  }, [user, router])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const myProperties = await api.getProperties(user?.id)
      setProperties(myProperties)
      
      const propertyIds = myProperties.map((p: Property) => p.id)
      const allBookings = await api.getBookings()
      const myBookings = allBookings.filter((b: Booking) => 
        propertyIds.includes(b.property_id)
      )
      
      // Sort by most recent first
      const sorted = myBookings.sort((a: Booking, b: Booking) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
      setBookings(sorted)
    } catch (error) {
      console.error("Failed to load bookings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReviewRenter = (booking: Booking) => {
    router.push(`/write-review?bookingId=${booking.id}`)
  }

  if (!user || user.account_type !== "homeowner") {
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

  const activeBookings = bookings.filter((b) => b.status === "confirmed")
  const completedBookings = bookings.filter((b) => b.status === "completed")
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled")

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Bookings for My Properties</h1>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Bookings Yet</h2>
            <p className="text-muted-foreground mb-6">
              You don't have any bookings for your properties yet.
            </p>
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
                            <User className="w-4 h-4" />
                            <span>
                              {booking.guest_first_name && booking.guest_last_name
                                ? `${booking.guest_first_name} ${booking.guest_last_name}`
                                : booking.renter_id
                                ? "Renter"
                                : "Guest"}
                            </span>
                          </div>
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
                          onClick={() => handleReviewRenter(booking)}
                          className="w-full"
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Review Renter
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {completedBookings.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Completed Bookings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-card rounded-xl border border-border overflow-hidden opacity-75"
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
                            <User className="w-4 h-4" />
                            <span>
                              {booking.guest_first_name && booking.guest_last_name
                                ? `${booking.guest_first_name} ${booking.guest_last_name}`
                                : "Guest"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(booking.start_date).toLocaleDateString("en-GB")} -{" "}
                              {new Date(booking.end_date).toLocaleDateString("en-GB")}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReviewRenter(booking)}
                          className="w-full"
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Review Renter
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

