"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Pencil, Trash2 } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useApp } from "@/lib/context"
import { api } from "@/lib/api"

export default function ProfilePage() {
  const router = useRouter()
  const { user, updateUser, logout, refreshUser } = useApp()
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    dob: "",
    payment: "",
    bio: "",
    address: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    setFormData({
      name: user.name || "",
      username: user.username || "",
      email: user.email || "",
      password: user.password || "",
      dob: user.dob || "",
      payment: user.payment || "",
      bio: user.bio || "",
      address: user.address || "",
    })
  }, [user, router])

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      await updateUser(formData)
      await refreshUser()
      alert("Profile updated successfully!")
    } catch (error) {
      alert("Failed to update profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = () => {
    if (!user) return
    
    logout()
    alert("Profile deleted successfully!")
    router.push("/login")
  }

  const calculateAge = (dob: string): number | undefined => {
    if (!dob) return undefined
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  if (!user) {
    return null
  }

  const userAge = calculateAge(formData.dob)

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="bg-card rounded-xl border border-border p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-4xl">👤</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{formData.name || "User"}</h1>
              {userAge && <p className="text-sm text-muted-foreground">{userAge} years old</p>}
            </div>
          </div>

          <h2 className="text-xl font-bold mb-6">Profile Info</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter your name..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username..."
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="bg-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your e-mail address..."
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter a new password..."
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <div className="relative">
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="bg-input"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment">Payment Details</Label>
              <Input
                id="payment"
                placeholder="Enter your credit card information..."
                value={formData.payment}
                onChange={(e) => setFormData({ ...formData, payment: e.target.value })}
                className="bg-input"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="This will be shown to hosts!"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="bg-input min-h-[100px]"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Type in your full mailing address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="bg-input min-h-[100px]"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button className="gap-2" onClick={handleSave} disabled={isSaving}>
              <Pencil className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="destructive"
              className="gap-2"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-4 h-4" />
              Delete Profile
            </Button>
          </div>

          {showDeleteConfirm && (
            <div className="mt-6 p-4 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-sm mb-4">Are you sure you want to delete your profile? This action cannot be undone.</p>
              <div className="flex gap-2">
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  Yes, Delete
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
