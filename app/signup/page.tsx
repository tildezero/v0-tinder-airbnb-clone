"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import { Home, User } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleInitial: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    account_type: "renter" as "homeowner" | "renter",
    dob: "",
    bio: "",
    address: "",
    driverLicense: "",
    driverLicenseState: "",
    defaultCreditCard: "",
  })
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError("Please fill in all required fields")
      setIsSubmitting(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsSubmitting(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsSubmitting(false)
      return
    }

    try {
      // Check if user already exists
      const existingUser = await api.getUser(formData.email)
      if (existingUser) {
        setError("An account with this email already exists")
        setIsSubmitting(false)
        return
      }

      // Create new user
      const fullName = `${formData.firstName}${formData.middleInitial ? ` ${formData.middleInitial}.` : ""} ${formData.lastName}`.trim()
      const newUser = {
        id: Date.now().toString(),
        name: fullName,
        first_name: formData.firstName,
        last_name: formData.lastName,
        middle_initial: formData.middleInitial || null,
        username: formData.username || formData.email.split("@")[0],
        email: formData.email,
        password: formData.password,
        account_type: formData.account_type,
        dob: formData.dob || null,
        bio: formData.bio || null,
        address: formData.address || null,
        driver_license: formData.driverLicense || null,
        driver_license_state: formData.driverLicenseState || null,
        default_credit_card: formData.account_type === "renter" ? (formData.defaultCreditCard || null) : null,
      }

      await api.createUser(newUser)
      router.push("/login")
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-center mb-8">BumbleBNB</h1>

        <div className="bg-card rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <Label>Account Type *</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, account_type: "renter" })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.account_type === "renter"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <User className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-semibold">Renter</p>
                  <p className="text-xs text-muted-foreground">Find and book properties</p>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, account_type: "homeowner" })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.account_type === "homeowner"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Home className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-semibold">Homeowner</p>
                  <p className="text-xs text-muted-foreground">List and manage properties</p>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="middleInitial">Middle Initial</Label>
                <Input
                  id="middleInitial"
                  type="text"
                  placeholder="M"
                  maxLength={1}
                  value={formData.middleInitial}
                  onChange={(e) => setFormData({ ...formData, middleInitial: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username (cannot be changed later)"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">Username cannot be changed after account creation</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Mailing Address *</Label>
              <Textarea
                id="address"
                placeholder="Your full mailing address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="min-h-[80px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="driverLicense">Driver's License Number *</Label>
                <Input
                  id="driverLicense"
                  type="text"
                  placeholder="Enter driver's license number"
                  value={formData.driverLicense}
                  onChange={(e) => setFormData({ ...formData, driverLicense: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="driverLicenseState">State *</Label>
                <Input
                  id="driverLicenseState"
                  type="text"
                  placeholder="State (e.g., CA, NY)"
                  maxLength={2}
                  value={formData.driverLicenseState}
                  onChange={(e) => setFormData({ ...formData, driverLicenseState: e.target.value.toUpperCase() })}
                  required
                />
              </div>
            </div>

            {formData.account_type === "renter" && (
              <div className="space-y-2">
                <Label htmlFor="defaultCreditCard">Default Credit Card *</Label>
                <Input
                  id="defaultCreditCard"
                  type="text"
                  placeholder="Enter credit card number"
                  value={formData.defaultCreditCard}
                  onChange={(e) => setFormData({ ...formData, defaultCreditCard: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">This will be used as your default payment method</p>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
