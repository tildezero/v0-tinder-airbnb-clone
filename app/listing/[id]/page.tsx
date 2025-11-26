"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Bed, Bath, Star, SkipForward, Calendar } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { useApp } from "@/lib/context"
import type { Review, Property, Availability } from "@/lib/types"

export default function ListingPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useApp()
  const [property, setProperty] = useState<Property | null>(null)
  const [imageIndex, setImageIndex] = useState(0)
  const [reviews, setReviews] = useState<Review[]>([])
  const [selectedDates, setSelectedDates] = useState({ start_date: "", end_date: "" })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProperty()
  }, [params.id])

  const loadProperty = async () => {
    try {
      setIsLoading(true)
      const properties = await api.getProperties()
      const found = properties.find((p: Property) => p.id === Number.parseInt(params.id))
      if (found) {
        setProperty(found)
        loadReviews(found.id)
      }
    } catch (error) {
      console.error("Failed to load property:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadReviews = async (propertyId: number) => {
    try {
      const propertyReviews = await api.getReviews(propertyId.toString())
      setReviews(propertyReviews)
    } catch (error) {
      console.error("Failed to load reviews:", error)
    }
  }

  const handleBook = () => {
    if (!selectedDates.start_date || !selectedDates.end_date) {
      alert("Please select check-in and check-out dates")
      return
    }

    // Check if booking is at least 5 days in advance
    const checkInDate = new Date(selectedDates.start_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day
    const daysUntilCheckIn = Math.ceil((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilCheckIn < 5) {
      alert("Bookings must be made at least 5 days in advance. Please select a check-in date that is at least 5 days from today.")
      return
    }

    if (new Date(selectedDates.start_date) >= new Date(selectedDates.end_date)) {
      alert("Check-out date must be after check-in date")
      return
    }

    router.push(
      `/payment?propertyId=${property?.id}&startDate=${selectedDates.start_date}&endDate=${selectedDates.end_date}`
    )
  }

  const handleNextListing = async () => {
    try {
      const properties = await api.getProperties()
      const currentIndex = properties.findIndex((p: Property) => p.id === property?.id)
      const nextProperty = properties[(currentIndex + 1) % properties.length]
      router.push(`/listing/${nextProperty.id}`)
    } catch (error) {
      console.error("Failed to load next property:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container mx-auto px-6 py-8">
          <p className="text-center text-muted-foreground">Loading...</p>
        </main>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Property not found</h1>
            <Button onClick={() => router.push("/search")}>Back to Search</Button>
          </div>
        </main>
      </div>
    )
  }

  const availableDates = property.availability?.filter((a) => a.is_available === 1) || []

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
              <p className="text-2xl font-semibold mb-4">${property.price}/night</p>
              <p className="text-sm text-muted-foreground">
                Listed by: {property.host || property.host_name || "Unknown"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{property.location}</p>
              {property.description && (
                <p className="text-sm text-muted-foreground mt-2">{property.description}</p>
              )}
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-xl font-bold mb-4">Info</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 px-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Bed className="w-5 h-5" />
                    <span>Bedrooms</span>
                  </div>
                  <span className="font-semibold">{property.bedrooms}</span>
                </div>
                <div className="flex items-center justify-between py-3 px-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Bath className="w-5 h-5" />
                    <span>Bathrooms</span>
                  </div>
                  <span className="font-semibold">{property.bathrooms}</span>
                </div>
                <div className="flex items-center justify-between py-3 px-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    <span>Rating</span>
                  </div>
                  <span className="font-semibold">{property.rating.toFixed(1)}/5</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="relative aspect-video bg-muted rounded-xl overflow-hidden">
              <img
                src={property.images[imageIndex] || "/placeholder.svg"}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              {property.images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    onClick={() =>
                      setImageIndex((imageIndex - 1 + property.images.length) % property.images.length)
                    }
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    onClick={() => setImageIndex((imageIndex + 1) % property.images.length)}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </>
              )}
            </div>

            {(user?.account_type === "renter" || !user) && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-xl font-bold mb-4">Book Your Stay</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkin">Check-in Date *</Label>
                    <Input
                      id="checkin"
                      type="date"
                      value={selectedDates.start_date}
                      onChange={(e) => setSelectedDates({ ...selectedDates, start_date: e.target.value })}
                      min={(() => {
                        const minDate = new Date()
                        minDate.setDate(minDate.getDate() + 5) // 5 days from today
                        return minDate.toISOString().split("T")[0]
                      })()}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Bookings must be made at least 5 days in advance
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkout">Check-out Date *</Label>
                    <Input
                      id="checkout"
                      type="date"
                      value={selectedDates.end_date}
                      onChange={(e) => setSelectedDates({ ...selectedDates, end_date: e.target.value })}
                      min={selectedDates.start_date || (() => {
                        const minDate = new Date()
                        minDate.setDate(minDate.getDate() + 5)
                        return minDate.toISOString().split("T")[0]
                      })()}
                      required
                    />
                  </div>
                  {selectedDates.start_date && selectedDates.end_date && (
                    <div className="bg-muted p-3 rounded-lg space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>
                          $
                          {(
                            Math.ceil(
                              (new Date(selectedDates.end_date).getTime() -
                                new Date(selectedDates.start_date).getTime()) /
                                (1000 * 60 * 60 * 24)
                            ) * property.price
                          ).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax (12%):</span>
                        <span>
                          $
                          {(
                            Math.ceil(
                              (new Date(selectedDates.end_date).getTime() -
                                new Date(selectedDates.start_date).getTime()) /
                                (1000 * 60 * 60 * 24)
                            ) *
                              property.price *
                              0.12
                          ).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between font-semibold border-t border-border pt-1 mt-1">
                        <span>Total:</span>
                        <span>
                          $
                          {(
                            Math.ceil(
                              (new Date(selectedDates.end_date).getTime() -
                                new Date(selectedDates.start_date).getTime()) /
                                (1000 * 60 * 60 * 24)
                            ) *
                              property.price *
                              1.12
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                  <Button 
                    className="w-full" 
                    onClick={handleBook}
                    disabled={!selectedDates.start_date || !selectedDates.end_date}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {user ? "Book Now" : "Continue to Payment"}
                  </Button>
                  {(!selectedDates.start_date || !selectedDates.end_date) && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Please select both check-in and check-out dates to continue
                    </p>
                  )}
                  {!user && selectedDates.start_date && selectedDates.end_date && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      You can book as a guest or{" "}
                      <a href="/login" className="text-primary hover:underline">
                        login
                      </a>{" "}
                      to use your saved information
                    </p>
                  )}
                </div>
              </div>
            )}

            <Button variant="outline" className="w-full bg-transparent" size="lg" onClick={handleNextListing}>
              <SkipForward className="w-4 h-4 mr-2" />
              Next Listing
            </Button>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-xl font-bold mb-6">Comments</h2>
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {reviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No comments yet. Be the first to review!</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">👤</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{review.user_name}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current text-primary" />
                            <span className="text-xs text-muted-foreground">{review.rating}/5</span>
                          </div>
                        </div>
                        <p className="text-sm">{review.comment}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">
                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "Invalid date"}
                          </p>
                          {review.stay_start_date && review.stay_end_date && (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <p className="text-xs text-muted-foreground">
                                Stay: {new Date(review.stay_start_date).toLocaleDateString("en-GB")} -{" "}
                                {new Date(review.stay_end_date).toLocaleDateString("en-GB")}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
