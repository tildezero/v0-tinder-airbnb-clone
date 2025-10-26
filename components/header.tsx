import { Heart } from "lucide-react"

interface HeaderProps {
  likedCount: number
}

export function Header({ likedCount }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-foreground">S</span>
          </div>
          <h1 className="text-xl font-bold text-balance">SwipeStay</h1>
        </div>

        <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-full">
          <Heart className="w-5 h-5 text-primary fill-primary" />
          <span className="text-sm font-semibold">{likedCount}</span>
        </div>
      </div>
    </header>
  )
}
