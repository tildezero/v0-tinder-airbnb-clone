"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useApp } from "@/lib/context"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Home,
  Star,
  ClipboardList,
  Eye,
  LogOut
} from "lucide-react"

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "All Users", icon: Users },
  { href: "/admin/homeowners", label: "Homeowners", icon: UserCheck },
  { href: "/admin/renters", label: "Renters", icon: Users },
  { href: "/admin/listings", label: "Listings", icon: Home },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useApp()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <aside className="w-64 bg-card border-r border-border p-6 flex flex-col">
      <div className="text-2xl font-bold mb-8">Admin Panel</div>

      <nav className="space-y-2 flex-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition",
              pathname === href && "bg-muted font-semibold"
            )}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-border">
        <div className="text-sm text-muted-foreground mb-3">
          Logged in as Admin
        </div>
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
