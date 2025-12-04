// API client functions to replace localStorage

export const api = {
  // -------------------------
  // AUTH
  // -------------------------
  async login(email: string, password: string) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) throw new Error("Invalid email or password")
    return res.json()
  },

  // -------------------------
  // USERS
  // -------------------------
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

  // -------------------------
  // PROPERTIES
  // -------------------------
  async getProperties(hostId?: string) {
    const url = hostId ? `/api/properties?hostId=${hostId}` : "/api/properties"
    const res = await fetch(url)
    const data = await res.json()

    // Always return an array
    if (Array.isArray(data)) return data
    if (Array.isArray(data.properties)) return data.properties

    return []
  },

  async createProperty(propertyData: any) {
    const res = await fetch("/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(propertyData),
    })
    return res.json()
  },

  async deleteProperty(propertyId: string, hostId: string) {
    const res = await fetch(`/api/properties?id=${propertyId}&hostId=${hostId}`, {
      method: "DELETE",
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || "Failed to delete property")
    }
    return res.json()
  },

  // -------------------------
  // REQUESTS
  // -------------------------
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

  // -------------------------
  // BOOKINGS (REGULAR USER)
  // -------------------------
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

  // -------------------------
  // REVIEWS (REGULAR USER)
  // -------------------------
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

  async createRenterReview(reviewData: any) {
    const res = await fetch("/api/reviews/renter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewData),
    })
    if (!res.ok) throw new Error((await res.json()).error)
    return res.json()
  },

  async getRenterReviews(renterId?: string, homeownerId?: string) {
    const params = new URLSearchParams()
    if (renterId) params.append("renterId", renterId)
    if (homeownerId) params.append("homeownerId", homeownerId)

    const res = await fetch(`/api/reviews/renter?${params.toString()}`)
    return res.json()
  },

  // ============================================================
  // ADMIN ROUTES (FINAL, CLEAN, CORRECT)
  // ============================================================

  // --- LISTINGS ---
  async adminGetListings() {
    const res = await fetch("/api/admin/listings")
    const data = await res.json()
    return data.listings ?? []
  },

  async adminDeleteProperty(propertyId: string | number) {
    const res = await fetch(`/api/admin/listings?id=${propertyId}`, {
      method: "DELETE",
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || "Failed to delete property")
    }
    return res.json()
  },

  // --- USERS ---
  async adminGetUsers() {
    const res = await fetch("/api/admin/users")
    const data = await res.json()
    return data.users ?? []
  },

  // --- REVIEWS ---
  async adminGetReviews() {
    const res = await fetch("/api/admin/reviews")

    if (!res.ok) {
      console.error("Admin reviews fetch failed")
      return []
    }

    const data = await res.json()

    // Normalize every possible return type
    if (Array.isArray(data)) return data
    if (Array.isArray(data.reviews)) return data.reviews

    return []
  },

  async adminDeleteReview(id: number) {
    const res = await fetch("/api/admin/reviews", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    return res.json()
  },

  // --- BOOKINGS ---
  async adminGetBookings() {
    const res = await fetch("/api/admin/bookings")
    const data = await res.json()
    return data.bookings ?? []
  },

  async adminUpdateBookingStatus(id: number, status: string) {
    const res = await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })
    return res.json()
  },

  // ADMIN + NORMAL: Get all users
  async getUsers() {
    const res = await fetch("/api/users", {
      method: "GET",
    })

    if (!res.ok) {
      console.error("Failed to fetch users")
      return []
    }

    const data = await res.json()

    // Guarantee array
    return Array.isArray(data) ? data : data.users ?? []
  },

}
