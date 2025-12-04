"use client"

import { useApp } from "@/lib/context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import AdminSidebar from "./_components/sidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useApp()
  const router = useRouter()

  // Redirect anyone who is not an admin
  useEffect(() => {
    if (!user) return
    if (user.account_type !== "admin") {
      router.push("/") // send them to homepage if not admin
    }
  }, [user])

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
