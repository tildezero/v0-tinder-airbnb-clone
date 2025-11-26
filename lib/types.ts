export interface User {
  id: string
  name: string
  username: string
  email: string
  password: string
  dob: string
  payment: string
  bio: string
  address: string
  avatar?: string
  rating: number
  age?: number
}

export interface Property {
  id: number
  title: string
  location: string
  price: number
  rating: number
  reviews: number
  guests: number
  bedrooms: number
  bathrooms: number
  images: string[]
  host: string
  hostId?: string
  description?: string
  address?: string
  zipCode?: string
}

export interface Request {
  id: string
  propertyId: number
  propertyTitle: string
  requesterId: string
  requesterName: string
  requesterRating: number
  requesterAge?: number
  message: string
  status: "pending" | "accepted" | "rejected"
  createdAt: string
}

export interface Review {
  id: string
  propertyId: number
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: string
}

export interface Listing {
  id: string
  propertyId: number
  userId: string
  title: string
  createdAt: string
}

