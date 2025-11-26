"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Send, Upload, X } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useApp } from "@/lib/context"
import { storage } from "@/lib/storage"
import { properties } from "@/lib/properties-data"
import type { Property } from "@/lib/types"

export default function PostListingPage() {
  const router = useRouter()
  const { user } = useApp()
  const [formData, setFormData] = useState({
    title: "",
    bedrooms: "",
    bathrooms: "",
    address: "",
    description: "",
    price: "",
    location: "",
    guests: "",
  })
  const [images, setImages] = useState<string[]>([])
  const [imageIndex, setImageIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (reader.result) {
          setImages([...images, reader.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
    if (imageIndex >= images.length - 1) {
      setImageIndex(Math.max(0, imageIndex - 1))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      alert("Please log in to post a listing")
      return
    }

    if (!formData.title || !formData.bedrooms || !formData.bathrooms || !formData.price || !formData.location) {
      alert("Please fill in all required fields")
      return
    }

    if (images.length === 0) {
      alert("Please upload at least one image")
      return
    }

    setIsSubmitting(true)

    // Create new property
    const existingProperties = storage.getProperties()
    const maxId = existingProperties.length > 0 
      ? Math.max(...existingProperties.map(p => p.id))
      : Math.max(...properties.map(p => p.id))

    const newProperty: Property = {
      id: maxId + 1,
      title: formData.title,
      location: formData.location,
      price: Number.parseFloat(formData.price),
      rating: 0,
      reviews: 0,
      guests: Number.parseInt(formData.guests) || 1,
      bedrooms: Number.parseInt(formData.bedrooms),
      bathrooms: Number.parseInt(formData.bathrooms),
      images: images,
      host: user.name,
      hostId: user.id,
      description: formData.description,
      address: formData.address,
    }

    storage.addProperty(newProperty)

    // Reset form
    setFormData({
      title: "",
      bedrooms: "",
      bathrooms: "",
      address: "",
      description: "",
      price: "",
      location: "",
      guests: "",
    })
    setImages([])
    setImageIndex(0)

    setIsSubmitting(false)
    alert("Listing published successfully!")
    router.push("/search")
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-6 py-8">
        <div className="bg-card rounded-xl border border-border p-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Property Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter a good title..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-input"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms *</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      min="1"
                      placeholder="Number of bedrooms..."
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                      className="bg-input"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms *</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      min="1"
                      placeholder="Number of bathrooms"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                      className="bg-input"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guests">Guests</Label>
                    <Input
                      id="guests"
                      type="number"
                      min="1"
                      placeholder="Max guests"
                      value={formData.guests}
                      onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                      className="bg-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price per Night *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="Price"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="bg-input"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="City, State"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="bg-input"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Full Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Full address (optional)"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="bg-input min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Add a description here"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-input min-h-[120px]"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="relative aspect-video bg-muted rounded-xl overflow-hidden">
                  {images.length > 0 ? (
                    <>
                      <img
                        src={images[imageIndex]}
                        alt={`Upload ${imageIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {images.length > 1 && (
                        <>
                          <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="absolute left-4 top-1/2 -translate-y-1/2"
                            onClick={() => setImageIndex((imageIndex - 1 + images.length) % images.length)}
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="absolute right-4 top-1/2 -translate-y-1/2"
                            onClick={() => setImageIndex((imageIndex + 1) % images.length)}
                          >
                            <ChevronRight className="w-5 h-5" />
                          </Button>
                        </>
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-4 right-4"
                        onClick={() => removeImage(imageIndex)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Upload className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No images uploaded</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">Upload Images *</Label>
                  <Input
                    id="file"
                    type="file"
                    multiple
                    accept="image/*"
                    className="bg-input"
                    onChange={handleImageUpload}
                  />
                  <p className="text-xs text-muted-foreground">
                    {images.length} image{images.length !== 1 ? "s" : ""} uploaded
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full gap-2"
                  size="lg"
                  disabled={isSubmitting}
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Publishing..." : "Publish!"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
