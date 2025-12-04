"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Home,
  Star,
  ClipboardList,
  Eye
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

  return (
    <aside className="w-64 bg-card border-r border-border p-6">
      <div className="text-2xl font-bold mb-8">Admin Panel</div>

      <nav className="space-y-2">
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

      <div className="mt-10 text-sm text-muted-foreground">
        Logged in as Admin
      </div>
    </aside>
  )
}
