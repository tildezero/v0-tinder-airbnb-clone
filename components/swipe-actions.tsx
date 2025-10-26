"use client"

import { X, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SwipeActionsProps {
  onSwipe: (direction: "left" | "right") => void
}

export function SwipeActions({ onSwipe }: SwipeActionsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-sm border-t border-border p-6">
      <div className="container mx-auto max-w-md flex items-center justify-center gap-8">
        <Button
          size="lg"
          variant="outline"
          className="w-16 h-16 rounded-full border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all bg-transparent"
          onClick={() => onSwipe("left")}
        >
          <X className="w-8 h-8" />
        </Button>

        <Button
          size="lg"
          className="w-20 h-20 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/50 transition-all"
          onClick={() => onSwipe("right")}
        >
          <Heart className="w-10 h-10" />
        </Button>
      </div>
    </div>
  )
}
