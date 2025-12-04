"use client"

import { useApp } from "@/lib/context"
import { Card } from "@/components/ui/card"
import { Users, Home, Star } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"

export default function AdminHomePage() {
  const { user } = useApp()
  const [stats, setStats] = useState({
    users: 0,
    homeowners: 0,
    renters: 0,
    listings: 0,
    reviews: 0,
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    // Admin-level users
    const users = await api.adminGetUsers()

    // All listings (no approval filtering)
    const properties = await api.adminGetListings()

    // All reviews
    const reviews = await api.adminGetReviews()

    setStats({
      users: users.length,
      homeowners: users.filter((u: any) => u.account_type === "homeowner").length,
      renters: users.filter((u: any) => u.account_type === "renter").length,
      listings: properties.length,
      reviews: reviews.length,
    })
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<Users className="text-blue-500" />} title="Users" value={stats.users} />
        <StatCard icon={<Home className="text-green-500" />} title="Listings" value={stats.listings} />
        <StatCard icon={<Star className="text-yellow-500" />} title="Reviews" value={stats.reviews} />
      </div>
    </div>
  )
}

function StatCard({ icon, title, value }: any) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <div className="text-3xl">{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  )
}
