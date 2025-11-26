"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Calendar, Star, MapPin, Bed, Bath, ChevronLeft, ChevronRight } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useApp } from "@/lib/context"
import type { Property } from "@/lib/types"

export default function SearchPage() {
  const { user } = useApp()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [checkInDate, setCheckInDate] = useState("")
  const [checkOutDate, setCheckOutDate] = useState("")
  const [bedroomsFilter, setBedroomsFilter] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | "zip_asc" | "zip_desc" | "rating_desc" | null>(null)
  const [minRating, setMinRating] = useState<number | null>(null)
  const [zipFilter, setZipFilter] = useState<string>("")
  const [allProperties, setAllProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProperties()
  }, [])

  const loadProperties = async () => {
    try {
      setIsLoading(true)
      const properties = await api.getProperties()
      setAllProperties(properties)
    } catch (error) {
      console.error("Failed to load properties:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const itemsPerPage = 9

  const filteredProperties = allProperties
    .filter((property) => {
      // Search by location/destination
      if (searchQuery && !property.location.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      
      // Filter by check-in/check-out dates (check if property is available)
      if (checkInDate && checkOutDate) {
        const hasAvailableDates = property.availability?.some((avail) => {
          const availStart = new Date(avail.start_date)
          const availEnd = new Date(avail.end_date)
          const checkIn = new Date(checkInDate)
          const checkOut = new Date(checkOutDate)
          
          return checkIn >= availStart && checkOut <= availEnd && avail.is_available === 1
        })
        if (!hasAvailableDates) return false
      }
      
      // Filter by number of bedrooms
      if (bedroomsFilter && property.bedrooms < bedroomsFilter) {
        return false
      }
      
      // Filter by rating
      if (minRating && property.rating < minRating) {
        return false
      }
      
      // Filter by zip code
      if (zipFilter && property.zip_code && !property.zip_code.includes(zipFilter)) {
        return false
      }
      
      return true
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price
      if (sortBy === "price_desc") return b.price - a.price
      if (sortBy === "zip_asc") {
        const zipA = a.zip_code || ""
        const zipB = b.zip_code || ""
        return zipA.localeCompare(zipB)
      }
      if (sortBy === "zip_desc") {
        const zipA = a.zip_code || ""
        const zipB = b.zip_code || ""
        return zipB.localeCompare(zipA)
      }
      if (sortBy === "rating_desc") return b.rating - a.rating
      return 0
    })

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const displayedProperties = filteredProperties.slice(startIndex, startIndex + itemsPerPage)

  const handleFilterChange = () => {
    setCurrentPage(1)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container mx-auto px-6 py-8">
          <p className="text-center text-muted-foreground">Loading properties...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-6 py-8">
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Search Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Destination</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Enter destination..."
                  className="pl-10 bg-input"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    handleFilterChange()
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Check-in Date</label>
              <Input
                type="date"
                className="bg-input"
                value={checkInDate}
                onChange={(e) => {
                  setCheckInDate(e.target.value)
                  handleFilterChange()
                }}
                min={(() => {
                  const minDate = new Date()
                  minDate.setDate(minDate.getDate() + 5) // 5 days from today
                  return minDate.toISOString().split("T")[0]
                })()}
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 5 days from today
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Check-out Date</label>
              <Input
                type="date"
                className="bg-input"
                min={checkInDate || undefined}
                value={checkOutDate}
                onChange={(e) => {
                  setCheckOutDate(e.target.value)
                  handleFilterChange()
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bedrooms</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start bg-input">
                    <Bed className="w-4 h-4 mr-2" />
                    {bedroomsFilter ? `${bedroomsFilter}+ bedrooms` : "Any"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => { setBedroomsFilter(null); handleFilterChange() }}>
                    Any
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setBedroomsFilter(1); handleFilterChange() }}>
                    1+ bedrooms
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setBedroomsFilter(2); handleFilterChange() }}>
                    2+ bedrooms
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setBedroomsFilter(3); handleFilterChange() }}>
                    3+ bedrooms
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setBedroomsFilter(4); handleFilterChange() }}>
                    4+ bedrooms
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-8 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Calendar className="w-4 h-4" />
                Sort By
                {sortBy && (
                  <span className="text-xs">
                    ({sortBy === "price_asc" ? "Price: Low-High" : 
                      sortBy === "price_desc" ? "Price: High-Low" :
                      sortBy === "zip_asc" ? "Zip: A-Z" :
                      sortBy === "zip_desc" ? "Zip: Z-A" :
                      sortBy === "rating_desc" ? "Rating: High-Low" : ""})
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => { setSortBy("price_asc"); handleFilterChange() }}>
                Daily Rate: Low to High
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy("price_desc"); handleFilterChange() }}>
                Daily Rate: High to Low
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy("zip_asc"); handleFilterChange() }}>
                Zip Code: A to Z
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy("zip_desc"); handleFilterChange() }}>
                Zip Code: Z to A
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy("rating_desc"); handleFilterChange() }}>
                Rating: High to Low
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy(null); handleFilterChange() }}>
                Clear Sort
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Star className="w-4 h-4" />
                Rating
                {minRating && <span className="text-xs">({minRating}+)</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => { setMinRating(4.5); handleFilterChange() }}>
                4.5+ Stars
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setMinRating(4.0); handleFilterChange() }}>
                4.0+ Stars
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setMinRating(3.5); handleFilterChange() }}>
                3.5+ Stars
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setMinRating(null); handleFilterChange() }}>
                Clear Filter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <MapPin className="w-4 h-4" />
                Zip Code
                {zipFilter && <span className="text-xs">({zipFilter})</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <div className="p-2">
                <Input
                  placeholder="Enter zip code..."
                  value={zipFilter}
                  onChange={(e) => {
                    setZipFilter(e.target.value)
                    handleFilterChange()
                  }}
                  className="mb-2"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setZipFilter("")
                    handleFilterChange()
                  }}
                >
                  Clear Filter
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {displayedProperties.map((property, index) => (
            <Link
              key={property.id}
              href={`/listing/${property.id}${checkInDate ? `?checkIn=${checkInDate}&checkOut=${checkOutDate}` : ""}`}
              className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-4">
                <h3 className="font-semibold mb-1">{property.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{property.location}</p>

                <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                      No Image
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      <span>{property.bedrooms} bed{property.bedrooms !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="w-4 h-4" />
                      <span>{property.bathrooms || 1} bath{property.bathrooms !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{property.rating.toFixed(1)}/5 stars</span>
                    </div>
                  </div>
                  <span className="font-semibold">${property.price}/night</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {displayedProperties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No properties found matching your criteria.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery("")
                setCheckInDate("")
                setCheckOutDate("")
                setBedroomsFilter(null)
                setSortBy(null)
                setMinRating(null)
                setZipFilter("")
                handleFilterChange()
              }}
            >
              Clear All Filters
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredProperties.length)} of{" "}
            {filteredProperties.length} Listings
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            {[1, 2, 3, 4].map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                disabled={page > totalPages}
              >
                {page}
              </Button>
            ))}

            {totalPages > 4 && (
              <>
                <span className="px-2">...</span>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)}>
                  {totalPages}
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
