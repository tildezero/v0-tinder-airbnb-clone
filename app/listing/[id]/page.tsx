"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Bed, Bath, Star, SkipForward } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { properties } from "@/lib/properties-data"

export default function ListingPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const property = properties.find((p) => p.id === Number.parseInt(params.id))
  const [comment, setComment] = useState("")
  const [imageIndex, setImageIndex] = useState(0)

  if (!property) {
    return <div>Property not found</div>
  }

  const handleSubmitRequest = () => {
    alert("Request submitted!")
    setComment("")
  }

  const handleNextListing = () => {
    const currentIndex = properties.findIndex((p) => p.id === property.id)
    const nextProperty = properties[(currentIndex + 1) % properties.length]
    router.push(`/listing/${nextProperty.id}`)
  }

  const comments = [
    "comment comment comment",
    "comment comment comment",
    "comment comment comment",
    "comment comment comment",
  ]

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Room Listing Title</h1>
              <p className="text-2xl font-semibold mb-4">${property.price}/night</p>
              <p className="text-sm text-muted-foreground">Listed by: ...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Neighborhood, City,
                <br />
                State, Country
              </p>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-xl font-bold mb-4">Info</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 px-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Bed className="w-5 h-5" />
                    <span>Bedrooms</span>
                  </div>
                  <span className="font-semibold">{property.guests}</span>
                </div>
                <div className="flex items-center justify-between py-3 px-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Bath className="w-5 h-5" />
                    <span>Bathrooms</span>
                  </div>
                  <span className="font-semibold">6</span>
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
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2"
                onClick={() => setImageIndex((imageIndex - 1 + property.images.length) % property.images.length)}
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
            </div>

            <Textarea
              placeholder="Leave a comment for the host"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[120px] bg-card"
            />

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
              <div className="space-y-4">
                {comments.map((comment, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
                    <p className="text-sm pt-2">{comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
