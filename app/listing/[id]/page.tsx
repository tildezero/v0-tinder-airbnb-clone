"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Bed, Bath, Star, SkipForward, Send } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { properties as defaultProperties } from "@/lib/properties-data"
import { storage } from "@/lib/storage"
import { useApp } from "@/lib/context"
import type { Review, Request } from "@/lib/types"

export default function ListingPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useApp()
  const [allProperties, setAllProperties] = useState(defaultProperties)
  const [property, setProperty] = useState(
    defaultProperties.find((p) => p.id === Number.parseInt(params.id))
  )

  useEffect(() => {
    const userProperties = storage.getProperties()
    const combined = [...defaultProperties, ...userProperties]
    setAllProperties(combined)
    const found = combined.find((p) => p.id === Number.parseInt(params.id))
    setProperty(found)
  }, [params.id])
  const [comment, setComment] = useState("")
  const [imageIndex, setImageIndex] = useState(0)
  const [reviews, setReviews] = useState<Review[]>([])
  const [requestSubmitted, setRequestSubmitted] = useState(false)

  useEffect(() => {
    if (property) {
      const propertyReviews = storage.getReviewsByPropertyId(property.id)
      setReviews(propertyReviews)
    }
  }, [property])

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

  const handleSubmitRequest = () => {
    if (!user || !comment.trim()) {
      alert("Please log in and add a comment")
      return
    }

    const newRequest: Request = {
      id: Date.now().toString(),
      propertyId: property.id,
      propertyTitle: property.title,
      requesterId: user.id,
      requesterName: user.name,
      requesterRating: user.rating,
      requesterAge: user.age,
      message: comment,
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    storage.addRequest(newRequest)
    setComment("")
    setRequestSubmitted(true)
    setTimeout(() => setRequestSubmitted(false), 3000)
  }

  const handleAddReview = () => {
    if (!user || !comment.trim()) {
      return
    }

    const newReview: Review = {
      id: Date.now().toString(),
      propertyId: property.id,
      userId: user.id,
      userName: user.name,
      rating: 5, // Default rating, could be made configurable
      comment: comment,
      createdAt: new Date().toISOString(),
    }

    storage.addReview(newReview)
    setReviews([...reviews, newReview])
    setComment("")
  }

  const handleNextListing = () => {
    const currentIndex = allProperties.findIndex((p) => p.id === property.id)
    const nextProperty = allProperties[(currentIndex + 1) % allProperties.length]
    router.push(`/listing/${nextProperty.id}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
              <p className="text-2xl font-semibold mb-4">${property.price}/night</p>
              <p className="text-sm text-muted-foreground">Listed by: {property.host}</p>
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
                  <span className="font-semibold">{property.rating}/5</span>
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

            <Textarea
              placeholder="Leave a comment for the host"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[120px] bg-card"
            />

            {requestSubmitted && (
              <div className="p-3 bg-success/10 text-success rounded-md text-sm">
                Request submitted successfully!
              </div>
            )}

            <Button className="w-full" size="lg" onClick={handleSubmitRequest}>
              Submit Request
            </Button>

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
                          <span className="font-semibold text-sm">{review.userName}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current text-primary" />
                            <span className="text-xs text-muted-foreground">{review.rating}/5</span>
                          </div>
                        </div>
                        <p className="text-sm">{review.comment}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
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
