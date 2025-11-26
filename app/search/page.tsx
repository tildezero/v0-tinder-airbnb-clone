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
  const [priceSort, setPriceSort] = useState<"asc" | "desc" | null>(null)
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
      // Search by location
      if (searchQuery && !property.location.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      // Filter by rating
      if (minRating && property.rating < minRating) {
        return false
      }
      // Filter by zip code (simple contains check)
      if (zipFilter && !property.location.toLowerCase().includes(zipFilter.toLowerCase())) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      // Sort by price
      if (priceSort === "asc") return a.price - b.price
      if (priceSort === "desc") return b.price - a.price
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
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search Listings by Location"
              className="pl-10 bg-card"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                handleFilterChange()
              }}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Calendar className="w-4 h-4" />
                Daily Rate
                {priceSort && <span className="text-xs">({priceSort === "asc" ? "Low-High" : "High-Low"})</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => {
                  setPriceSort("asc")
                  handleFilterChange()
                }}
              >
                Price: Low to High
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setPriceSort("desc")
                  handleFilterChange()
                }}
              >
                Price: High to Low
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setPriceSort(null)
                  handleFilterChange()
                }}
              >
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
              <DropdownMenuItem
                onClick={() => {
                  setMinRating(4.5)
                  handleFilterChange()
                }}
              >
                4.5+ Stars
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setMinRating(4.0)
                  handleFilterChange()
                }}
              >
                4.0+ Stars
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setMinRating(3.5)
                  handleFilterChange()
                }}
              >
                3.5+ Stars
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setMinRating(null)
                  handleFilterChange()
                }}
              >
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
              href={`/listing/${property.id}`}
              className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-4">
                <h3 className="font-semibold mb-1">Listing {startIndex + index + 1}</h3>
                <p className="text-sm text-muted-foreground mb-4">{property.location}</p>

                <div className="aspect-video bg-muted rounded-lg mb-4" />

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      <span>{property.guests} beds</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="w-4 h-4" />
                      <span>{property.bathrooms || 1} bath{property.bathrooms !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{property.rating}/5 stars</span>
                    </div>
                  </div>
                  <span className="font-semibold">${property.price}/night</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

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
