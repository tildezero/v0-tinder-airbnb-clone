"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Bed, Bath, Star, MapPin, Plus, Trash2 } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useApp } from "@/lib/context"
import { api } from "@/lib/api"
import type { Property } from "@/lib/types"

export default function MyListingsPage() {
  const router = useRouter()
  const { user } = useApp()
  const [myListings, setMyListings] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (user.account_type !== "homeowner") {
      router.push("/search")
      return
    }

    loadListings()
  }, [user, router])

  const loadListings = async () => {
    try {
      setIsLoading(true)
      const properties = await api.getProperties(user?.id)
      setMyListings(properties)
    } catch (error) {
      console.error("Failed to load listings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (property: Property) => {
    setPropertyToDelete(property)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!propertyToDelete || !user) return

    try {
      setIsDeleting(true)
      await api.deleteProperty(propertyToDelete.id.toString(), user.id.toString())
      setDeleteDialogOpen(false)
      setPropertyToDelete(null)
      // Reload listings after deletion
      await loadListings()
    } catch (error: any) {
      console.error("Failed to delete listing:", error)
      alert(error.message || "Failed to delete listing. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  if (!user || user.account_type !== "homeowner") {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container mx-auto px-6 py-8 max-w-4xl">
          <p className="text-center text-muted-foreground">Loading listings...</p>
        </main>
      </div>
    )
  }

  if (myListings.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container mx-auto px-6 py-8 max-w-4xl">
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">No Listings Posted</h1>
            <p className="text-muted-foreground mb-6">
              You haven't posted any listings yet. Create your first listing to get started!
            </p>
            <Button asChild size="lg" className="gap-2">
              <Link href="/post-listing">
                <Plus className="w-4 h-4" />
                Post Your First Listing
              </Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Listings</h1>
          <Button asChild size="lg" className="gap-2">
            <Link href="/post-listing">
              <Plus className="w-4 h-4" />
              Post New Listing
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myListings.map((property) => (
            <div
              key={property.id}
              className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow relative group"
            >
              <Link href={`/listing/${property.id}`} className="block">
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{property.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {property.location}
                  </p>

                  <div className="aspect-video bg-muted rounded-lg mb-4">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        <span>{property.bedrooms} beds</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="w-4 h-4" />
                        <span>{property.bathrooms || 1} baths</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-current" />
                        <span>{property.rating || 0}/5</span>
                      </div>
                    </div>
                    <span className="font-semibold">${property.price}/night</span>
                  </div>
                </div>
              </Link>
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleDeleteClick(property)
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Listing</DialogTitle>
            </DialogHeader>
            <p className="mb-4">
              Are you sure you want to delete listing <strong>{propertyToDelete?.title}</strong>?
              This action is permanent and cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false)
                  setPropertyToDelete(null)
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
