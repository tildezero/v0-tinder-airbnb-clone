// API client functions to replace localStorage

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      throw new Error("Invalid email or password")
    }
    return res.json()
  },

  // Users
  async getUser(email: string) {
    const res = await fetch(`/api/users?email=${encodeURIComponent(email)}`)
    return res.json()
  },

  async createUser(userData: any) {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    })
    return res.json()
  },

  async updateUser(userId: string, updates: any) {
    const res = await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, ...updates }),
    })
    return res.json()
  },

  // Properties
  async getProperties(hostId?: string) {
    const url = hostId ? `/api/properties?hostId=${hostId}` : "/api/properties"
    const res = await fetch(url)
    return res.json()
  },

  async createProperty(propertyData: any) {
    const res = await fetch("/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(propertyData),
    })
    return res.json()
  },

  // Requests
  async getRequests(hostId?: string, requesterId?: string) {
    const params = new URLSearchParams()
    if (hostId) params.append("hostId", hostId)
    if (requesterId) params.append("requesterId", requesterId)
    const res = await fetch(`/api/requests?${params.toString()}`)
    return res.json()
  },

  async createRequest(requestData: any) {
    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    })
    return res.json()
  },

  async updateRequest(requestId: string, status: string) {
    const res = await fetch("/api/requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: requestId, status }),
    })
    return res.json()
  },

  // Bookings
  async getBookings(renterId?: string, propertyId?: string) {
    const params = new URLSearchParams()
    if (renterId) params.append("renterId", renterId)
    if (propertyId) params.append("propertyId", propertyId)
    const res = await fetch(`/api/bookings?${params.toString()}`)
    return res.json()
  },

  async createBooking(bookingData: any) {
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData),
    })
    return res.json()
  },

  async updateBooking(bookingId: number, status: string) {
    const res = await fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: bookingId, status }),
    })
    return res.json()
  },

  // Reviews
  async getReviews(propertyId?: string, userId?: string) {
    const params = new URLSearchParams()
    if (propertyId) params.append("propertyId", propertyId)
    if (userId) params.append("userId", userId)
    const res = await fetch(`/api/reviews?${params.toString()}`)
    return res.json()
  },

  async createReview(reviewData: any) {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewData),
    })
    return res.json()
  },
}

