"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Send, Upload, X, Plus, Calendar } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useApp } from "@/lib/context"
import { api } from "@/lib/api"
import type { Availability } from "@/lib/types"

export default function PostListingPage() {
  const router = useRouter()
  const { user } = useApp()
  const [formData, setFormData] = useState({
    title: "",
    bedrooms: "",
    bathrooms: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    description: "",
    price: "",
    location: "",
    guests: "",
  })
  const [images, setImages] = useState<string[]>([])
  const [imageIndex, setImageIndex] = useState(0)
  const [availability, setAvailability] = useState<Availability[]>([])
  const [newAvailability, setNewAvailability] = useState({ start_date: "", end_date: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (user.account_type !== "homeowner") {
      router.push("/search")
      return
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

  const addAvailability = () => {
    if (newAvailability.start_date && newAvailability.end_date) {
      if (new Date(newAvailability.start_date) >= new Date(newAvailability.end_date)) {
        alert("End date must be after start date")
        return
      }
      setAvailability([
        ...availability,
        {
          property_id: 0,
          start_date: newAvailability.start_date,
          end_date: newAvailability.end_date,
          is_available: 1,
        },
      ])
      setNewAvailability({ start_date: "", end_date: "" })
    }
  }

  const removeAvailability = (index: number) => {
    setAvailability(availability.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      alert("Please log in to post a listing")
      return
    }

    if (!formData.title || !formData.bedrooms || !formData.bathrooms || !formData.price || !formData.location || 
        !formData.streetAddress || !formData.city || !formData.state || !formData.zipCode) {
      alert("Please fill in all required fields including the full address")
      return
    }

    if (images.length === 0) {
      alert("Please upload at least one image")
      return
    }

    setIsSubmitting(true)

    try {
      // Combine address fields into full address string
      const fullAddress = `${formData.streetAddress}, ${formData.city}, ${formData.state} ${formData.zipCode}`.trim()
      
      await api.createProperty({
        title: formData.title,
        location: formData.location,
        price: Number.parseFloat(formData.price),
        guests: Number.parseInt(formData.guests) || 1,
        bedrooms: Number.parseInt(formData.bedrooms),
        bathrooms: Number.parseInt(formData.bathrooms),
        images: images,
        host_id: user.id,
        host_name: user.name,
        description: formData.description || null,
        address: fullAddress,
        zip_code: formData.zipCode,
        availability: availability,
      })

      // Reset form
      setFormData({
        title: "",
        bedrooms: "",
        bathrooms: "",
        streetAddress: "",
        city: "",
        state: "",
        zipCode: "",
        description: "",
        price: "",
        location: "",
        guests: "",
      })
      setImages([])
      setImageIndex(0)
      setAvailability([])

      alert("Listing published successfully!")
      router.push("/my-listings")
    } catch (error: any) {
      alert(error.message || "Failed to create listing. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user || user.account_type !== "homeowner") {
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
                  <Label htmlFor="streetAddress">Street Address *</Label>
                  <Input
                    id="streetAddress"
                    placeholder="123 Main Street"
                    value={formData.streetAddress}
                    onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                    className="bg-input"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="bg-input"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      placeholder="State"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="bg-input"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code *</Label>
                  <Input
                    id="zipCode"
                    placeholder="12345"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    className="bg-input"
                    required
                    pattern="[0-9]{5}(-[0-9]{4})?"
                    title="Please enter a valid 5-digit zip code (or 9-digit with hyphen)"
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

                <div className="space-y-2">
                  <Label>Availability Dates</Label>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        placeholder="Start date"
                        value={newAvailability.start_date}
                        onChange={(e) => setNewAvailability({ ...newAvailability, start_date: e.target.value })}
                        className="bg-input"
                      />
                      <Input
                        type="date"
                        placeholder="End date"
                        value={newAvailability.end_date}
                        onChange={(e) => setNewAvailability({ ...newAvailability, end_date: e.target.value })}
                        className="bg-input"
                      />
                    </div>
                    <Button type="button" onClick={addAvailability} variant="outline" size="sm" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Availability Period
                    </Button>
                  </div>

                  {availability.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {availability.map((avail, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted rounded-lg text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(avail.start_date).toLocaleDateString()} -{" "}
                              {new Date(avail.end_date).toLocaleDateString()}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAvailability(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
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

                <Button type="submit" className="w-full gap-2" size="lg" disabled={isSubmitting}>
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
