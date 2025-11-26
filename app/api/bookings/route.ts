import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const renterId = searchParams.get("renterId")
    const propertyId = searchParams.get("propertyId")

    let query = `
      SELECT b.*, p.title as property_title, p.location, p.images
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE 1=1
    `
    let params: any[] = []

    if (renterId) {
      query += " AND b.renter_id = ?"
      params.push(renterId)
    }

    if (propertyId) {
      query += " AND b.property_id = ?"
      params.push(propertyId)
    }

    query += " ORDER BY b.created_at DESC"

    const bookings = db.prepare(query).all(...params) as any[]
    const bookingsWithImages = bookings.map((booking) => ({
      ...booking,
      images: JSON.parse(booking.images || "[]"),
    }))

    return NextResponse.json(bookingsWithImages)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      property_id,
      renter_id,
      start_date,
      end_date,
      subtotal,
      guest_first_name,
      guest_last_name,
      guest_middle_initial,
      guest_email,
      guest_credit_card,
    } = data

    // Check if booking is at least 5 days in advance
    const checkInDate = new Date(start_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day
    const daysUntilCheckIn = Math.ceil((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilCheckIn < 5) {
      return NextResponse.json(
        { error: "Bookings must be made at least 5 days in advance" },
        { status: 400 }
      )
    }

    // Check if dates are available
    const conflictingBookings = db
      .prepare(
        `
      SELECT * FROM bookings 
      WHERE property_id = ? 
      AND status IN ('pending', 'confirmed')
      AND (
        (start_date <= ? AND end_date >= ?) OR
        (start_date <= ? AND end_date >= ?) OR
        (start_date >= ? AND end_date <= ?)
      )
    `
      )
      .all(property_id, start_date, start_date, end_date, end_date, start_date, end_date)

    if (conflictingBookings.length > 0) {
      return NextResponse.json({ error: "Selected dates are not available" }, { status: 400 })
    }

    // Calculate tax (12% of subtotal) and total
    const calculatedSubtotal = subtotal || 0
    const tax = calculatedSubtotal * 0.12
    const total_price = calculatedSubtotal + tax

    // Generate reservation number
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    const reservation_number = `RES-${timestamp}-${random}`

    const stmt = db.prepare(`
      INSERT INTO bookings (
        property_id, renter_id, start_date, end_date, 
        subtotal, tax, total_price, reservation_number,
        guest_first_name, guest_last_name, guest_middle_initial,
        guest_email, guest_credit_card, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
    `)

    const result = stmt.run(
      property_id,
      renter_id || null,
      start_date,
      end_date,
      calculatedSubtotal,
      tax,
      total_price,
      reservation_number,
      guest_first_name || null,
      guest_last_name || null,
      guest_middle_initial || null,
      guest_email || null,
      guest_credit_card || null
    )

    const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(result.lastInsertRowid)

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, status } = data

    const stmt = db.prepare("UPDATE bookings SET status = ? WHERE id = ?")
    stmt.run(status, id)

    const booking = db.prepare("SELECT * FROM bookings WHERE id = ?").get(id)
    return NextResponse.json(booking)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
}

