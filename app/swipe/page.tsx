"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PropertyCard } from "@/components/property-card"
import { SwipeActions } from "@/components/swipe-actions"
import { AppHeader } from "@/components/app-header"
import { properties as defaultProperties } from "@/lib/properties-data"
import { storage } from "@/lib/storage"
import { useApp } from "@/lib/context"

export default function SwipePage() {
  const router = useRouter()
  const { user } = useApp()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [likedProperties, setLikedProperties] = useState<number[]>([])
  const [allProperties, setAllProperties] = useState(defaultProperties)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    const liked = storage.getLikedProperties()
    setLikedProperties(liked)
    
    const userProperties = storage.getProperties()
    setAllProperties([...defaultProperties, ...userProperties])
  }, [user, router])

  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "right") {
      const newLiked = [...likedProperties, allProperties[currentIndex].id]
      setLikedProperties(newLiked)
      storage.addLikedProperty(allProperties[currentIndex].id)
    }

    if (currentIndex < allProperties.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setCurrentIndex(0)
    }
  }

  const currentProperty = allProperties[currentIndex]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />

      <main className="flex-1 flex flex-col items-center justify-center p-4 pb-32">
        <div className="w-full max-w-md">
          {currentProperty && <PropertyCard property={currentProperty} onSwipe={handleSwipe} />}
        </div>

        {currentIndex === allProperties.length - 1 && (
          <p className="text-muted-foreground text-sm mt-4 text-center">
            You've seen all properties! Swipe to start over.
          </p>
        )}
      </main>

      <SwipeActions onSwipe={handleSwipe} />
    </div>
  )
}
