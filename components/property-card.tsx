"use client"

import { useState, useRef, useEffect } from "react"
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
  images: string[]
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y
      setDragOffset({ x: deltaX, y: deltaY })
    }

    const handleMouseUp = () => {
      if (!isDragging) return
      setIsDragging(false)

      const threshold = 100
      if (Math.abs(dragOffset.x) > threshold) {
        const direction = dragOffset.x > 0 ? "right" : "left"
        onSwipe(direction)
      }

      setDragOffset({ x: 0, y: 0 })
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false })
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("touchmove", (e) => e.preventDefault())
    }
  }, [isDragging, dragStart, dragOffset, onSwipe])

  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true)
    setDragStart({ x: clientX, y: clientY })
    setDragOffset({ x: 0, y: 0 })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const deltaX = e.touches[0].clientX - dragStart.x
    const deltaY = e.touches[0].clientY - dragStart.y
    setDragOffset({ x: deltaX, y: deltaY })
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
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
            className="absolute top-8 right-8 z-10 text-6xl font-bold text-destructive opacity-0 transition-opacity pointer-events-none"
            style={{ opacity: dragOffset.x < -50 ? Math.abs(dragOffset.x) / 150 : 0 }}
          >
            NOPE
          </div>
          <div
            className="absolute top-8 left-8 z-10 text-6xl font-bold text-primary opacity-0 transition-opacity pointer-events-none"
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
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleDragStart(e.clientX, e.clientY)
        }}
        onTouchStart={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleDragStart(e.touches[0].clientX, e.touches[0].clientY)
        }}
        onTouchMove={handleTouchMove}
        onTouchEnd={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleTouchEnd()
        }}
        onClick={(e) => {
          // Prevent clicks during/after drag
          if (isDragging || Math.abs(dragOffset.x) > 10) {
            e.preventDefault()
            e.stopPropagation()
          }
        }}
      >
        {/* Property Image */}
        <div className="relative h-96 bg-secondary">
          {property.images && property.images.length > 0 && property.images[0] ? (
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-full h-full object-cover"
              draggable={false}
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                e.currentTarget.src = "/placeholder.svg"
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
          <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1">
            <Star className="w-4 h-4 fill-primary text-primary" />
            <span className="text-sm font-semibold">{property.rating || 0}</span>
            <span className="text-xs text-muted-foreground">({property.reviews || 0})</span>
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
              <p className="text-sm text-muted-foreground">
                Hosted by {property.host || "Unknown"}
              </p>
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
