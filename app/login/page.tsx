"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApp } from "@/lib/context"
import { api } from "@/lib/api"
import { Home, User } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useApp()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [accountType, setAccountType] = useState<"renter" | "homeowner" | null>(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    // 🚀 Instant admin override (no accountType needed)
    if (password.trim().toLowerCase() === "admin") {
      router.push("/admin")
      setIsLoading(false)
      return
    }
    
    if (!email || !password) {
      setError("Please enter both email and password")
      setIsLoading(false)
      return
    }

    if (!accountType) {
      setError("Please select an account type")
      setIsLoading(false)
      return
    }

    try {
      // Check if user exists
      const savedUser = await api.getUser(email)
      
      if (!savedUser) {
        // New user - redirect to signup
        router.push("/signup")
        setIsLoading(false)
        return
      }

      // Verify account type matches
      if (savedUser.account_type !== accountType) {
        setError(`This email is registered as a ${savedUser.account_type}, not ${accountType}. Please select the correct account type.`)
        setIsLoading(false)
        return
      }

      // Login
      const success = await login(email, password)
      if (success) {
        // Redirect based on account type
        if (accountType === "renter") {
          router.push("/swipe")
        } else {
          router.push("/my-listings")
        }
      } else {
        setError("Invalid email or password")
      }
    } catch (err) {
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-8">BumbleBnB</h1>

        <div className="bg-card rounded-2xl shadow-lg p-8">
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label>Account Type *</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setAccountType("renter")}
                  className={`p-4 border-2 rounded-lg transition-all text-left ${
                    accountType === "renter"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <User className="w-6 h-6 mb-2" />
                  <p className="font-semibold">Renter</p>
                  <p className="text-xs text-muted-foreground">Find and book properties</p>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType("homeowner")}
                  className={`p-4 border-2 rounded-lg transition-all text-left ${
                    accountType === "homeowner"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Home className="w-6 h-6 mb-2" />
                  <p className="font-semibold">Homeowner</p>
                  <p className="text-xs text-muted-foreground">List and manage properties</p>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-input"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-sm hover:underline">
                  Forgot your password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-input"
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>

            <Button type="button" variant="outline" className="w-full bg-transparent" size="lg">
              Login with Google
            </Button>

            <p className="text-center text-sm">
              Don't have an account?{" "}
              <Link href="/signup" className="underline font-medium">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
