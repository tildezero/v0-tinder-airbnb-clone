export interface User {
  id: string
  name: string
  username: string
  email: string
  password: string
  account_type: "homeowner" | "renter"
  dob: string
  payment: string
  bio: string
  address: string
  avatar?: string
  rating: number
  age?: number
}

export interface Availability {
  id?: number
  property_id: number
  start_date: string
  end_date: string
  is_available?: number
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
  host_id: string
  hostId?: string
  description?: string
  address?: string
  zip_code?: string
  zipCode?: string
  availability?: Availability[]
}

export interface Request {
  id: string
  property_id: number
  propertyId?: number
  property_title: string
  propertyTitle?: string
  requester_id: string
  requesterId?: string
  requester_name: string
  requesterName?: string
  requester_rating: number
  requesterRating?: number
  requester_age?: number
  requesterAge?: number
  message: string
  status: "pending" | "accepted" | "rejected"
  created_at: string
  createdAt?: string
}

export interface Booking {
  id: number
  property_id: number
  renter_id: string
  start_date: string
  end_date: string
  total_price: number
  status: "pending" | "confirmed" | "cancelled" | "completed"
  created_at: string
  property_title?: string
  location?: string
  images?: string[]
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

