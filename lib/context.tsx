"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import type { User } from "./types"
import { api } from "./api"

interface AppContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  updateUser: (userData: Partial<User>) => Promise<void>
  refreshUser: () => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Try to get user from sessionStorage on mount
    if (typeof window !== "undefined") {
      const savedUser = sessionStorage.getItem("bumblebnb_user")
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser))
        } catch (e) {
          sessionStorage.removeItem("bumblebnb_user")
        }
      }
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const savedUser = await api.getUser(email)

      if (!savedUser) {
        return false
      }

      // In a real app, password would be hashed and compared server-side
      // For this demo, we're storing it in the database
      if (savedUser.password !== password) {
        return false
      }

      // Remove password before storing
      const { password: _, ...userWithoutPassword } = savedUser
      setUser(userWithoutPassword as User)
      if (typeof window !== "undefined") {
        sessionStorage.setItem("bumblebnb_user", JSON.stringify(userWithoutPassword))
      }
      return true
    } catch (error) {
      return false
    }
  }

  const logout = () => {
    setUser(null)
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("bumblebnb_user")
    }
  }

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return
    try {
      const updated = await api.updateUser(user.id, userData)
      const { password: _, ...userWithoutPassword } = updated
      setUser(userWithoutPassword as User)
      if (typeof window !== "undefined") {
        sessionStorage.setItem("bumblebnb_user", JSON.stringify(userWithoutPassword))
      }
    } catch (error) {
      console.error("Failed to update user:", error)
    }
  }

  const refreshUser = async () => {
    if (!user) return
    try {
      const refreshed = await api.getUser(user.email)
      if (refreshed) {
        const { password: _, ...userWithoutPassword } = refreshed
        setUser(userWithoutPassword as User)
        if (typeof window !== "undefined") {
          sessionStorage.setItem("bumblebnb_user", JSON.stringify(userWithoutPassword))
        }
      }
    } catch (error) {
      console.error("Failed to refresh user:", error)
    }
  }

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
