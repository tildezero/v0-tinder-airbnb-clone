"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApp } from "@/lib/context"
import { storage } from "@/lib/storage"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useApp()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    const savedUser = storage.getUser()
    
    // Check if user exists
    if (!savedUser || savedUser.email !== email) {
      // New user - redirect to signup
      router.push("/signup")
      return
    }

    // Check password
    if (savedUser.password !== password) {
      setError("Invalid email or password")
      return
    }

    // Login successful
    if (login(email, password)) {
      router.push("/swipe")
    } else {
      setError("Login failed")
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

            <Button type="submit" className="w-full" size="lg">
              Login
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
