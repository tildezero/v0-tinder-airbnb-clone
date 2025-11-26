import type { User, Property, Request, Review, Listing } from "./types"

const STORAGE_KEYS = {
  USER: "bumblebnb_user",
  PROPERTIES: "bumblebnb_properties",
  REQUESTS: "bumblebnb_requests",
  REVIEWS: "bumblebnb_reviews",
  LISTINGS: "bumblebnb_listings",
  LIKED_PROPERTIES: "bumblebnb_liked_properties",
} as const

export const storage = {
  // User
  getUser: (): User | null => {
    if (typeof window === "undefined") return null
    const data = localStorage.getItem(STORAGE_KEYS.USER)
    return data ? JSON.parse(data) : null
  },

  setUser: (user: User): void => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  },

  clearUser: (): void => {
    if (typeof window === "undefined") return
    localStorage.removeItem(STORAGE_KEYS.USER)
  },

  // Properties
  getProperties: (): Property[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEYS.PROPERTIES)
    return data ? JSON.parse(data) : []
  },

  setProperties: (properties: Property[]): void => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties))
  },

  addProperty: (property: Property): void => {
    const properties = storage.getProperties()
    storage.setProperties([...properties, property])
  },

  // Requests
  getRequests: (): Request[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEYS.REQUESTS)
    return data ? JSON.parse(data) : []
  },

  setRequests: (requests: Request[]): void => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests))
  },

  addRequest: (request: Request): void => {
    const requests = storage.getRequests()
    storage.setRequests([...requests, request])
  },

  updateRequest: (requestId: string, updates: Partial<Request>): void => {
    const requests = storage.getRequests()
    const updated = requests.map((r) => (r.id === requestId ? { ...r, ...updates } : r))
    storage.setRequests(updated)
  },

  // Reviews
  getReviews: (): Review[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEYS.REVIEWS)
    return data ? JSON.parse(data) : []
  },

  setReviews: (reviews: Review[]): void => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews))
  },

  addReview: (review: Review): void => {
    const reviews = storage.getReviews()
    storage.setReviews([...reviews, review])
  },

  getReviewsByPropertyId: (propertyId: number): Review[] => {
    return storage.getReviews().filter((r) => r.propertyId === propertyId)
  },

  // Liked Properties
  getLikedProperties: (): number[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEYS.LIKED_PROPERTIES)
    return data ? JSON.parse(data) : []
  },

  setLikedProperties: (propertyIds: number[]): void => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.LIKED_PROPERTIES, JSON.stringify(propertyIds))
  },

  addLikedProperty: (propertyId: number): void => {
    const liked = storage.getLikedProperties()
    if (!liked.includes(propertyId)) {
      storage.setLikedProperties([...liked, propertyId])
    }
  },

  // Listings
  getListings: (): Listing[] => {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(STORAGE_KEYS.LISTINGS)
    return data ? JSON.parse(data) : []
  },

  addListing: (listing: Listing): void => {
    const listings = storage.getListings()
    storage.setListings([...listings, listing])
  },

  setListings: (listings: Listing[]): void => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings))
  },
}

