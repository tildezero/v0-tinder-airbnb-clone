"use client"

import { useState } from "react"
import { PropertyCard } from "@/components/property-card"
import { SwipeActions } from "@/components/swipe-actions"
import { AppHeader } from "@/components/app-header"
import { properties } from "@/lib/properties-data"

export default function SwipePage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [likedProperties, setLikedProperties] = useState<number[]>([])

  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "right") {
      setLikedProperties([...likedProperties, properties[currentIndex].id])
    }

    if (currentIndex < properties.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setCurrentIndex(0)
    }
  }

  const currentProperty = properties[currentIndex]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />

      <main className="flex-1 flex flex-col items-center justify-center p-4 pb-32">
        <div className="w-full max-w-md">
          {currentProperty && <PropertyCard property={currentProperty} onSwipe={handleSwipe} />}
        </div>

        {currentIndex === properties.length - 1 && (
          <p className="text-muted-foreground text-sm mt-4 text-center">
            You've seen all properties! Swipe to start over.
          </p>
        )}
      </main>

      <SwipeActions onSwipe={handleSwipe} />
    </div>
  )
}
