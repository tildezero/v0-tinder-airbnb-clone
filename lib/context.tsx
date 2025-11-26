"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import type { User } from "./types"
import { storage } from "./storage"

interface AppContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const savedUser = storage.getUser()
    if (savedUser) {
      setUser(savedUser)
    }
  }, [])

  const login = (email: string, password: string): boolean => {
    // Check against localStorage
    const savedUser = storage.getUser()
    
    if (savedUser && savedUser.email === email && savedUser.password === password) {
      setUser(savedUser)
      return true
    }

    return false
  }

  const logout = () => {
    storage.clearUser()
    setUser(null)
    // Router navigation should be handled in the component calling logout
  }

  const updateUser = (userData: Partial<User>) => {
    if (!user) return
    const updatedUser = { ...user, ...userData }
    storage.setUser(updatedUser)
    setUser(updatedUser)
  }

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
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

