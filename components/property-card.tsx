"use client"

import { useState, useRef } from "react"
import { MapPin, Users, Bed, Star } from "lucide-react"
import { Card } from "@/components/ui/card"

interface Property {
  id: number
  title: string
  location: string
  price: number
  rating: number
  reviews: number
  guests: number
  bedrooms: number
  image: string
  host: string
}

interface PropertyCardProps {
  property: Property
  onSwipe: (direction: "left" | "right") => void
}

export function PropertyCard({ property, onSwipe }: PropertyCardProps) {
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true)
    setDragStart({ x: clientX, y: clientY })
  }

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return

    const deltaX = clientX - dragStart.x
    const deltaY = clientY - dragStart.y
    setDragOffset({ x: deltaX, y: deltaY })
  }

  const handleDragEnd = () => {
    setIsDragging(false)

    const threshold = 100
    if (Math.abs(dragOffset.x) > threshold) {
      const direction = dragOffset.x > 0 ? "right" : "left"
      onSwipe(direction)
    }

    setDragOffset({ x: 0, y: 0 })
  }

  const rotation = dragOffset.x * 0.1
  const opacity = 1 - Math.abs(dragOffset.x) / 300

  return (
    <div className="relative">
      {/* Swipe indicators */}
      {isDragging && (
        <>
          <div
            className="absolute top-8 right-8 z-10 text-6xl font-bold text-destructive opacity-0 transition-opacity"
            style={{ opacity: dragOffset.x < -50 ? Math.abs(dragOffset.x) / 150 : 0 }}
          >
            NOPE
          </div>
          <div
            className="absolute top-8 left-8 z-10 text-6xl font-bold text-primary opacity-0 transition-opacity"
            style={{ opacity: dragOffset.x > 50 ? dragOffset.x / 150 : 0 }}
          >
            LIKE
          </div>
        </>
      )}

      <Card
        ref={cardRef}
        className="overflow-hidden cursor-grab active:cursor-grabbing select-none touch-none transition-transform"
        style={{
          transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
          opacity: opacity,
          transition: isDragging ? "none" : "transform 0.3s ease, opacity 0.3s ease",
        }}
        onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={handleDragEnd}
      >
        {/* Property Image */}
        <div className="relative h-96 bg-secondary">
          <img
            src={property.image || "/placeholder.svg"}
            alt={property.title}
            className="w-full h-full object-cover"
            draggable={false}
          />
          <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1">
            <Star className="w-4 h-4 fill-primary text-primary" />
            <span className="text-sm font-semibold">{property.rating}</span>
            <span className="text-xs text-muted-foreground">({property.reviews})</span>
          </div>
        </div>

        {/* Property Details */}
        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-balance mb-2">{property.title}</h2>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{property.location}</span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>{property.guests} guests</span>
            </div>
            <div className="flex items-center gap-2">
              <Bed className="w-4 h-4 text-muted-foreground" />
              <span>{property.bedrooms} bedrooms</span>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Hosted by {property.host}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">${property.price}</p>
              <p className="text-sm text-muted-foreground">per night</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
