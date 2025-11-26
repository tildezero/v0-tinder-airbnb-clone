"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin } from "lucide-react"
import { PropertyCard } from "@/components/property-card"
import { SwipeActions } from "@/components/swipe-actions"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { useApp } from "@/lib/context"
import type { Property } from "@/lib/types"

export default function SwipePage() {
  const router = useRouter()
  const { user } = useApp()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [locationQuery, setLocationQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [availableLocations, setAvailableLocations] = useState<string[]>([])

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    loadProperties()
  }, [user, router])

  const loadProperties = async () => {
    try {
      setIsLoading(true)
      const allProperties = await api.getProperties()
      setProperties(allProperties)
      
      // Extract unique locations
      const locations = [...new Set(allProperties.map((p: Property) => p.location))].sort()
      setAvailableLocations(locations)
    } catch (error) {
      console.error("Failed to load properties:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLocationSelect = () => {
    if (!locationQuery.trim()) {
      alert("Please enter a location")
      return
    }

    // Filter properties by location (case-insensitive partial match)
    const filtered = properties.filter((p) =>
      p.location.toLowerCase().includes(locationQuery.toLowerCase())
    )

    if (filtered.length === 0) {
      alert(`No properties found in "${locationQuery}". Try a different location.`)
      return
    }

    setSelectedLocation(locationQuery)
    setFilteredProperties(filtered)
    setCurrentIndex(0)
  }

  const handleChangeLocation = () => {
    setSelectedLocation(null)
    setLocationQuery("")
    setFilteredProperties([])
    setCurrentIndex(0)
  }

  const handleSwipe = async (direction: "left" | "right") => {
    if (direction === "right" && user && filteredProperties[currentIndex]) {
      // Only renters can create requests when swiping right
      if (user.account_type === "renter") {
        const property = filteredProperties[currentIndex]
        try {
          await api.createRequest({
            id: Date.now().toString(),
            property_id: property.id,
            property_title: property.title,
            requester_id: user.id,
            requester_name: user.name,
            requester_rating: user.rating,
            requester_age: user.age,
            message: `I'm interested in booking ${property.title}!`,
          })
        } catch (error) {
          console.error("Failed to create request:", error)
        }
      }
    }

    if (currentIndex < filteredProperties.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      // Reset to beginning or show message
      setCurrentIndex(0)
    }
  }

  if (!user) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading properties...</p>
      </div>
    )
  }

  // Show location selector if no location is selected
  if (!selectedLocation) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader />

        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md bg-card rounded-xl border border-border p-8">
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="w-6 h-6" />
              <h1 className="text-2xl font-bold">Choose a Location</h1>
            </div>

            <p className="text-muted-foreground mb-6">
              Select a location to start swiping through available properties.
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">Search Location</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="Enter city, state, or location..."
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleLocationSelect()
                      }
                    }}
                    className="pl-10"
                    list="locations"
                  />
                  <datalist id="locations">
                    {availableLocations.map((location) => (
                      <option key={location} value={location} />
                    ))}
                  </datalist>
                </div>
              </div>

              {availableLocations.length > 0 && (
                <div className="space-y-2">
                  <Label>Or select from available locations:</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {availableLocations.map((location) => (
                      <Button
                        key={location}
                        type="button"
                        variant="outline"
                        className="justify-start text-left"
                        onClick={() => {
                          setLocationQuery(location)
                          handleLocationSelect()
                        }}
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        {location}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={handleLocationSelect} className="w-full" size="lg">
                Start Swiping
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (filteredProperties.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="bg-card rounded-xl border border-border p-8 text-center max-w-md">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No Properties Found</h2>
            <p className="text-muted-foreground mb-6">
              No properties available in "{selectedLocation}". Try a different location.
            </p>
            <Button onClick={handleChangeLocation} variant="outline">
              Change Location
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const currentProperty = filteredProperties[currentIndex]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />

      <main className="flex-1 flex flex-col items-center justify-center p-4 pb-32">
        <div className="w-full max-w-md mb-4">
          <div className="flex items-center justify-between bg-card rounded-lg border border-border p-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{selectedLocation}</span>
              <span className="text-xs text-muted-foreground">
                ({currentIndex + 1} of {filteredProperties.length})
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleChangeLocation}>
              Change
            </Button>
          </div>
        </div>

        <div className="w-full max-w-md">
          {currentProperty && <PropertyCard property={currentProperty} onSwipe={handleSwipe} />}
        </div>

        {currentIndex === filteredProperties.length - 1 && (
          <p className="text-muted-foreground text-sm mt-4 text-center">
            You've seen all properties in {selectedLocation}! Swipe to start over or change location.
          </p>
        )}
      </main>

      <SwipeActions onSwipe={handleSwipe} />
    </div>
  )
}
