"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Pencil, Trash2, Home, User } from "lucide-react"
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
    firstName: "",
    lastName: "",
    middleInitial: "",
    username: "",
    email: "",
    password: "",
    dob: "",
    payment: "",
    bio: "",
    address: "",
    driverLicense: "",
    driverLicenseState: "",
    defaultCreditCard: "",
  })
  const [rentalHistory, setRentalHistory] = useState<any[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    // Parse name into components
    const nameParts = (user.name || "").split(" ")
    const firstName = user.first_name || nameParts[0] || ""
    const lastName = user.last_name || nameParts[nameParts.length - 1] || ""
    const middleInitial = user.middle_initial || (nameParts.length > 2 ? nameParts[1]?.replace(".", "") : "") || ""

    setFormData({
      firstName: firstName,
      lastName: lastName,
      middleInitial: middleInitial,
      username: user.username || "",
      email: user.email || "",
      password: "",
      dob: user.dob || "",
      payment: user.payment || "",
      bio: user.bio || "",
      address: user.address || "",
      driverLicense: user.driver_license || "",
      driverLicenseState: user.driver_license_state || "",
      defaultCreditCard: user.default_credit_card || "",
    })

    loadRentalHistory()
  }, [user, router])

  const loadRentalHistory = async () => {
    if (!user) return
    try {
      const bookings = await api.getBookings(user.id)
      // Filter bookings from past 2 years
      const twoYearsAgo = new Date()
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
      const recentBookings = bookings.filter((b: any) => {
        const bookingDate = new Date(b.created_at)
        return bookingDate >= twoYearsAgo
      })
      setRentalHistory(recentBookings)
    } catch (error) {
      console.error("Failed to load rental history:", error)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      // Combine name parts
      const fullName = `${formData.firstName}${formData.middleInitial ? ` ${formData.middleInitial}.` : ""} ${formData.lastName}`.trim()
      
      const updateData: any = {
        name: fullName,
        first_name: formData.firstName,
        last_name: formData.lastName,
        middle_initial: formData.middleInitial || null,
        email: formData.email,
        dob: formData.dob || null,
        payment: formData.payment || null,
        bio: formData.bio || null,
        address: formData.address || null,
        driver_license: formData.driverLicense || null,
        driver_license_state: formData.driverLicenseState || null,
      }

      // Only update password if provided
      if (formData.password) {
        updateData.password = formData.password
      }

      // Only update default credit card for renters
      if (user.account_type === "renter") {
        updateData.default_credit_card = formData.defaultCreditCard || null
      }

      await updateUser(updateData)
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

          <div className="mb-6 p-4 bg-muted rounded-lg">
            <Label className="mb-3 block">Account Type</Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={async () => {
                  if (!user) return
                  try {
                    await updateUser({ account_type: "renter" })
                    await refreshUser()
                    alert("Account type switched to Renter!")
                  } catch (error) {
                    alert("Failed to switch account type. Please try again.")
                  }
                }}
                className={`p-4 border-2 rounded-lg transition-all text-left ${
                  user?.account_type === "renter"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <User className="w-6 h-6 mb-2" />
                <p className="font-semibold">Renter</p>
                <p className="text-xs text-muted-foreground">Find and book properties</p>
                {user?.account_type === "renter" && (
                  <p className="text-xs text-primary mt-2 font-medium">✓ Current</p>
                )}
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!user) return
                  try {
                    await updateUser({ account_type: "homeowner" })
                    await refreshUser()
                    alert("Account type switched to Homeowner!")
                  } catch (error) {
                    alert("Failed to switch account type. Please try again.")
                  }
                }}
                className={`p-4 border-2 rounded-lg transition-all text-left ${
                  user?.account_type === "homeowner"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Home className="w-6 h-6 mb-2" />
                <p className="font-semibold">Homeowner</p>
                <p className="text-xs text-muted-foreground">List and manage properties</p>
                {user?.account_type === "homeowner" && (
                  <p className="text-xs text-primary mt-2 font-medium">✓ Current</p>
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Switch between account types to access different features. You can change this anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="bg-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="middleInitial">Middle Initial</Label>
              <Input
                id="middleInitial"
                placeholder="M"
                maxLength={1}
                value={formData.middleInitial}
                onChange={(e) => setFormData({ ...formData, middleInitial: e.target.value.toUpperCase() })}
                className="bg-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="bg-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Username (cannot be changed)"
                value={formData.username}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Username cannot be changed after account creation</p>
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
              <Label htmlFor="address">Mailing Address</Label>
              <Textarea
                id="address"
                placeholder="Type in your full mailing address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="bg-input min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="driverLicense">Driver's License Number</Label>
              <Input
                id="driverLicense"
                placeholder="Enter driver's license number"
                value={formData.driverLicense}
                onChange={(e) => setFormData({ ...formData, driverLicense: e.target.value })}
                className="bg-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="driverLicenseState">State</Label>
              <Input
                id="driverLicenseState"
                placeholder="State (e.g., CA, NY)"
                maxLength={2}
                value={formData.driverLicenseState}
                onChange={(e) => setFormData({ ...formData, driverLicenseState: e.target.value.toUpperCase() })}
                className="bg-input"
              />
            </div>

            {user?.account_type === "renter" && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="defaultCreditCard">Default Credit Card</Label>
                <Input
                  id="defaultCreditCard"
                  placeholder="Enter credit card number"
                  value={formData.defaultCreditCard}
                  onChange={(e) => setFormData({ ...formData, defaultCreditCard: e.target.value })}
                  className="bg-input"
                />
                <p className="text-xs text-muted-foreground">This will be used as your default payment method</p>
              </div>
            )}
          </div>

          {user?.account_type === "renter" && rentalHistory.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Rental History (Past 2 Years)</h2>
              <div className="space-y-4">
                {rentalHistory.map((booking: any) => (
                  <div key={booking.id} className="bg-muted rounded-lg p-4 border border-border">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{booking.property_title}</h3>
                        <p className="text-sm text-muted-foreground">{booking.location}</p>
                      </div>
                      <span className="text-sm font-semibold">${booking.total_price.toFixed(2)}</span>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>
                        {new Date(booking.start_date).toLocaleDateString("en-GB")} -{" "}
                        {new Date(booking.end_date).toLocaleDateString("en-GB")}
                      </span>
                      <span>Reservation: {booking.reservation_number}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
