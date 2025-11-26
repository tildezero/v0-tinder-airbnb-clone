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
  first_name?: string
  last_name?: string
  middle_initial?: string
  driver_license?: string
  driver_license_state?: string
  default_credit_card?: string
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
  renter_id?: string
  start_date: string
  end_date: string
  total_price: number
  subtotal?: number
  tax?: number
  status: "pending" | "confirmed" | "cancelled" | "completed"
  created_at: string
  property_title?: string
  location?: string
  images?: string[]
  reservation_number?: string
  guest_first_name?: string
  guest_last_name?: string
  guest_middle_initial?: string
  guest_email?: string
  guest_credit_card?: string
}

export interface Review {
  id: string
  propertyId: number
  userId: string
  userName: string
  rating: number // 1-5 stars
  comment: string
  createdAt: string
  reservation_number: string
  stay_start_date?: string
  stay_end_date?: string
}

export interface Listing {
  id: string
  propertyId: number
  userId: string
  title: string
  createdAt: string
}

