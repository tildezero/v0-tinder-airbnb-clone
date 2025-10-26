"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Calendar, Star, MapPin, Bed, Bath, ChevronLeft, ChevronRight } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { properties } from "@/lib/properties-data"

export default function SearchPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9
  const totalPages = Math.ceil(properties.length / itemsPerPage)

  const startIndex = (currentPage - 1) * itemsPerPage
  const displayedProperties = properties.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-6 py-8">
        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder="Search Listings by Location" className="pl-10 bg-card" />
          </div>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Calendar className="w-4 h-4" />
            Daily Rate
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Star className="w-4 h-4" />
            Rating
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <MapPin className="w-4 h-4" />
            Zip Code
          </Button>
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
                      <span>7 baths</span>
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
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, properties.length)} of {properties.length}{" "}
            Listings
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
              >
                {page}
              </Button>
            ))}

            <span className="px-2">...</span>

            <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)}>
              {totalPages}
            </Button>

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
